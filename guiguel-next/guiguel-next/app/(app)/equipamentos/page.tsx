"use client";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, PageHeader, Ready } from "@/components/app/common";
import { AssetDialog } from "@/components/map/asset-dialog";
import { useStore } from "@/lib/store";
import { assetState, STATE_META } from "@/lib/domain";
import type { Asset } from "@/lib/types";

export default function AssetsPage() {
  const { state, toggleAsset } = useStore();
  const [sel, setSel] = React.useState<Asset | null>(null);
  return (
    <Ready>
      <PageHeader title="Equipamentos" />
      <Card className="px-2">
        <DataTable head={["Código", "Equipamento", "Setor", "Produto", "Tarefas ativas", "Situação", ""]}
          rows={state.assets.map((a) => {
            const st = assetState(a, state.plans, state.orders);
            return [a.code, a.name, a.sector, a.product, state.orders.filter((o) => o.asset_id === a.id && o.status !== "done").length,
              <Badge key="s" tone={STATE_META[st].tone}>{STATE_META[st].label}</Badge>,
              <span key="b" className="flex gap-2"><Button size="sm" onClick={() => setSel(a)}>Detalhes</Button><Button size="sm" variant="outline" onClick={() => toggleAsset(a.id)}>{a.status === "stopped" ? "Retomar" : "Parar"}</Button></span>];
          })} />
      </Card>
      <AssetDialog asset={sel} onClose={() => setSel(null)} />
    </Ready>
  );
}
