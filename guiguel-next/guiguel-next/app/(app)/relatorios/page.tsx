"use client";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, Empty, PageHeader, Panel, Ready } from "@/components/app/common";
import { useStore } from "@/lib/store";
import { fmtDate, monthlyStats, monthName, osCode, rate, STATUS_LABEL } from "@/lib/domain";

export default function ReportsPage() {
  const { state } = useStore();
  const name = (id: string) => state.assets.find((a) => a.id === id)?.name ?? "";
  const pending = state.orders.filter((o) => o.status !== "done");
  const stopped = state.assets.filter((a) => a.status === "stopped");
  const low = state.stock.filter((i) => i.qty < i.min_qty);
  return (
    <Ready>
      <PageHeader title="Relatórios"><Button onClick={() => window.print()}><Printer className="h-4 w-4" />Imprimir ou salvar em PDF</Button></PageHeader>
      <div className="space-y-4">
        <Panel title="OS por mês"><DataTable head={["Mês", "Criadas", "Concluídas", "Taxa"]} rows={monthlyStats(state).map((d) => [<span key="m" className="capitalize">{monthName(d.month)}</span>, d.created, d.done, rate(d.created, d.done) + "%"])} /></Panel>
        <Panel title="OS pendentes">{pending.length ? <DataTable head={["ID", "Equipamento", "Descrição", "Executante", "Prazo", "Status"]} rows={pending.map((o) => [osCode(o.seq), name(o.asset_id), o.description, o.assignee, fmtDate(o.due_date), STATUS_LABEL[o.status]])} /> : <Empty>Nada a listar.</Empty>}</Panel>
        <Panel title="Equipamentos parados">{stopped.length ? <DataTable head={["Equipamento", "Setor", "Produto"]} rows={stopped.map((a) => [a.name, a.sector, a.product])} /> : <Empty>Nada a listar.</Empty>}</Panel>
        <Panel title="Peças abaixo do estoque mínimo">{low.length ? <DataTable head={["Código", "Peça", "Em estoque", "Mínimo"]} rows={low.map((i) => [i.code, i.name, i.qty, i.min_qty])} /> : <Empty>Nada a listar.</Empty>}</Panel>
      </div>
    </Ready>
  );
}
