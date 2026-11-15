# Guiguel: Gestão de Manutenção

Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Recharts + Lucide + Supabase (pronto para ligar). Padrão Kotim.

## Rodar

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Sem configuração nenhuma o app roda em **modo demonstração**: login de mentira (qualquer e-mail/senha) e dados no `localStorage` do navegador, com tipos idênticos aos do banco (`lib/types.ts`).

## Telas

`/` apresentação (com vídeo) · `/login` · `/painel` · `/mapa` · `/os` · `/pendencias` · `/paradas` · `/planos` (calendário) · `/diario` · `/equipamentos` · `/estoque` · `/cadastros/[tags|lis|locais|regioes|pecas|transferencias|fornecedores|requisicoes|ferramentas|recursos|documentos|calendarios|checklists|medicoes]` · `/analises` · `/relatorios` · `/admin`

## Ligar o Supabase (etapa 2)

1. Crie um projeto em supabase.com e rode `supabase/migrations/0001_init.sql` (e, se quiser, `supabase/seed.sql`) no SQL Editor.
2. Copie `.env.example` para `.env.local` e preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Crie o primeiro usuário em Authentication e promova a admin: `update public.profiles set role='admin' where id='<uuid>';`
4. Com as variáveis presentes, o login passa a usar `supabase.auth` e o `proxy.ts` bloqueia as rotas privadas (e `/admin` por papel) no servidor.
5. **Falta trocar** o `lib/store.tsx` (localStorage) por consultas ao Supabase. As ações já estão separadas (createOrder, setOrderStatus, ...), então a troca é por ação. Gere os tipos com `npx supabase gen types typescript --project-id <id> > lib/database.types.ts`.

Segurança já considerada: RLS em todas as tabelas, papéis checados no banco, `service_role` nunca no front, validação com zod nos formulários, limite de tentativas no login. Antes de abrir qualquer rota pública que escreva dados, adicionar rate limit e captcha (Turnstile).

## Deploy

Vercel (variáveis de ambiente lá, nunca no Git). Para app de celular/desktop: Capacitor (iOS/Android) e Tauri (.exe) apontando para o site publicado.

## Offline / instalar no celular

`public/sw.js` + `public/manifest.webmanifest`. Abra o site uma vez com internet, depois: iPhone (Safari) Compartilhar > Adicionar à Tela de Início; Android (Chrome) menu > Instalar app.
