import type { Asset, AppState, MonthStat, OSStatus, Plan, Priority, WorkOrder } from "./types";
import type { Tone } from "@/components/ui/badge";

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => iso(new Date());
export function addDays(date: string, n: number) {
  const d = new Date(date + "T12:00:00");
  d.setDate(d.getDate() + n);
  return iso(d);
}
export const diffDays = (a: string, b: string) =>
  Math.round((+new Date(b + "T12:00:00") - +new Date(a + "T12:00:00")) / 864e5);
export const fmtDate = (v?: string | null) => (v ? v.slice(0, 10).split("-").reverse().join("/") : "—");
export const fmtDateTime = (v?: string | null) =>
  v
    ? new Date(v).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "";
export const osCode = (seq: number) => "OS-" + String(seq).padStart(6, "0");
export const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
export const monthName = (m: string) => `${MONTHS[+m.slice(5, 7) - 1]} de ${m.slice(0, 4)}`;

export const STATUS_LABEL: Record<OSStatus, string> = { open: "Aberta", in_progress: "Em andamento", done: "Concluída" };
export const STATUS_TONE: Record<OSStatus, Tone> = { open: "warn", in_progress: "info", done: "ok" };
export const PRIORITY_LABEL: Record<Priority, string> = { low: "Baixa", medium: "Média", high: "Alta" };
export const PRIORITY_BAR: Record<Priority, string> = { low: "border-l-ok", medium: "border-l-warn", high: "border-l-bad" };

export const nextDue = (p: Plan) => addDays(p.last_done, p.interval_days);
export function planSit(p: Plan): { tone: Tone; label: string; days: number } {
  const d = diffDays(today(), nextDue(p));
  if (d < 0) return { tone: "bad", label: `Vencida há ${-d} d`, days: d };
  if (d <= 7) return { tone: "warn", label: `Vence em ${d} d`, days: d };
  return { tone: "ok", label: "Em dia", days: d };
}
export const isLate = (o: WorkOrder) => o.status !== "done" && !!o.due_date && o.due_date < today();

export type AssetState = "ok" | "attention" | "stopped";
export const STATE_META: Record<AssetState, { label: string; tone: Tone; fill: string }> = {
  ok: { label: "Em operação", tone: "ok", fill: "var(--ok)" },
  attention: { label: "Precisa de manutenção", tone: "warn", fill: "var(--warn)" },
  stopped: { label: "Parada", tone: "bad", fill: "var(--bad)" },
};
export function assetState(a: Asset, plans: Plan[], orders: WorkOrder[]): AssetState {
  if (a.status === "stopped") return "stopped";
  const plan = plans.some((p) => p.asset_id === a.id && planSit(p).tone !== "ok");
  const os = orders.some((o) => o.asset_id === a.id && o.status !== "done" && (o.priority === "high" || isLate(o)));
  return plan || os ? "attention" : "ok";
}
export function assetReasons(a: Asset, plans: Plan[], orders: WorkOrder[]): string[] {
  const r: string[] = [];
  plans.filter((p) => p.asset_id === a.id && planSit(p).tone !== "ok").forEach((p) => r.push(`${p.task}: ${planSit(p).label.toLowerCase()}`));
  orders.filter((o) => o.asset_id === a.id && o.status !== "done").forEach((o) => r.push(`${osCode(o.seq)} ${STATUS_LABEL[o.status].toLowerCase()}`));
  return r;
}
export function monthlyStats(s: AppState): (MonthStat & { live?: boolean })[] {
  const cur = today().slice(0, 7);
  const arr: (MonthStat & { live?: boolean })[] = s.history.filter((h) => h.month < cur);
  const created = s.orders.filter((o) => o.created_at.slice(0, 7) === cur).length;
  const done = s.orders.filter((o) => o.status === "done" && (o.completed_at || o.due_date || o.created_at).slice(0, 7) === cur).length;
  const b = s.base_month && s.base_month.month === cur ? s.base_month : { created: 0, done: 0 };
  arr.push({ month: cur, created: created + b.created, done: done + b.done, live: true });
  return arr;
}
export const rate = (c: number, d: number) => (c ? Math.round((100 * d) / c) : 0);
