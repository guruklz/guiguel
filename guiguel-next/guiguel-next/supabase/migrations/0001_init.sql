-- Guiguel Gestão de Manutenção: schema inicial.
-- Regra do projeto: TODA tabela com RLS ligado e políticas explícitas.

create extension if not exists pgcrypto;

-- ============ Papéis e perfis ============
create type public.app_role as enum ('admin', 'manager', 'technician', 'viewer');

create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null default '',
  role       public.app_role not null default 'viewer',
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Cria o perfil automaticamente no cadastro (sempre como 'viewer'; promoção só por admin).
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)));
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Funções de checagem de papel (usadas nas políticas; rodam no servidor, nunca só no front).
create or replace function public.current_role() returns public.app_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and active
$$;
create or replace function public.has_role(variadic roles public.app_role[]) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role() = any (roles), false)
$$;

-- ============ Equipamentos ============
create type public.asset_status as enum ('running', 'stopped');

create table public.assets (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null,
  short_label text not null default '',
  type        text not null,
  sector      text not null,
  product     text not null default '',
  status      public.asset_status not null default 'running',
  map_x int, map_y int, map_w int, map_h int,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index assets_sector_idx on public.assets (sector);
create index assets_status_idx on public.assets (status);
create trigger assets_touch before update on public.assets for each row execute function public.touch_updated_at();

create table public.maintenance_plans (
  id            uuid primary key default gen_random_uuid(),
  asset_id      uuid not null references public.assets (id) on delete cascade,
  task          text not null,
  interval_days int  not null check (interval_days > 0),
  last_done     date not null default current_date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index plans_asset_idx on public.maintenance_plans (asset_id);
create trigger plans_touch before update on public.maintenance_plans for each row execute function public.touch_updated_at();

create table public.plan_executions (
  id         uuid primary key default gen_random_uuid(),
  plan_id    uuid not null references public.maintenance_plans (id) on delete cascade,
  done_on    date not null default current_date,
  done_by    uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index plan_exec_plan_idx on public.plan_executions (plan_id, done_on);
create trigger plan_exec_touch before update on public.plan_executions for each row execute function public.touch_updated_at();

-- ============ Ordens de serviço (ID único: OS-000123) ============
create type public.os_status as enum ('open', 'in_progress', 'done');
create type public.os_priority as enum ('low', 'medium', 'high');

create table public.work_orders (
  id               uuid primary key default gen_random_uuid(),
  seq              bigint generated always as identity unique,
  code             text generated always as ('OS-' || lpad(seq::text, 6, '0')) stored,
  asset_id         uuid not null references public.assets (id),
  description      text not null check (char_length(description) between 3 and 1000),
  priority         public.os_priority not null default 'medium',
  status           public.os_status not null default 'open',
  service_type     text not null default '',
  maintenance_type text not null default '',
  category         text not null default '',
  location         text not null default '',
  installation_site text not null default '',
  tag              text not null default '',
  scheduled_at     timestamptz,
  est_days         int,
  est_hours        text not null default '',
  assignee_id      uuid references public.profiles (id),
  crew_size        int not null default 1 check (crew_size between 1 and 50),
  started_at       timestamptz,
  finished_at      timestamptz,
  comment          text not null default '',
  pending          boolean not null default false,
  due_date         date,
  details          jsonb not null default '{}'::jsonb, -- equipe, tarefas, segurança, materiais, custos, assinatura, anexos
  created_by       uuid references public.profiles (id) default auth.uid(),
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index wo_asset_idx on public.work_orders (asset_id);
create index wo_status_idx on public.work_orders (status, due_date);
create index wo_created_idx on public.work_orders (created_at);
create trigger wo_touch before update on public.work_orders for each row execute function public.touch_updated_at();

-- Estatística mensal (alimenta "em agosto tivemos 200 OS criadas e 190 concluídas").
create view public.os_monthly_stats with (security_invoker = true) as
select to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
       count(*)                                              as created,
       count(*) filter (where status = 'done')               as done
from public.work_orders group by 1 order by 1;

-- ============ Estoque, paradas, cadastros, auditoria ============
create table public.stock_items (
  id uuid primary key default gen_random_uuid(),
  code text not null unique, name text not null,
  qty int not null default 0 check (qty >= 0), min_qty int not null default 0 check (min_qty >= 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create trigger stock_touch before update on public.stock_items for each row execute function public.touch_updated_at();

create table public.downtimes (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets (id) on delete cascade,
  started_at timestamptz not null default now(), ended_at timestamptz,
  reason text not null default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index downtimes_asset_idx on public.downtimes (asset_id, started_at desc);
create trigger downtimes_touch before update on public.downtimes for each row execute function public.touch_updated_at();

-- TAGs, LIs, fornecedores, ferramentas, documentos etc. (cadastros simples)
create table public.registry_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (char_length(kind) <= 40),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index registry_kind_idx on public.registry_items (kind);
create trigger registry_touch before update on public.registry_items for each row execute function public.touch_updated_at();

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) default auth.uid(),
  action text not null check (char_length(action) <= 500),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index audit_created_idx on public.audit_log (created_at desc);

-- ============ RLS (explícito em todas as tabelas) ============
alter table public.profiles          enable row level security;
alter table public.assets            enable row level security;
alter table public.maintenance_plans enable row level security;
alter table public.plan_executions   enable row level security;
alter table public.work_orders       enable row level security;
alter table public.stock_items       enable row level security;
alter table public.downtimes         enable row level security;
alter table public.registry_items    enable row level security;
alter table public.audit_log         enable row level security;

-- profiles: todos logados leem; cada um edita só o próprio nome; só admin muda papel/ativo ou apaga.
create policy profiles_select on public.profiles for select to authenticated using (true);
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
create policy profiles_admin_update on public.profiles for update to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));
create policy profiles_admin_delete on public.profiles for delete to authenticated using (public.has_role('admin'));

-- Leitura para qualquer usuário ativo; escrita por papel.
do $$
declare t text;
begin
  foreach t in array array['assets','maintenance_plans','plan_executions','work_orders','stock_items','downtimes','registry_items'] loop
    execute format('create policy %I on public.%I for select to authenticated using (public.current_role() is not null)', t || '_select', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.has_role(''admin'',''manager'',''technician''))', t || '_insert', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.has_role(''admin'',''manager'',''technician'')) with check (public.has_role(''admin'',''manager'',''technician''))', t || '_update', t);
    execute format('create policy %I on public.%I for delete to authenticated using (public.has_role(''admin'',''manager''))', t || '_delete', t);
  end loop;
end $$;

-- audit_log: qualquer logado registra a própria ação (nunca em nome de outro); só admin/gestor lê; ninguém edita/apaga.
create policy audit_insert on public.audit_log for insert to authenticated with check (user_id = auth.uid());
create policy audit_select on public.audit_log for select to authenticated using (public.has_role('admin', 'manager'));
