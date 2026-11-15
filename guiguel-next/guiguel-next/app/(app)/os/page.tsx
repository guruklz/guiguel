"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { Empty, PageHeader, Ready } from "@/components/app/common";
import { OrderCard } from "@/components/os/order-card";
import { NewOrderDialog } from "@/components/os/new-order";
import { useStore } from "@/lib/store";
import { osCode } from "@/lib/domain";

const FILTERS = [["pendentes", "Pendentes"], ["todas", "Todas"], ["in_progress", "Em andamento"], ["done", "Concluídas"]] as const;

export default function OrdersPage() {
  const { state } = useStore();
  const [filter, setFilter] = React.useState<string>("pendentes");
  const [q, setQ] = React.useState("");
  const list = state.orders
    .filter((o) => (filter === "todas" ? true : filter === "pendentes" ? o.status !== "done" : o.status === filter))
    .filter((o) => `${osCode(o.seq)} ${o.description} ${state.assets.find((a) => a.id === o.asset_id)?.name} ${o.assignee} ${o.maintenance_type}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.seq - a.seq);
  return (
    <Ready>
      <PageHeader title="Ordem de Serviço"><NewOrderDialog /></PageHeader>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {FILTERS.map(([v, l]) => <Button key={v} size="sm" variant={filter === v ? "default" : "outline"} onClick={() => setFilter(v)} aria-pressed={filter === v}>{l}</Button>)}
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por ID, máquina ou executante" className="min-w-52 flex-1 md:max-w-sm" aria-label="Buscar OS" />
      </div>
      {list.length ? list.map((o) => <OrderCard key={o.id} o={o} />) : <Card><Empty>Nenhuma OS encontrada.</Empty></Card>}
    </Ready>
  );
}
