"use client";
import * as React from "react";
import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Select } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { DataTable, PageHeader, Panel, Ready, Tile } from "@/components/app/common";
import { MonthlyChart } from "@/components/charts/monthly-chart";
import { useStore } from "@/lib/store";
import { monthlyStats, monthName, rate } from "@/lib/domain";

export default function AnalyticsPage() {
  const { state } = useStore();
  const data = monthlyStats(state);
  const [pick, setPick] = React.useState("2026-08");
  const cur = data.find((d) => d.month === pick) ?? data[data.length - 1];
  const types = Object.entries(state.orders.reduce<Record<string, number>>((m, o) => { const k = o.maintenance_type || "Não informado"; m[k] = (m[k] || 0) + 1; return m; }, {})).map(([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n);
  return (
    <Ready>
      <PageHeader title="Análises">
        <Select value={cur.month} onChange={(e) => setPick(e.target.value)} aria-label="Mês" className="w-auto capitalize">{data.map((d) => <option key={d.month} value={d.month}>{monthName(d.month)}</option>)}</Select>
      </PageHeader>
      <Card className="mb-4 p-4">
        <p className="text-xl font-semibold">Em {monthName(cur.month)} tivemos {cur.created} OS criadas e {cur.done} concluídas.</p>
        <p className="text-sm text-muted-foreground">Taxa de conclusão de {rate(cur.created, cur.done)}%.{cur.live ? " Mês em andamento." : ""}</p>
      </Card>
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile color="#2f5f9e" value={cur.created} label="OS criadas" />
        <Tile color="#15803d" value={cur.done} label="OS concluídas" />
        <Tile color="#27272a" value={rate(cur.created, cur.done) + "%"} label="Taxa de conclusão" />
        <Tile color="#c2410c" value={cur.created - cur.done} label="Ficaram em aberto" />
      </div>
      <Panel title="OS criadas e concluídas por mês"><MonthlyChart /></Panel>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Resumo por mês">
          <DataTable head={["Mês", "Criadas", "Concluídas", "Taxa"]} rows={data.map((d) => [<span key="m" className="capitalize">{monthName(d.month)}</span>, d.created, d.done, rate(d.created, d.done) + "%"])} />
        </Panel>
        <Panel title="OS por tipo de manutenção">
          <div className="h-48"><ResponsiveContainer width="100%" height="100%"><BarChart data={types} layout="vertical" margin={{ left: 10, right: 24 }}><XAxis type="number" hide /><YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: "var(--muted)" }} formatter={(v) => [`${v} OS`, "Total"]} /><Bar dataKey="n" fill="var(--info)" radius={3}><LabelList dataKey="n" position="right" fontSize={12} fill="var(--foreground)" /></Bar></BarChart></ResponsiveContainer></div>
        </Panel>
      </div>
    </Ready>
  );
}
