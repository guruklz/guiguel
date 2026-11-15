"use client";
import type { Asset } from "@/lib/types";
import { STATE_META, type AssetState } from "@/lib/domain";

interface Props { assets: Asset[]; states: Record<string, AssetState>; dimType: string; activeOrders: number; onSelect: (a: Asset) => void }

/** Planta baixa esquematizada: faixas vermelhas = circulação segura, azul = manutenção, marrom = estoque de produtos prontos. */
export function PlantMap({ assets, states, dimType, activeOrders, onSelect }: Props) {
  return (
    <svg viewBox="0 0 875 514" role="img" aria-label="Mapa da fábrica" className="block w-full min-w-[780px]">
      <rect x="5" y="5" width="863" height="505" fill="var(--card)" stroke="var(--foreground)" strokeWidth="3" />
      <g fill="color-mix(in srgb, var(--bad) 10%, transparent)" stroke="var(--bad)" strokeWidth="2.5">
        <rect x="304" y="8" width="34" height="322" />
        <polygon points="607,8 655,8 578,334 537,334" />
        <rect x="8" y="335" width="856" height="62" />
      </g>
      <g fill="var(--muted-foreground)" fontSize="11" letterSpacing="1.4">
        <text x="436" y="371" textAnchor="middle">FAIXA DE CIRCULAÇÃO SEGURA</text>
        <text transform="translate(326 170) rotate(-90)" textAnchor="middle">PASSAGEM SEGURA</text>
        <g fontSize="12"><text x="150" y="34">INJEÇÃO</text><text x="360" y="34">UTILIDADES</text><text x="700" y="30">ACABAMENTO</text><text x="700" y="190">EMBALAGEM</text></g>
      </g>
      <rect x="118" y="398" width="278" height="112" fill="color-mix(in srgb, #3b4fd9 10%, transparent)" stroke="#3b4fd9" strokeWidth="3" />
      <text x="257" y="450" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--foreground)">MANUTENÇÃO</text>
      <text x="257" y="474" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">{activeOrders} OS ativas</text>
      <rect x="441" y="402" width="423" height="108" fill="color-mix(in srgb, #b97a57 12%, transparent)" stroke="#b97a57" strokeWidth="3" />
      <text x="652" y="446" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--foreground)">ESTOQUE DE PRODUTOS PRONTOS</text>
      <text x="652" y="472" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">Marinex, Nutella, Starbucks e cremes</text>
      {assets.map((a) => {
        const st = states[a.id] ?? "ok";
        const c = STATE_META[st].fill;
        const tall = a.map_h > a.map_w * 1.3;
        const cx = a.map_x + a.map_w / 2, cy = a.map_y + a.map_h / 2;
        const dim = dimType !== "todas" && a.type !== dimType;
        return (
          <g key={a.id} role="button" tabIndex={0} aria-label={`${a.name}, ${STATE_META[st].label}`} opacity={dim ? 0.2 : 1} className="cursor-pointer outline-none"
            onClick={() => onSelect(a)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(a); } }}>
            <title>{`${a.name} (${a.product}): ${STATE_META[st].label}`}</title>
            <rect x={a.map_x} y={a.map_y} width={a.map_w} height={a.map_h} rx="3" fill={`color-mix(in srgb, ${c} 16%, var(--card))`} stroke={c} strokeWidth="2.5" />
            <circle cx={a.map_x + a.map_w - 6} cy={a.map_y + 6} r="4.5" fill={c} />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={a.map_w < 45 ? 9 : 11} fontWeight="600" fill="var(--foreground)" transform={tall ? `rotate(-90 ${cx} ${cy})` : undefined} pointerEvents="none">{a.short_label}</text>
          </g>
        );
      })}
    </svg>
  );
}
