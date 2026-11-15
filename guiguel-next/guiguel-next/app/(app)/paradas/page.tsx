"use client";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/form";
import { DataTable, Empty, PageHeader, Ready, Tile } from "@/components/app/common";
import { useStore } from "@/lib/store";
import { fmtDateTime } from "@/lib/domain";
import { stopSchema } from "@/lib/validations";

const dur = (h: number) => (h < 48 ? `${Math.round(h)} h` : `${(h / 24).toFixed(1)} d`);

export default function DowntimePage() {
  const { state, stopAsset, toggleAsset } = useStore();
  const [open, setOpen] = React.useState(false);
  const [err, setErr] = React.useState("");
  const hours = (d: { started_at: string; ended_at: string | null }) => ((d.ended_at ? +new Date(d.ended_at) : Date.now()) - +new Date(d.started_at)) / 36e5;
  const total = state.downtimes.reduce((s, d) => s + hours(d), 0);
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = stopSchema.safeParse({ asset_id: f.get("asset_id"), reason: f.get("reason") });
    if (!r.success) return setErr(r.error.issues[0].message);
    stopAsset(r.data.asset_id, r.data.reason);
    setErr(""); setOpen(false);
  }
  return (
    <Ready>
      <PageHeader title="Paradas">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button>Registrar parada</Button></DialogTrigger>
          <DialogContent title="Registrar parada">
            <form onSubmit={submit} noValidate>
              <Label>Equipamento</Label>
              <Select name="asset_id" defaultValue="">{<option value="" disabled>Selecione</option>}{state.assets.filter((a) => a.status === "running").map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</Select>
              <Label>Motivo da parada</Label><Input name="reason" />
              {err && <p role="alert" className="mt-3 text-sm text-bad">{err}</p>}
              <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit">Salvar</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Tile color="#b91c1c" value={state.downtimes.filter((d) => !d.ended_at).length} label="Paradas em andamento" />
        <Tile color="#27272a" value={state.downtimes.length} label="Paradas registradas" />
        <Tile color="#c2410c" value={dur(total)} label="Tempo total parado" />
      </div>
      <Card className="px-2">
        {state.downtimes.length ? (
          <DataTable head={["Equipamento", "Início", "Término", "Duração", "Motivo", ""]}
            rows={state.downtimes.map((d) => [
              state.assets.find((a) => a.id === d.asset_id)?.name, fmtDateTime(d.started_at), d.ended_at ? fmtDateTime(d.ended_at) : "Em andamento", dur(hours(d)), d.reason || "Não informado",
              d.ended_at ? <Badge key="b" tone="ok">Encerrada</Badge> : <Button key="b" size="sm" onClick={() => toggleAsset(d.asset_id)}>Retomar operação</Button>,
            ])} />
        ) : <Empty>Nenhuma parada registrada.</Empty>}
      </Card>
    </Ready>
  );
}
