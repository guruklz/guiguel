"use client";
import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import { osCode, fmtDate, today } from "@/lib/domain";
import { orderSchema } from "@/lib/validations";
import type { OrderDetails } from "@/lib/types";

const TABS: [string, string][] = [["geral", "Geral"], ["equipe", "Equipe"], ["tarefas", "Tarefas"], ["seguranca", "Segurança"], ["fotos", "Fotos"], ["anexos", "Anexos"], ["docs", "Documentos"], ["materiais", "Materiais"], ["recursos", "Recursos"], ["checklists", "CheckLists"], ["custos", "Outros custos"], ["assinatura", "Assinatura"], ["detalhes", "Detalhes"]];
const SEGURANCA = ["Bloqueio e etiquetagem (LOTO)", "EPI obrigatório", "Permissão de trabalho", "Área isolada e sinalizada", "Trabalho em altura", "Espaço confinado"];
const reg = (state: ReturnType<typeof useStore>["state"], kind: string) => state.registry.filter((r) => r.kind === kind);
const opts = (a: string[]) => a.map((o) => <option key={o}>{o}</option>);

export function NewOrderDialog({ children }: { children?: React.ReactNode }) {
  const { state, createOrder } = useStore();
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState("geral");
  const [error, setError] = React.useState("");
  const techs = state.profiles.filter((p) => p.role === "technician" && p.active).map((p) => p.full_name);
  const nextSeq = Math.max(1012, ...state.orders.map((o) => o.seq)) + 1;

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const s = (k: string) => String(f.get(k) ?? "");
    const num = (k: string) => (s(k) === "" ? null : Number(s(k)));
    const all = (k: string) => f.getAll(k).map(String);
    const files = ["fotos", "anexos", "docs"].flatMap((k) => f.getAll(k).map((x) => (x instanceof File ? x.name : "")).filter(Boolean));
    const parsed = orderSchema.safeParse({
      asset_id: s("asset_id"), description: s("description"), priority: s("priority"), service_type: s("service_type"), maintenance_type: s("maintenance_type"),
      category: s("category"), location: s("location"), installation_site: s("installation_site"), tag: s("tag"),
      scheduled_at: s("scheduled_at") || null, est_days: num("est_days"), est_hours: s("est_hours"), assignee: s("assignee"),
      crew_size: Number(s("crew_size") || 1), started_at: s("started_at") || null, finished_at: s("finished_at") || null, comment: s("comment"), pending: f.get("pending") === "on",
    });
    if (!parsed.success) { setTab("geral"); return setError(parsed.error.issues[0].message); }
    const materials = state.stock.filter((i) => Number(s("m_" + i.id)) > 0).map((i) => `${i.name} x${s("m_" + i.id)}`);
    const details: OrderDetails = {
      crew: all("crew"), tasks: s("tasks").split("\n").map((t) => t.trim()).filter(Boolean), safety: all("safety"), materials, resources: s("resources"),
      checklist: s("checklist"), extra_cost: num("extra_cost"), extra_cost_desc: s("extra_cost_desc"), requester: s("requester"), files,
    };
    createOrder(parsed.data, details);
    setError(""); setTab("geral"); setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setError(""); }}>
      <DialogTrigger asChild>{children ?? <Button><Plus className="h-4 w-4" />Criar OS</Button>}</DialogTrigger>
      <DialogContent title="Criar OS" wide>
        <form onSubmit={submit} noValidate>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>{TABS.map(([v, l]) => <TabsTrigger key={v} value={v}>{l}</TabsTrigger>)}</TabsList>
            <TabsContent value="geral" forceMount hidden={tab !== "geral"}>
              <div className="grid gap-x-4 sm:grid-cols-2">
                <div><Label>Local</Label><Select name="location"><option value="">Selecione</option>{opts(reg(state, "locais").map((r) => String(r.data.nome)))}</Select></div>
                <div><Label>LI (local de instalação)</Label><Select name="installation_site"><option value="">Selecione</option>{opts(reg(state, "lis").map((r) => `${r.data.cod} ${r.data.nome}`))}</Select></div>
                <div><Label>TAG</Label><Select name="tag"><option value="">Selecione</option>{opts(reg(state, "tags").map((r) => String(r.data.tag)))}</Select></div>
                <div><Label>Equipamento</Label><Select name="asset_id" defaultValue="">{<option value="" disabled>Selecione</option>}{state.assets.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</Select></div>
                <div><Label>Tipo de serviço</Label><Select name="service_type">{opts(["Mecânico", "Elétrico", "Hidráulico", "Pneumático", "Lubrificação", "Limpeza", "Calibração"])}</Select></div>
                <div><Label>Tipo de manutenção</Label><Select name="maintenance_type">{opts(["Corretiva", "Preventiva", "Preditiva", "Inspeção", "Melhoria"])}</Select></div>
                <div><Label>Prioridade</Label><Select name="priority" defaultValue="medium"><option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option></Select></div>
                <div><Label>Categoria</Label><Select name="category">{opts(["Mecânica", "Elétrica", "Utilidades", "Segurança", "Outros"])}</Select></div>
                <div><Label>Data e hora programada</Label><Input name="scheduled_at" type="datetime-local" /></div>
                <div className="grid grid-cols-2 gap-2"><div><Label>Duração (dias)</Label><Input name="est_days" type="number" min={0} /></div><div><Label>Duração (horas)</Label><Input name="est_hours" type="time" /></div></div>
                <div><Label>Executante</Label><Select name="assignee"><option value="">Selecione</option>{opts(techs)}</Select></div>
                <div><Label>Número de executantes</Label><Input name="crew_size" type="number" min={1} defaultValue={1} /></div>
                <div><Label>Data e hora de início</Label><Input name="started_at" type="datetime-local" /></div>
                <div><Label>Data e hora do término</Label><Input name="finished_at" type="datetime-local" /></div>
              </div>
              <Label>Descrição</Label><Textarea name="description" rows={3} />
              <Label>Comentário</Label><Textarea name="comment" rows={2} />
              <label className="mt-3 flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="pending" className="h-4 w-4" /> OS pendente de execução</label>
            </TabsContent>
            <TabsContent value="equipe" forceMount hidden={tab !== "equipe"}>
              <p className="text-sm text-muted-foreground">Marque quem participa da equipe.</p>
              {techs.map((t) => <label key={t} className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="crew" value={t} className="h-4 w-4" />{t}</label>)}
            </TabsContent>
            <TabsContent value="tarefas" forceMount hidden={tab !== "tarefas"}><Label>Tarefas (uma por linha)</Label><Textarea name="tasks" rows={6} placeholder={"Bloquear energia\nTrocar resistência\nTestar equipamento"} /></TabsContent>
            <TabsContent value="seguranca" forceMount hidden={tab !== "seguranca"}>{SEGURANCA.map((x) => <label key={x} className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="safety" value={x} className="h-4 w-4" />{x}</label>)}</TabsContent>
            {([["fotos", "Fotos"], ["anexos", "Anexos"], ["docs", "Documentos"]] as const).map(([k, l]) => (
              <TabsContent key={k} value={k} forceMount hidden={tab !== k}><Label>{l}</Label><Input name={k} type="file" multiple className="pt-1.5" /><p className="mt-2 text-xs text-muted-foreground">No modo demonstração só o nome do arquivo é guardado. Com Supabase, o arquivo vai para o Storage.</p></TabsContent>
            ))}
            <TabsContent value="materiais" forceMount hidden={tab !== "materiais"}>
              <p className="text-sm text-muted-foreground">Quantidade de cada peça que será usada.</p>
              {state.stock.map((i) => <div key={i.id}><Label>{i.name} (em estoque: {i.qty})</Label><Input name={"m_" + i.id} type="number" min={0} /></div>)}
            </TabsContent>
            <TabsContent value="recursos" forceMount hidden={tab !== "recursos"}><Label>Recursos e ferramentas necessários</Label><Textarea name="resources" rows={4} /></TabsContent>
            <TabsContent value="checklists" forceMount hidden={tab !== "checklists"}><Label>CheckList</Label><Select name="checklist"><option value="">Selecione</option>{opts(reg(state, "checklists").map((r) => String(r.data.nome)))}</Select></TabsContent>
            <TabsContent value="custos" forceMount hidden={tab !== "custos"}><Label>Valor (R$)</Label><Input name="extra_cost" type="number" min={0} step="0.01" /><Label>Descrição do custo</Label><Input name="extra_cost_desc" /></TabsContent>
            <TabsContent value="assinatura" forceMount hidden={tab !== "assinatura"}><Label>Nome de quem solicitou</Label><Input name="requester" /></TabsContent>
            <TabsContent value="detalhes" forceMount hidden={tab !== "detalhes"}><p className="text-sm text-muted-foreground">O ID da OS é gerado ao salvar: <b className="text-foreground">{osCode(nextSeq)}</b>. Data de criação: <b className="text-foreground">{fmtDate(today())}</b>.</p></TabsContent>
          </Tabs>
          {error && <p role="alert" className="mt-3 text-sm text-bad">{error}</p>}
          <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit">Salvar</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
