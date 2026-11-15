"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderDetailDialog } from "@/components/os/order-detail";
import { useStore } from "@/lib/store";
import { fmtDate, isLate, osCode, PRIORITY_BAR, PRIORITY_LABEL, STATUS_LABEL, STATUS_TONE } from "@/lib/domain";
import type { WorkOrder } from "@/lib/types";
import { cn } from "@/lib/utils";

export function OrderCard({ o }: { o: WorkOrder }) {
  const { state, setOrderStatus } = useStore();
  const asset = state.assets.find((a) => a.id === o.asset_id);
  const late = isLate(o);
  return (
    <div className={cn("mb-2 flex flex-wrap items-center justify-between gap-3 rounded-md border border-l-4 border-border bg-card p-4", PRIORITY_BAR[o.priority])}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xs">{osCode(o.seq)}</span>
          <span>{o.description}</span>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {asset?.name}, {o.assignee}{o.maintenance_type ? `, ${o.maintenance_type}` : ""}, prioridade {PRIORITY_LABEL[o.priority].toLowerCase()}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}{o.pending ? " (pendente de execução)" : ""}</Badge>
        <span className={cn("text-xs", late ? "font-semibold text-bad" : "text-muted-foreground")}>{late ? "Atrasada, " : "Prazo "}{fmtDate(o.due_date)}</span>
        <OrderDetailDialog order={o} />
        {o.status === "open" && <Button size="sm" onClick={() => setOrderStatus(o.id, "in_progress")}>Iniciar</Button>}
        {o.status === "in_progress" && <Button size="sm" onClick={() => setOrderStatus(o.id, "done")}>Concluir</Button>}
      </div>
    </div>
  );
}
