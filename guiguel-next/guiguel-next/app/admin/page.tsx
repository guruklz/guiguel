"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, Empty, PageHeader, Panel, Ready, Row, Tile } from "@/components/app/common";
import { useSession } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { fmtDateTime, rate } from "@/lib/domain";

const ROLE: Record<string, string> = { admin: "Administrador", manager: "Gestor", technician: "Técnico", viewer: "Leitura" };

export default function AdminPage() {
  const { user } = useSession();
  const { state, toggleProfile } = useStore();
  if (user && user.role !== "admin") return <Card className="p-6 text-sm">Acesso restrito a administradores.</Card>;
  const done = state.orders.filter((o) => o.status === "done").length;
  return (
    <Ready>
      <PageHeader title="Admin"><Badge tone="warn">Perfil: Administrador</Badge></PageHeader>
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile color="#27272a" value={state.profiles.filter((p) => p.active).length} label="Usuários ativos" />
        <Tile color="#2f5f9e" value={state.orders.length} label="OS no sistema" />
        <Tile color="#15803d" value={rate(state.orders.length, done) + "%"} label="Taxa de conclusão" />
        <Tile color="#c2410c" value={state.audit.length} label="Ações registradas" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={`Equipe (${state.profiles.length})`}>
          <DataTable head={["Nome", "Papel", "Situação", ""]}
            rows={state.profiles.map((p) => [p.full_name, ROLE[p.role], <Badge key="b" tone={p.active ? "ok" : "bad"}>{p.active ? "Ativo" : "Inativo"}</Badge>, <Button key="t" size="sm" variant="outline" onClick={() => toggleProfile(p.id)}>{p.active ? "Desativar" : "Ativar"}</Button>])} />
        </Panel>
        <Panel title="Auditoria, últimas ações">
          {state.audit.length ? state.audit.slice(0, 15).map((a) => <Row key={a.id} title={a.action} meta={`${a.user_name}, ${fmtDateTime(a.created_at)}`} />) : <Empty>Nenhuma ação registrada.</Empty>}
        </Panel>
      </div>
    </Ready>
  );
}
