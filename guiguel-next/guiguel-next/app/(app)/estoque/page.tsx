"use client";
import { Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, PageHeader, Ready } from "@/components/app/common";
import { useStore } from "@/lib/store";

export default function StockPage() {
  const { state, adjustStock } = useStore();
  return (
    <Ready>
      <PageHeader title="Estoque de Peças" />
      <Card className="px-2">
        <DataTable head={["Código", "Peça", "Quantidade", "Mínimo", "Situação"]}
          rows={state.stock.map((i) => [
            i.code, i.name,
            <span key="q" className="inline-flex items-center gap-2"><Button size="icon" variant="outline" onClick={() => adjustStock(i.id, -1)} aria-label={`Retirar ${i.name}`}><Minus className="h-4 w-4" /></Button><b className="min-w-6 text-center">{i.qty}</b><Button size="icon" variant="outline" onClick={() => adjustStock(i.id, 1)} aria-label={`Adicionar ${i.name}`}><Plus className="h-4 w-4" /></Button></span>,
            i.min_qty, <Badge key="s" tone={i.qty < i.min_qty ? "bad" : "ok"}>{i.qty < i.min_qty ? "Repor" : "Ok"}</Badge>,
          ])} />
      </Card>
    </Ready>
  );
}
