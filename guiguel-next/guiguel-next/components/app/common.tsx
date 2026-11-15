"use client";
import * as React from "react";
import { Skeleton } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <div className="no-print flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
export const Empty = ({ children }: { children: React.ReactNode }) => (
  <div className="px-4 py-8 text-center text-sm text-muted-foreground">{children}</div>
);
/** Mostra skeleton até os dados carregarem. */
export function Ready({ children }: { children: React.ReactNode }) {
  const { ready } = useStore();
  if (ready) return <>{children}</>;
  return (
    <div className="space-y-3" aria-busy="true">
      <Skeleton className="h-9 w-48" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      <Skeleton className="h-56" />
    </div>
  );
}
export function Tile({ color, value, label, onClick }: { color: string; value: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ background: color }}
      className="min-h-24 rounded-md p-3 text-left text-white transition-transform hover:-translate-y-0.5 active:scale-[.98]">
      <b className="block text-4xl font-bold leading-none tracking-tight">{value}</b>
      <span className="mt-6 block text-sm">{label}</span>
    </button>
  );
}
export function Row({ title, meta, right, className }: { title: React.ReactNode; meta?: React.ReactNode; right?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-2 border-b border-border py-3 last:border-0", className)}>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{title}</div>
        {meta && <div className="text-xs text-muted-foreground">{meta}</div>}
      </div>
      <div className="flex flex-wrap items-center gap-2">{right}</div>
    </div>
  );
}
export const Panel = ({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) => (
  <Card className={cn("overflow-hidden", className)}>
    {title && <div className="border-b border-border px-4 py-3 text-sm font-semibold">{title}</div>}
    <div className="p-4">{children}</div>
  </Card>
);
/** Tabela no desktop; vira lista de cartões no celular. */
export function DataTable({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div>
      <table className="hidden w-full text-sm md:table">
        <thead><tr>{head.map((h) => <th key={h} className="border-b border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i} className="hover:bg-muted/50">{r.map((c, j) => <td key={j} className="border-b border-border px-3 py-2 align-middle">{c}</td>)}</tr>)}</tbody>
      </table>
      <div className="md:hidden">
        {rows.map((r, i) => (
          <div key={i} className="border-b border-border py-3 last:border-0">
            {r.map((c, j) => (head[j] ? <div key={j} className="flex justify-between gap-3 py-0.5 text-sm"><span className="text-muted-foreground">{head[j]}</span><span className="text-right">{c}</span></div> : <div key={j} className="mt-2 flex justify-end gap-2">{c}</div>))}
          </div>
        ))}
      </div>
    </div>
  );
}
