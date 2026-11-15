"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, PageHeader, Panel, Ready, Row } from "@/components/app/common";
import { OrderCard } from "@/components/os/order-card";
import { useStore } from "@/lib/store";
import { fmtDate, nextDue, planSit } from "@/lib/domain";

export default function PendingPage() {
  const { state, registerExecution, orderFromPlan } = useStore();
  const os = state.orders.filter((o) => o.status !== "done").sort((a, b) => ((a.due_date ?? "9") < (b.due_date ?? "9") ? -1 : 1));
  const plans = state.plans.filter((p) => planSit(p).tone !== "ok").sort((a, b) => (nextDue(a) < nextDue(b) ? -1 : 1));
  return (
    <Ready>
      <PageHeader title="Pendências" />
      <h2 className="mb-2 text-sm font-semibold">OS pendentes ({os.length})</h2>
      {os.length ? os.map((o) => <OrderCard key={o.id} o={o} />) : <Card><Empty>Nada pendente.</Empty></Card>}
      <Panel title={`Preventivas vencidas ou perto de vencer (${plans.length})`} className="mt-4">
        {plans.length ? plans.map((p) => (
          <Row key={p.id} title={p.task} meta={`${state.assets.find((a) => a.id === p.asset_id)?.name}, próxima ${fmtDate(nextDue(p))}`}
            right={<><Badge tone={planSit(p).tone}>{planSit(p).label}</Badge><Button size="sm" onClick={() => registerExecution(p.id)}>Registrar execução</Button><Button size="sm" variant="outline" onClick={() => orderFromPlan(p.id)}>Gerar OS</Button></>} />
        )) : <Empty>Nenhuma preventiva pendente.</Empty>}
      </Panel>
    </Ready>
  );
}
