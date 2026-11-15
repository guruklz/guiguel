"use client";
import { Empty, PageHeader, Panel, Ready } from "@/components/app/common";
import { useStore } from "@/lib/store";
import { fmtDate, osCode } from "@/lib/domain";

export default function DiaryPage() {
  const { state } = useStore();
  const items = [
    ...state.audit.map((a) => ({ d: a.created_at.slice(0, 10), t: a.action, u: a.user_name })),
    ...state.orders.filter((o) => o.status === "done").map((o) => ({ d: o.completed_at ?? o.due_date ?? o.created_at.slice(0, 10), t: `${osCode(o.seq)} concluída: ${o.description} (${state.assets.find((a) => a.id === o.asset_id)?.name})`, u: o.assignee })),
  ].sort((a, b) => (a.d < b.d ? 1 : -1));
  let last = "";
  return (
    <Ready>
      <PageHeader title="Diário de Manutenção" />
      <Panel>
        {items.length ? items.map((e, i) => {
          const head = e.d !== last;
          last = e.d;
          return (
            <div key={i}>
              {head && <div className="pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground first:pt-0">{fmtDate(e.d)}</div>}
              <div className="border-b border-border py-2 text-sm last:border-0"><b className="font-semibold">{e.t}</b><div className="text-xs text-muted-foreground">{e.u}</div></div>
            </div>
          );
        }) : <Empty>Sem registros.</Empty>}
      </Panel>
    </Ready>
  );
}
