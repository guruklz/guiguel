import type { Asset, AppState, OrderDetails, Plan, WorkOrder, Priority, OSStatus } from "./types";
import { REGISTRIES } from "./registries";
import { addDays, today } from "./domain";

const emptyDetails = (): OrderDetails => ({ crew: [], tasks: [], safety: [], materials: [], resources: "", checklist: "", extra_cost: null, extra_cost_desc: "", requester: "", files: [] });
const ago = (h: number) => new Date(Date.now() - h * 36e5).toISOString();

const A = (n: number, name: string, label: string, type: string, sector: string, product: string, status: Asset["status"], x: number, y: number, w: number, h: number): Asset => ({
  id: `a${String(n).padStart(2, "0")}`, code: `A-${String(n).padStart(2, "0")}`, name, short_label: label, type, sector, product, status, map_x: x, map_y: y, map_w: w, map_h: h,
});

export function makeSeed(): AppState {
  const t = today();
  const d = (n: number) => addDays(t, n);
  const assets: Asset[] = [
    A(1, "Injetora INJ-01", "INJ 01", "Injetora", "Injeção", "Tampas Nutella", "running", 47, 60, 26, 111),
    A(2, "Injetora INJ-02", "INJ 02", "Injetora", "Injeção", "Tampas Nutella", "running", 82, 63, 30, 103),
    A(3, "Injetora INJ-03", "INJ 03", "Injetora", "Injeção", "Tampas Marinex", "stopped", 130, 67, 29, 92),
    A(4, "Injetora INJ-04", "INJ 04", "Injetora", "Injeção", "Tampas Marinex", "running", 193, 74, 34, 110),
    A(5, "Injetora INJ-05", "INJ 05", "Injetora", "Injeção", "Tampas Starbucks", "running", 248, 75, 40, 117),
    A(6, "Secador de resina", "SEC 01", "Utilidade", "Utilidades", "Apoio à injeção", "running", 360, 75, 30, 77),
    A(7, "Chiller 01", "CHI 01", "Utilidade", "Utilidades", "Resfriamento dos moldes", "running", 413, 77, 44, 86),
    A(8, "Dosador gravimétrico", "DOS 01", "Utilidade", "Utilidades", "Apoio à injeção", "running", 490, 41, 31, 41),
    A(9, "Misturador de masterbatch", "MIS 01", "Utilidade", "Utilidades", "Cores das tampas", "running", 489, 154, 46, 55),
    A(10, "Compressor de ar 01", "COMP 01", "Utilidade", "Utilidades", "Ar comprimido da fábrica", "running", 355, 210, 50, 97),
    A(11, "Moinho granulador", "MOI 01", "Utilidade", "Utilidades", "Reciclagem de rebarbas", "running", 471, 268, 32, 41),
    A(12, "Seladora SEL-01", "SEL 01", "Seladora", "Acabamento", "Tampas de creme", "running", 667, 42, 31, 59),
    A(13, "Seladora SEL-02", "SEL 02", "Seladora", "Acabamento", "Tampas Marinex", "running", 717, 45, 30, 54),
    A(14, "Tampografia TAM-01", "TAM 01", "Tampografia", "Acabamento", "Tampas Starbucks", "running", 761, 44, 31, 59),
    A(15, "Tampografia TAM-02", "TAM 02", "Tampografia", "Acabamento", "Tampas Nutella", "running", 806, 47, 32, 58),
    A(16, "Montadora MON-01", "MON 01", "Montadora", "Embalagem", "Tampas de creme", "running", 648, 207, 39, 80),
    A(17, "Montadora MON-02", "MON 02", "Montadora", "Embalagem", "Tampas Nutella", "running", 712, 207, 33, 72),
    A(18, "Embaladora EMB-01", "EMB 01", "Embaladora", "Embalagem", "Caixas de tampas", "running", 761, 208, 37, 82),
    A(19, "Encaixotadora EMB-02", "EMB 02", "Embaladora", "Embalagem", "Caixas de tampas", "running", 822, 213, 30, 76),
  ];
  const P = (n: number, asset: string, task: string, days: number, ago_: number): Plan => ({ id: `p${n}`, asset_id: asset, task, interval_days: days, last_done: d(-ago_), history: [] });
  const plans: Plan[] = [
    P(1, "a01", "Troca de filtro do óleo hidráulico", 30, 27), P(2, "a03", "Revisão das resistências de aquecimento", 15, 20),
    P(3, "a12", "Troca da resistência de selagem", 14, 10), P(4, "a10", "Inspeção da válvula de segurança", 90, 80),
    P(5, "a10", "Troca de óleo do compressor", 60, 45), P(6, "a14", "Limpeza e ajuste do cliché", 21, 9),
    P(7, "a05", "Lubrificação das colunas", 20, 15), P(8, "a18", "Lubrificação de correntes", 30, 8), P(9, "a07", "Limpeza do condensador", 45, 44),
  ];
  const O = (seq: number, asset: string, description: string, priority: Priority, status: OSStatus, due: number, assignee: string, mtype: string, stype: string): WorkOrder => ({
    id: `o${seq}`, seq, asset_id: asset, description, priority, status, service_type: stype, maintenance_type: mtype, category: "", location: "", installation_site: "", tag: "",
    scheduled_at: null, est_days: null, est_hours: "", assignee, crew_size: 1, started_at: null, finished_at: null, comment: "", pending: false,
    due_date: d(due), created_at: new Date(d(-9) + "T12:00:00").toISOString(), completed_at: status === "done" ? d(due) : null, details: emptyDetails(),
  });
  const orders: WorkOrder[] = [
    O(1001, "a03", "Resistência queimada na zona 2", "high", "open", -6, "Marcos Lima", "Corretiva", "Elétrico"),
    O(1002, "a10", "Troca de filtro de ar (preventiva)", "medium", "in_progress", 1, "Carlos Alves", "Preventiva", "Pneumático"),
    O(1003, "a12", "Vedação da seladora com falha", "low", "open", 9, "Ana Souza", "Corretiva", "Mecânico"),
    O(1004, "a04", "Inspeção da válvula de segurança", "high", "done", -8, "Carlos Alves", "Inspeção", "Mecânico"),
    O(1006, "a14", "Troca de correia do motor", "medium", "done", -6, "Marcos Lima", "Corretiva", "Mecânico"),
    O(1007, "a18", "Vazamento de ar na embaladora", "high", "in_progress", 2, "Ana Souza", "Corretiva", "Pneumático"),
    O(1008, "a09", "Calibração do misturador", "low", "open", 9, "Carlos Alves", "Preventiva", "Calibração"),
    O(1009, "a16", "Ruído anormal na montadora", "medium", "open", -2, "Marcos Lima", "Corretiva", "Mecânico"),
    O(1010, "a02", "Revisão do painel elétrico", "medium", "done", -4, "Ana Souza", "Preventiva", "Elétrico"),
    O(1011, "a01", "Teste de pressão hidráulica", "low", "done", -8, "Carlos Alves", "Inspeção", "Hidráulico"),
    O(1012, "a17", "Troca de sensor de presença", "medium", "open", 6, "Ana Souza", "Corretiva", "Elétrico"),
  ];
  const profiles = [
    { id: "u1", full_name: "Admin Guiguel", role: "admin" as const, active: true },
    { id: "u2", full_name: "Rodrigo Menezes", role: "manager" as const, active: true },
    { id: "u3", full_name: "Carlos Alves", role: "technician" as const, active: true },
    { id: "u4", full_name: "Marcos Lima", role: "technician" as const, active: true },
    { id: "u5", full_name: "Ana Souza", role: "technician" as const, active: true },
  ];
  return {
    assets, plans, orders, profiles,
    stock: [
      { id: "s1", code: "P-100", name: "Resistência de aquecimento", qty: 2, min_qty: 6 },
      { id: "s2", code: "P-101", name: "Filtro de óleo hidráulico", qty: 6, min_qty: 4 },
      { id: "s3", code: "P-102", name: "Cliché de tampografia", qty: 3, min_qty: 2 },
      { id: "s4", code: "P-103", name: "Correia dentada B42", qty: 8, min_qty: 3 },
      { id: "s5", code: "P-104", name: "Rolamento 6205", qty: 5, min_qty: 5 },
    ],
    downtimes: [
      { id: "d1", asset_id: "a03", started_at: ago(30), ended_at: null, reason: "Resistência queimada na zona 2" },
      { id: "d2", asset_id: "a11", started_at: ago(200), ended_at: ago(190), reason: "Troca de facas do moinho" },
      { id: "d3", asset_id: "a16", started_at: ago(120), ended_at: ago(118), reason: "Ajuste de sensor" },
    ],
    audit: [
      { id: "l1", user_name: "Ana Souza", action: "OS-001007 iniciada", created_at: ago(1) },
      { id: "l2", user_name: "Carlos Alves", action: "Estoque de Filtro de óleo hidráulico: 6", created_at: ago(3) },
      { id: "l3", user_name: "Rodrigo Menezes", action: "OS-001012 criada: Troca de sensor de presença", created_at: ago(5) },
      { id: "l4", user_name: "Marcos Lima", action: "OS-001006 concluída", created_at: ago(26) },
      { id: "l5", user_name: "Admin Guiguel", action: "Equipamento Injetora INJ-03 marcado como parado", created_at: ago(30) },
    ],
    registry: REGISTRIES.flatMap((r) => r.rows.map((row, i) => ({ id: `${r.slug}-${i}`, kind: r.slug, data: Object.fromEntries(r.fields.map((f, j) => [f.key, row[j]])) }))),
    history: [
      { month: "2026-05", created: 168, done: 160 }, { month: "2026-06", created: 175, done: 171 }, { month: "2026-07", created: 190, done: 182 },
      { month: "2026-08", created: 200, done: 190 }, { month: "2026-09", created: 215, done: 208 }, { month: "2026-10", created: 205, done: 199 },
    ],
    base_month: { month: "2026-11", created: 96, done: 88 },
  };
}
