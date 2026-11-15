"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { fmtDate, fmtDateTime, osCode, PRIORITY_LABEL, STATUS_LABEL } from "@/lib/domain";
import type { WorkOrder } from "@/lib/types";

export function OrderDetailDialog({ order: o }: { order: WorkOrder }) {
  const { state } = useStore();
  const d = o.details;
  const rows: [string, string][] = [
    ["Status", STATUS_LABEL[o.status] + (o.pending ? " (pendente de execução)" : "")],
    ["Equipamento", state.assets.find((a) => a.id === o.asset_id)?.name ?? ""],
    ["Local", o.location], ["LI", o.installation_site], ["TAG", o.tag],
    ["Tipo de serviço", o.service_type], ["Tipo de manutenção", o.maintenance_type], ["Categoria", o.category],
    ["Prioridade", PRIORITY_LABEL[o.priority]], ["Executante", o.assignee], ["Equipe", d.crew.join(", ")],
    ["Nº de executantes", String(o.crew_size)], ["Programada", fmtDateTime(o.scheduled_at)],
    ["Duração estimada", [o.est_days ? `${o.est_days} dia(s)` : "", o.est_hours].join(" ").trim()],
    ["Início", fmtDateTime(o.started_at)], ["Término", fmtDateTime(o.finished_at)], ["Criada em", fmtDate(o.created_at)], ["Prazo", fmtDate(o.due_date)],
    ["Descrição", o.description], ["Comentário", o.comment], ["Tarefas", d.tasks.join("; ")], ["Segurança", d.safety.join("; ")],
    ["Materiais", d.materials.join("; ")], ["Recursos", d.resources], ["CheckList", d.checklist],
    ["Outros custos", d.extra_cost ? `R$ ${d.extra_cost.toFixed(2).replace(".", ",")}${d.extra_cost_desc ? ` (${d.extra_cost_desc})` : ""}` : ""],
    ["Solicitante", d.requester], ["Fotos, anexos e documentos", d.files.join(", ")],
  ];
  return (
    <Dialog>
      <DialogTrigger asChild><Button size="sm" variant="outline">Detalhes</Button></DialogTrigger>
      <DialogContent title={osCode(o.seq)} wide>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-[170px_1fr]">
          {rows.filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="contents"><dt className="mt-2 text-muted-foreground sm:mt-0">{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
