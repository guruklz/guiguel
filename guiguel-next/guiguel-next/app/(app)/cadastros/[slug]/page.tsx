"use client";
import * as React from "react";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/form";
import { DataTable, Empty, PageHeader, Ready } from "@/components/app/common";
import { useStore } from "@/lib/store";
import { registryBySlug } from "@/lib/registries";
import { registrySchema } from "@/lib/validations";

export default function RegistryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const reg = registryBySlug(slug);
  const { state, addRegistry, removeRegistry } = useStore();
  const [open, setOpen] = React.useState(false);
  const [err, setErr] = React.useState("");
  if (!reg) notFound();
  const rows = state.registry.filter((r) => r.kind === reg.slug);
  const assetName = (id: unknown) => state.assets.find((a) => a.id === id)?.name ?? String(id ?? "");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const raw = Object.fromEntries(reg!.fields.map((x) => [x.key, x.type === "number" ? Number(f.get(x.key)) : String(f.get(x.key) ?? "")]));
    const r = registrySchema(reg!.fields).safeParse(raw);
    if (!r.success) return setErr(r.error.issues[0].message);
    addRegistry(reg!.slug, r.data as Record<string, string | number>);
    setErr(""); setOpen(false);
  }
  return (
    <Ready>
      <PageHeader title={reg.title}>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); setErr(""); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" />Novo</Button></DialogTrigger>
          <DialogContent title={`Novo registro: ${reg.title}`}>
            <form onSubmit={submit} noValidate>
              {reg.fields.map((f) => (
                <div key={f.key}>
                  <Label htmlFor={f.key}>{f.label}</Label>
                  {f.type === "select" ? <Select id={f.key} name={f.key}>{f.options!.map((o) => <option key={o}>{o}</option>)}</Select>
                    : f.type === "asset" ? <Select id={f.key} name={f.key}>{state.assets.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</Select>
                    : <Input id={f.key} name={f.key} type={f.type === "number" ? "number" : "text"} step="any" />}
                </div>
              ))}
              {err && <p role="alert" className="mt-3 text-sm text-bad">{err}</p>}
              <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit">Salvar</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>
      <Card className="px-2">
        {rows.length ? (
          <DataTable head={[...reg.fields.map((f) => f.label), ""]}
            rows={rows.map((r) => [...reg.fields.map((f) => (f.type === "asset" ? assetName(r.data[f.key]) : String(r.data[f.key] ?? ""))), <Button key="x" size="sm" variant="outline" onClick={() => removeRegistry(r.id)}>Excluir</Button>])} />
        ) : <Empty>Nenhum registro ainda. Use “Novo” para cadastrar.</Empty>}
      </Card>
    </Ready>
  );
}
