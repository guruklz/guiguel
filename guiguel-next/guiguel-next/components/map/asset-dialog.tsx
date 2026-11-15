"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Row } from "@/components/app/common";
import { useStore } from "@/lib/store";
import { assetReasons, assetState, fmtDate, nextDue, osCode, planSit, STATE_META, STATUS_LABEL, STATUS_TONE } from "@/lib/domain";
import type { Asset } from "@/lib/types";

export function AssetDialog({ asset, onClose }: { asset: Asset | null; onClose: () => void }) {
  const { state, toggleAsset } = useStore();
  const a = asset ? state.assets.find((x) => x.id === asset.id) ?? asset : null;
  const st = a ? assetState(a, state.plans, state.orders) : "ok";
  return (
    <Dialog open={!!a} onOpenChange={(v) => !v && onClose()}>
      {a && (
        <DialogContent title={a.name} wide>
          <p className="mb-3 text-sm text-muted-foreground">{a.code}, setor {a.sector}, {a.type}, {a.product}</p>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge tone={STATE_META[st].tone}>{STATE_META[st].label}</Badge>
            <Button size="sm" variant="outline" onClick={() => toggleAsset(a.id)}>{a.status === "stopped" ? "Retomar operação" : "Marcar como parada"}</Button>
          </div>
          {st === "attention" && <p className="mb-3 rounded-md border border-warn/40 bg-warn/10 p-3 text-sm">{assetReasons(a, state.plans, state.orders).join("; ")}</p>}
          <h3 className="mb-1 mt-4 text-sm font-semibold">Ordens de serviço</h3>
          {state.orders.filter((o) => o.asset_id === a.id).sort((x, y) => y.seq - x.seq).map((o) => (
            <Row key={o.id} title={`${osCode(o.seq)} ${o.description}`} meta={`${o.assignee}, prazo ${fmtDate(o.due_date)}`} right={<Badge tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Badge>} />
          ))}
          {!state.orders.some((o) => o.asset_id === a.id) && <p className="py-2 text-sm text-muted-foreground">Nenhuma OS.</p>}
          <h3 className="mb-1 mt-4 text-sm font-semibold">Manutenção preventiva</h3>
          {state.plans.filter((p) => p.asset_id === a.id).map((p) => (
            <Row key={p.id} title={p.task} meta={`Próxima: ${fmtDate(nextDue(p))}`} right={<Badge tone={planSit(p).tone}>{planSit(p).label}</Badge>} />
          ))}
          {!state.plans.some((p) => p.asset_id === a.id) && <p className="py-2 text-sm text-muted-foreground">Sem plano cadastrado.</p>}
        </DialogContent>
      )}
    </Dialog>
  );
}
