"use client";
import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { monthName, monthlyStats, rate } from "@/lib/domain";
import { useStore } from "@/lib/store";

export function MonthlyChart({ height = 280 }: { height?: number }) {
  const { state } = useStore();
  const data = monthlyStats(state).map((m) => ({ ...m, label: `${m.month.slice(5)}/${m.month.slice(0, 4)}${m.live ? "*" : ""}` }));
  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: 520, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "var(--muted)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const m = payload[0].payload as (typeof data)[number];
                return (
                  <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow">
                    <div className="mb-1 font-semibold capitalize">{monthName(m.month)}</div>
                    <div>{m.created} OS criadas</div>
                    <div>{m.done} concluídas ({rate(m.created, m.done)}%)</div>
                  </div>
                );
              }}
            />
            <Legend iconType="square" formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
            <Bar dataKey="created" name="Criadas" fill="var(--info)" radius={[3, 3, 0, 0]}><LabelList dataKey="created" position="top" fontSize={11} fill="var(--muted-foreground)" /></Bar>
            <Bar dataKey="done" name="Concluídas" fill="var(--ok)" radius={[3, 3, 0, 0]}><LabelList dataKey="done" position="top" fontSize={11} fill="var(--muted-foreground)" /></Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">* mês em andamento</p>
    </div>
  );
}
