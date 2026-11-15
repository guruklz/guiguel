"use client";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader, Panel, Ready, Row, Empty } from "@/components/app/common";
import { PlantMap } from "@/components/map/plant-map";
import { AssetDialog } from "@/components/map/asset-dialog";
import { useStore } from "@/lib/store";
import { assetReasons, assetState, STATE_META, type AssetState } from "@/lib/domain";
import type { Asset } from "@/lib/types";

export default function MapPage() {
  const { state } = useStore();
  const [type, setType] = React.useState("todas");
  const [tab, setTab] = React.useState<"manut" | "oper">("manut");
  const [sel, setSel] = React.useState<Asset | null>(null);
  const states = Object.fromEntries(state.assets.map((a) => [a.id, assetState(a, state.plans, state.orders)])) as Record<string, AssetState>;
  const cnt = { ok: 0, attention: 0, stopped: 0 };
  state.assets.forEach((a) => cnt[states[a.id]]++);
  const types = [...new Set(state.assets.map((a) => a.type))];
  const rows = state.assets
    .filter((a) => (tab === "manut" ? states[a.id] !== "ok" : a.status === "running"))
    .sort((a, b) => (states[a.id] === "stopped" ? 0 : 1) - (states[b.id] === "stopped" ? 0 : 1));
  return (
    <Ready>
      <PageHeader title="Mapa da fábrica">
        {["todas", ...types].map((t) => <Button key={t} size="sm" variant={type === t ? "default" : "outline"} onClick={() => setType(t)} aria-pressed={type === t}>{t === "todas" ? "Todas" : t}</Button>)}
      </PageHeader>
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge tone="ok" className="px-2.5 py-1 text-sm">{cnt.ok + cnt.attention} em operação</Badge>
        <Badge tone="warn" className="px-2.5 py-1 text-sm">{cnt.attention} precisam de manutenção</Badge>
        <Badge tone="bad" className="px-2.5 py-1 text-sm">{cnt.stopped} paradas</Badge>
      </div>
      <Card className="overflow-x-auto p-2">
        <PlantMap assets={state.assets} states={states} dimType={type} activeOrders={state.orders.filter((o) => o.status !== "done").length} onSelect={setSel} />
      </Card>
      <p className="mt-2 text-xs text-muted-foreground">Toque numa máquina para ver os detalhes. Verde: em operação. Âmbar: precisa de manutenção. Vermelho: parada. Faixas vermelhas: circulação segura. No celular, arraste o mapa para os lados.</p>
      <Panel title="Máquinas" className="mt-4">
        <div className="mb-2 flex gap-2">
          <Button size="sm" variant={tab === "manut" ? "default" : "outline"} onClick={() => setTab("manut")}>Precisam de manutenção</Button>
          <Button size="sm" variant={tab === "oper" ? "default" : "outline"} onClick={() => setTab("oper")}>Em operação</Button>
        </div>
        {rows.length ? rows.map((a) => {
          const st = states[a.id];
          return <Row key={a.id} title={a.name} meta={<>{a.sector}, {a.product}{tab === "manut" && assetReasons(a, state.plans, state.orders).length ? <><br />{assetReasons(a, state.plans, state.orders).join("; ")}</> : null}</>}
            right={<><Badge tone={STATE_META[st].tone}>{STATE_META[st].label}</Badge><Button size="sm" variant="outline" onClick={() => setSel(a)}>Detalhes</Button></>} />;
        }) : <Empty>Nenhuma máquina nesta lista.</Empty>}
      </Panel>
      <AssetDialog asset={sel} onClose={() => setSel(null)} />
    </Ready>
  );
}
