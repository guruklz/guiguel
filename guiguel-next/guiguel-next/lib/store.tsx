"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AppState, OrderDetails, OSStatus, WorkOrder } from "./types";
import { makeSeed } from "./seed";
import { addDays, osCode, today } from "./domain";
import type { OrderInput } from "./validations";

// Modo demonstração: dados em localStorage, com os mesmos tipos do banco (ver supabase/migrations).
const KEY = "guiguel-next-v1";
const EMPTY: AppState = { assets: [], plans: [], orders: [], stock: [], downtimes: [], audit: [], registry: [], profiles: [], history: [], base_month: null };
const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));

interface Api {
  ready: boolean;
  state: AppState;
  createOrder: (input: OrderInput, details: OrderDetails) => void;
  setOrderStatus: (id: string, status: OSStatus) => void;
  toggleAsset: (id: string) => void;
  stopAsset: (id: string, reason: string) => void;
  registerExecution: (planId: string) => void;
  orderFromPlan: (planId: string) => void;
  adjustStock: (id: string, delta: number) => void;
  toggleProfile: (id: string) => void;
  addRegistry: (kind: string, data: Record<string, string | number>) => void;
  removeRegistry: (id: string) => void;
}
const Ctx = createContext<Api | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<AppState | null>(null);
  useEffect(() => {
    let st: AppState;
    try {
      const raw = localStorage.getItem(KEY);
      st = raw ? (JSON.parse(raw) as AppState) : makeSeed();
    } catch {
      st = makeSeed();
    }
    setS(st);
  }, []);
  useEffect(() => {
    if (s) {
      try {
        localStorage.setItem(KEY, JSON.stringify(s));
      } catch {
        /* armazenamento cheio ou bloqueado */
      }
    }
  }, [s]);

  const mut = useCallback((fn: (st: AppState) => AppState) => setS((p) => (p ? fn(p) : p)), []);
  const log = (st: AppState, action: string): AppState => ({
    ...st,
    audit: [{ id: uid(), user_name: "Admin Guiguel", action, created_at: new Date().toISOString() }, ...st.audit].slice(0, 80),
  });

  const api = useMemo<Api>(
    () => ({
      ready: s !== null,
      state: s ?? EMPTY,
      createOrder: (i, details) =>
        mut((st) => {
          const seq = Math.max(1012, ...st.orders.map((o) => o.seq)) + 1;
          const o: WorkOrder = {
            ...i, id: uid(), seq, status: "open", assignee: i.assignee || "Não atribuído",
            due_date: i.scheduled_at ? i.scheduled_at.slice(0, 10) : null,
            created_at: new Date().toISOString(), completed_at: null, details,
          };
          return log({ ...st, orders: [o, ...st.orders] }, `${osCode(seq)} criada: ${o.description}`);
        }),
      setOrderStatus: (id, status) =>
        mut((st) => {
          const o = st.orders.find((x) => x.id === id);
          if (!o) return st;
          const next = st.orders.map((x) => (x.id === id ? { ...x, status, completed_at: status === "done" ? today() : x.completed_at } : x));
          return log({ ...st, orders: next }, `${osCode(o.seq)}: ${status === "done" ? "concluída" : "iniciada"}`);
        }),
      toggleAsset: (id) =>
        mut((st) => {
          const a = st.assets.find((x) => x.id === id);
          if (!a) return st;
          const stopped = a.status === "running";
          const now = new Date().toISOString();
          const downtimes = stopped
            ? [{ id: uid(), asset_id: id, started_at: now, ended_at: null, reason: "" }, ...st.downtimes]
            : st.downtimes.map((d) => (d.asset_id === id && !d.ended_at ? { ...d, ended_at: now } : d));
          return log({ ...st, downtimes, assets: st.assets.map((x) => (x.id === id ? { ...x, status: stopped ? "stopped" : "running" } : x)) },
            `Equipamento ${a.name} marcado como ${stopped ? "parado" : "em operação"}`);
        }),
      stopAsset: (id, reason) =>
        mut((st) => {
          const a = st.assets.find((x) => x.id === id);
          if (!a || a.status === "stopped") return st;
          return log({ ...st, assets: st.assets.map((x) => (x.id === id ? { ...x, status: "stopped" } : x)),
            downtimes: [{ id: uid(), asset_id: id, started_at: new Date().toISOString(), ended_at: null, reason }, ...st.downtimes] }, `Parada registrada: ${a.name}`);
        }),
      registerExecution: (planId) =>
        mut((st) => {
          const p = st.plans.find((x) => x.id === planId);
          if (!p) return st;
          return log({ ...st, plans: st.plans.map((x) => (x.id === planId ? { ...x, history: [...x.history, x.last_done], last_done: today() } : x)) }, `Execução registrada: ${p.task}`);
        }),
      orderFromPlan: (planId) =>
        mut((st) => {
          const p = st.plans.find((x) => x.id === planId);
          if (!p) return st;
          const seq = Math.max(1012, ...st.orders.map((o) => o.seq)) + 1;
          const o: WorkOrder = {
            id: uid(), seq, asset_id: p.asset_id, description: `Preventiva: ${p.task}`, priority: "medium", status: "open", service_type: "", maintenance_type: "Preventiva",
            category: "", location: "", installation_site: "", tag: "", scheduled_at: null, est_days: null, est_hours: "", assignee: "Não atribuído", crew_size: 1,
            started_at: null, finished_at: null, comment: "", pending: false, due_date: addDays(p.last_done, p.interval_days), created_at: new Date().toISOString(), completed_at: null,
            details: { crew: [], tasks: [], safety: [], materials: [], resources: "", checklist: "", extra_cost: null, extra_cost_desc: "", requester: "", files: [] },
          };
          return log({ ...st, orders: [o, ...st.orders] }, `${osCode(seq)} gerada do plano: ${p.task}`);
        }),
      adjustStock: (id, delta) =>
        mut((st) => {
          const it = st.stock.find((x) => x.id === id);
          if (!it) return st;
          const qty = Math.max(0, it.qty + delta);
          return log({ ...st, stock: st.stock.map((x) => (x.id === id ? { ...x, qty } : x)) }, `Estoque de ${it.name}: ${qty}`);
        }),
      toggleProfile: (id) =>
        mut((st) => {
          const p = st.profiles.find((x) => x.id === id);
          if (!p) return st;
          return log({ ...st, profiles: st.profiles.map((x) => (x.id === id ? { ...x, active: !x.active } : x)) }, `Usuário ${p.full_name} ${p.active ? "desativado" : "ativado"}`);
        }),
      addRegistry: (kind, data) => mut((st) => log({ ...st, registry: [...st.registry, { id: uid(), kind, data }] }, `Cadastro criado em ${kind}`)),
      removeRegistry: (id) => mut((st) => log({ ...st, registry: st.registry.filter((r) => r.id !== id) }, "Cadastro removido")),
    }),
    [s, mut], // eslint-disable-line react-hooks/exhaustive-deps
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore fora do StoreProvider");
  return v;
}
