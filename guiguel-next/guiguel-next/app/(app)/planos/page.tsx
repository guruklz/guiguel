"use client";
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge, type Tone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, PageHeader, Panel, Ready, Row } from "@/components/app/common";
import { useStore } from "@/lib/store";
import { addDays, fmtDate, MONTHS, nextDue, osCode, today } from "@/lib/domain";
import type { AppState, WorkOrder } from "@/lib/types";
import { cn } from "@/lib/utils";

type Kind = "done" | "pend" | "late";
interface Ev { date: string; kind: Kind; title: string; asset_id: string; plan_id?: string; order?: WorkOrder }
const iso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const META: Record<Kind, { label: string; tone: Tone; chip: string; dot: string }> = {
  done: { label: "Realizada", tone: "ok", chip: "bg-ok/15 text-ok", dot: "bg-ok" },
  pend: { label: "Pendente", tone: "info", chip: "bg-info/15 text-info", dot: "bg-info" },
  late: { label: "Atrasada", tone: "bad", chip: "bg-bad/15 text-bad", dot: "bg-bad" },
};

function events(s: AppState, from: string, to: string): Ev[] {
  const t = today();
  const E: Ev[] = [];
  s.plans.forEach((p) => {
    const known = [p.last_done, ...p.history];
    const earliest = [...known].sort()[0];
    for (let i = 1; i <= 8; i++) known.push(addDays(earliest, -i * p.interval_days));
    known.filter((x) => x >= from && x <= to && x <= t).forEach((x) => E.push({ date: x, kind: "done", title: p.task, asset_id: p.asset_id, plan_id: p.id }));
    let d = nextDue(p), first = true;
    while (d <= to) {
      if (d >= from && (d >= t || first)) E.push({ date: d, kind: d < t ? "late" : "pend", title: p.task, asset_id: p.asset_id, plan_id: p.id });
      first = false;
      d = addDays(d, p.interval_days);
    }
  });
  s.orders.forEach((o) => {
    if (o.due_date && o.due_date >= from && o.due_date <= to)
      E.push({ date: o.due_date, kind: o.status === "done" ? "done" : o.due_date < t ? "late" : "pend", title: `${osCode(o.seq)} ${o.description}`, asset_id: o.asset_id, order: o });
  });
  return E;
}

export default function PlansPage() {
  const { state, registerExecution, orderFromPlan, setOrderStatus } = useStore();
  const [off, setOff] = React.useState(0);
  const [filter, setFilter] = React.useState<"todas" | "pend" | "done">("todas");
  const [sel, setSel] = React.useState<string | null>(null);
  const t = today();
  const base = new Date(+t.slice(0, 4), +t.slice(5, 7) - 1 + off, 1);
  const y = base.getFullYear(), m = base.getMonth(), dim = new Date(y, m + 1, 0).getDate();
  const from = iso(y, m, 1), to = iso(y, m, dim);
  const all = events(state, from, to);
  const E = all.filter((e) => filter === "todas" || (filter === "done" ? e.kind === "done" : e.kind !== "done"));
  const day = sel && sel >= from && sel <= to ? sel : t >= from && t <= to ? t : from;
  const cnt = (k: Kind) => all.filter((e) => e.kind === k).length;
  const assetName = (id: string) => state.assets.find((a) => a.id === id)?.name ?? "";
  return (
    <Ready>
      <PageHeader title="Planos de Manutenção">
        {([["todas", "Todas"], ["pend", "Pendentes"], ["done", "Realizadas"]] as const).map(([v, l]) => <Button key={v} size="sm" variant={filter === v ? "default" : "outline"} onClick={() => setFilter(v)} aria-pressed={filter === v}>{l}</Button>)}
      </PageHeader>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button size="icon" variant="outline" onClick={() => { setOff(off - 1); setSel(null); }} aria-label="Mês anterior"><ChevronLeft className="h-4 w-4" /></Button>
        <h2 className="min-w-44 text-center text-lg font-semibold capitalize">{MONTHS[m]} de {y}</h2>
        <Button size="icon" variant="outline" onClick={() => { setOff(off + 1); setSel(null); }} aria-label="Próximo mês"><ChevronRight className="h-4 w-4" /></Button>
        <Button size="sm" onClick={() => { setOff(0); setSel(null); }}>Hoje</Button>
        <span className="ml-auto flex gap-2"><Badge tone="ok">{cnt("done")} realizadas</Badge><Badge tone="info">{cnt("pend")} pendentes</Badge><Badge tone="bad">{cnt("late")} atrasadas</Badge></span>
      </div>
      <div className="grid grid-cols-7 gap-1 md:gap-1.5">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((w) => <div key={w} className="py-1 text-center text-xs font-semibold uppercase text-muted-foreground">{w}</div>)}
        {Array.from({ length: base.getDay() }).map((_, i) => <div key={"e" + i} />)}
        {Array.from({ length: dim }).map((_, i) => {
          const ds = iso(y, m, i + 1);
          const de = E.filter((e) => e.date === ds);
          return (
            <button key={ds} onClick={() => setSel(ds)} aria-label={`Dia ${i + 1}, ${de.length} tarefas`}
              className={cn("flex min-h-14 flex-col items-center gap-1 overflow-hidden rounded-md border border-border bg-card p-1 text-left hover:bg-muted md:min-h-24 md:items-stretch md:p-1.5", ds === day && "outline-2 -outline-offset-2 outline-primary")}>
              <b className={cn("self-start text-xs", ds === t && "rounded-full bg-primary px-2 py-0.5 text-primary-foreground")}>{i + 1}</b>
              {de.slice(0, 2).map((e, j) => <span key={j} className={cn("hidden truncate rounded-sm px-1.5 py-0.5 text-[11px] md:block", META[e.kind].chip)}>{e.kind === "done" ? "✓ " : ""}{e.title}</span>)}
              {de.length > 2 && <span className="hidden text-[11px] text-muted-foreground md:block">+{de.length - 2} mais</span>}
              <span className="flex gap-0.5 md:hidden">{de.slice(0, 4).map((e, j) => <i key={j} className={cn("h-1.5 w-1.5 rounded-full", META[e.kind].dot)} />)}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Verde: realizada. Azul: pendente. Vermelho: atrasada. Toque num dia para ver as tarefas.</p>
      <Panel title={`Tarefas de ${fmtDate(day)}`} className="mt-4">
        {E.filter((e) => e.date === day).length ? E.filter((e) => e.date === day).map((e, i) => (
          <Row key={i} title={e.title} meta={`${assetName(e.asset_id)}, setor ${state.assets.find((a) => a.id === e.asset_id)?.sector}`}
            right={<>
              <Badge tone={META[e.kind].tone}>{META[e.kind].label}</Badge>
              {e.kind !== "done" && e.plan_id && <><Button size="sm" onClick={() => registerExecution(e.plan_id!)}>Registrar execução</Button><Button size="sm" variant="outline" onClick={() => orderFromPlan(e.plan_id!)}>Gerar OS</Button></>}
              {e.kind !== "done" && e.order && <Button size="sm" onClick={() => setOrderStatus(e.order!.id, e.order!.status === "open" ? "in_progress" : "done")}>{e.order.status === "open" ? "Iniciar" : "Concluir"}</Button>}
            </>} />
        )) : <Empty>Nenhuma tarefa neste dia.</Empty>}
      </Panel>
    </Ready>
  );
}
