// Tipos espelham as tabelas do Supabase (supabase/migrations/0001_init.sql).
export type Role = "admin" | "manager" | "technician" | "viewer";
export type Priority = "low" | "medium" | "high";
export type OSStatus = "open" | "in_progress" | "done";
export type AssetStatus = "running" | "stopped";

export interface Asset {
  id: string;
  code: string;
  name: string;
  short_label: string;
  type: string;
  sector: string;
  product: string;
  status: AssetStatus;
  map_x: number;
  map_y: number;
  map_w: number;
  map_h: number;
}
export interface Plan {
  id: string;
  asset_id: string;
  task: string;
  interval_days: number;
  last_done: string;
  history: string[];
}
export interface OrderDetails {
  crew: string[];
  tasks: string[];
  safety: string[];
  materials: string[];
  resources: string;
  checklist: string;
  extra_cost: number | null;
  extra_cost_desc: string;
  requester: string;
  files: string[];
}
export interface WorkOrder {
  id: string;
  seq: number;
  asset_id: string;
  description: string;
  priority: Priority;
  status: OSStatus;
  service_type: string;
  maintenance_type: string;
  category: string;
  location: string;
  installation_site: string;
  tag: string;
  scheduled_at: string | null;
  est_days: number | null;
  est_hours: string;
  assignee: string;
  crew_size: number;
  started_at: string | null;
  finished_at: string | null;
  comment: string;
  pending: boolean;
  due_date: string | null;
  created_at: string;
  completed_at: string | null;
  details: OrderDetails;
}
export interface StockItem {
  id: string;
  code: string;
  name: string;
  qty: number;
  min_qty: number;
}
export interface Downtime {
  id: string;
  asset_id: string;
  started_at: string;
  ended_at: string | null;
  reason: string;
}
export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  active: boolean;
}
export interface AuditEntry {
  id: string;
  user_name: string;
  action: string;
  created_at: string;
}
export interface RegistryItem {
  id: string;
  kind: string;
  data: Record<string, string | number>;
}
export interface MonthStat {
  month: string; // "2026-08"
  created: number;
  done: number;
}
export interface AppState {
  assets: Asset[];
  plans: Plan[];
  orders: WorkOrder[];
  stock: StockItem[];
  downtimes: Downtime[];
  audit: AuditEntry[];
  registry: RegistryItem[];
  profiles: Profile[];
  history: MonthStat[];
  base_month: MonthStat | null;
}
