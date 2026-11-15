import { z } from "zod";

export const orderSchema = z.object({
  asset_id: z.string().min(1, "Escolha o equipamento"),
  description: z.string().trim().min(3, "Descreva o serviço").max(1000, "Máximo de 1000 caracteres"),
  priority: z.enum(["low", "medium", "high"]),
  service_type: z.string().max(60),
  maintenance_type: z.string().max(60),
  category: z.string().max(60),
  location: z.string().max(120),
  installation_site: z.string().max(120),
  tag: z.string().max(60),
  scheduled_at: z.string().nullable(),
  est_days: z.number().int().min(0).max(365).nullable(),
  est_hours: z.string().max(10),
  assignee: z.string().max(80),
  crew_size: z.number().int().min(1).max(50),
  started_at: z.string().nullable(),
  finished_at: z.string().nullable(),
  comment: z.string().max(2000),
  pending: z.boolean(),
});
export type OrderInput = z.infer<typeof orderSchema>;

export const stopSchema = z.object({
  asset_id: z.string().min(1, "Escolha o equipamento"),
  reason: z.string().trim().min(3, "Informe o motivo").max(300),
});

export function registrySchema(fields: { key: string; type?: string }[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) shape[f.key] = f.type === "number" ? z.number().min(0).max(1e9) : z.string().trim().min(1, "Obrigatório").max(200);
  return z.object(shape);
}
