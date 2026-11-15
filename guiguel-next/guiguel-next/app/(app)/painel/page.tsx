"use client";
import * as React from "react";
import { Bar, BarChart, Cell, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge, type Tone } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select } from "@/components/ui/form";
import { Empty, PageHeader, Panel, Ready, Row, Tile } from "@/components/app/common";
import { NewOrderDialog } from "@/components/os/new-order";
import { MonthlyChart } from "@/components/charts/monthly-chart";
import { useStore } from "@/lib/store";
import { assetState, fmtDate, isLate, nextDue, osCode, planSit, STATE_META, STATUS_LABEL, STATUS_TONE } from "@/lib/domain";
import type { Asset, WorkOrder } from "@/lib/types";

interface Item { title: string; meta: string; badge: string; tone: Tone }
const COLORS = ["#e7630c", "#2f5f9e", "#52525b", "#0f766e", "#a16207", "#a1a1aa"];

export default function PainelPage() {
  const { state } = useStore();
  const [reg, setReg] = React.useState("todas");
  const [list, setList] = React.useState<{ title: string; items: Item[] } | null>(null);
  const sectors = [...new Set(state.assets.map((a) => a.sector))];
  const A = state.assets.filter((a) => reg === "todas" || a.sector === reg);
  const ids = new Set(A.map((a) => a.id));
  const L = state.orders.filter((o) => ids.has(o.asset_id));
  const assetName = (id: string) => state.assets.find((a) => a.id === id)?.name ?? "";
  const aItem = (a: Asset): Item => {
    const st = assetState(a, state.plans, state.orders);
    const n = state.orders.filter((o) => o.asset_id === a.id && o.status !== "done").length;
    return { title: a.name, meta: `${a.code}, setor ${a.sector}, ${n} tarefa(s) ativa(s)`, badge: STATE_META[st].label, tone: STATE_META[st].tone };
  };
  const oItem = (o: WorkOrder): Item => ({ title: `${osCode(o.seq)} ${o.description}`, meta: `${assetName(o.asset_id)}, ${o.assignee}, prazo ${fmtDate(o.due_date)}`, badge: STATUS_LABEL[o.status], tone: STATUS_TONE[o.status] });
  const plansDue = state.plans.filter((p) => ids.has(p.asset_id) && planSit(p).tone !== "ok").sort((a, b) => (nextDue(a) < nextDue(b) ? -1 : 1));
  const stopped = A.filter((a) => a.status === "stopped");
  const running = A.filter((a) => a.status === "running");
  const attention = A.filter((a) => assetState(a, state.plans, state.orders) === "attention");
  const low = state.stock.filter((i) => i.qty < i.min_qty);
  const disp = A.length ? Math.round((100 * running.length) / A.length) : 100;
  const tiles: { color: string; value: React.ReactNode; label: string; items: Item[] }[] = [
    { color: "#27272a", value: A.length, label: "Ativos", items: A.map(aItem) },
    { color: "#b91c1c", value: stopped.length, label: "Ativos parados", items: stopped.map(aItem) },
    { color: "#c2410c", value: L.filter(isLate).length, label: "OS atrasadas", items: L.filter(isLate).map(oItem) },
    { color: "#2f5f9e", value: L.filter((o) => o.status === "in_progress").length, label: "OS em andamento", items: L.filter((o) => o.status === "in_progress").map(oItem) },
    { color: "#2f5f9e", value: L.filter((o) => o.status === "open").length, label: "OS pendentes", items: L.filter((o) => o.status === "open").map(oItem) },
    { color: "#c2410c", value: plansDue.length, label: "Preventivas vencendo", items: plansDue.map((p) => ({ title: p.task, meta: `${assetName(p.asset_id)}, próxima ${fmtDate(nextDue(p))}`, badge: planSit(p).label, tone: planSit(p).tone })) },
    { color: "#27272a", value: low.length, label: "Peças em falta", items: low.map((i) => ({ title: i.name, meta: `${i.code}, em estoque ${i.qty}, mínimo ${i.min_qty}`, badge: "Repor", tone: "bad" as Tone })) },
    { color: "#15803d", value: running.length, label: "Em operação", items: running.map(aItem) },
    { color: "#a16207", value: attention.length, label: "Precisam de manutenção", items: attention.map(aItem) },
    { color: "#15803d", value: disp + "%", label: "Disponibilidade", items: running.map(aItem) },
  ];
  const bySector = sectors.map((s) => ({ name: s, value: L.filter((o) => state.assets.find((a) => a.id === o.asset_id)?.sector === s).length })).filter((x) => x.value);
  const byTech = Object.entries(L.reduce<Record<string, number>>((m, o) => ((m[o.assignee] = (m[o.assignee] || 0) + 1), m), {})).map(([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n);
  const urgent = L.filter((o) => o.status !== "done" && (o.priority === "high" || isLate(o)));
  const h = new Date().getHours();
  return (
    <Ready>
      <PageHeader title={`${h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite"}, equipe Guiguel`}>
        <Select value={reg} onChange={(e) => setReg(e.target.value)} aria-label="Região" className="w-auto"><option value="todas">Todas as regiões</option>{sectors.map((s) => <option key={s}>{s}</option>)}</Select>
        <NewOrderDialog />
      </PageHeader>
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {tiles.map((t) => <Tile key={t.label} color={t.color} value={t.value} label={t.label} onClick={() => setList({ title: `${t.label}: ${t.items.length}`, items: t.items })} />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Total de OS por região">
          {bySector.length ? (
            <div className="flex flex-wrap items-center gap-4">
              <div className="h-44 w-44"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={bySector} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} stroke="var(--card)">{bySector.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={(v, n) => [`${v} OS`, n]} /></PieChart></ResponsiveContainer></div>
              <ul className="text-sm">{bySector.map((s, i) => <li key={s.name} className="flex items-center gap-2 py-0.5"><i className="h-3 w-3 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />{s.name}: <b>{s.value}</b></li>)}</ul>
            </div>
          ) : <Empty>Sem OS.</Empty>}
        </Panel>
        <Panel title="Total de OS por executante">
          <div className="h-44"><ResponsiveContainer width="100%" height="100%"><BarChart data={byTech} layout="vertical" margin={{ left: 10, right: 24 }}><XAxis type="number" hide /><YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: "var(--muted)" }} formatter={(v) => [`${v} OS`, "Total"]} /><Bar dataKey="n" fill="var(--info)" radius={3}><LabelList dataKey="n" position="right" fontSize={12} fill="var(--foreground)" /></Bar></BarChart></ResponsiveContainer></div>
        </Panel>
        <Panel title="OS que precisam de atenção">
          {urgent.length ? urgent.map((o) => <Row key={o.id} title={`${osCode(o.seq)} ${o.description}`} meta={assetName(o.asset_id)} right={<Badge tone={isLate(o) ? "bad" : "warn"}>{isLate(o) ? "Atrasada " : "Prazo "}{fmtDate(o.due_date)}</Badge>} />) : <Empty>Nenhuma OS urgente.</Empty>}
        </Panel>
        <Panel title="Próximas manutenções preventivas">
          {state.plans.filter((p) => ids.has(p.asset_id)).sort((a, b) => (nextDue(a) < nextDue(b) ? -1 : 1)).slice(0, 5).map((p) => <Row key={p.id} title={p.task} meta={`${assetName(p.asset_id)}, ${fmtDate(nextDue(p))}`} right={<Badge tone={planSit(p).tone}>{planSit(p).label}</Badge>} />)}
        </Panel>
      </div>
      <Panel title="OS criadas e concluídas por mês" className="mt-4"><MonthlyChart /></Panel>
      <Dialog open={!!list} onOpenChange={(v) => !v && setList(null)}>
        {list && (
          <DialogContent title={list.title} wide>
            {list.items.length ? list.items.map((it, i) => <Row key={i} title={`${i + 1}. ${it.title}`} meta={it.meta} right={<Badge tone={it.tone}>{it.badge}</Badge>} />) : <Empty>Nada por aqui.</Empty>}
          </DialogContent>
        )}
      </Dialog>
    </Ready>
  );
}
