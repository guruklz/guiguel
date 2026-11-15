"use client";
import * as React from "react";
import * as D from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;
export const DialogTitle = D.Title;
export function DialogContent({
  className,
  title,
  children,
  wide,
}: {
  className?: string;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <D.Content
        aria-describedby={undefined}
        className={cn(
          "fixed z-50 max-h-[92dvh] overflow-y-auto border border-border bg-card p-5 shadow-xl",
          "inset-x-0 bottom-0 rounded-t-lg pb-[max(1.25rem,env(safe-area-inset-bottom))]",
          "md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-lg",
          wide ? "md:w-[min(720px,94vw)]" : "md:w-[min(480px,94vw)]",
          className,
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <D.Title className="text-lg font-semibold tracking-tight">{title}</D.Title>
          <D.Close className="-m-2 grid h-11 w-11 place-items-center rounded-md hover:bg-muted" aria-label="Fechar">
            <X className="h-4 w-4" />
          </D.Close>
        </div>
        {children}
      </D.Content>
    </D.Portal>
  );
}
