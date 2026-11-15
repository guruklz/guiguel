import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const variants = cva("inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold", {
  variants: {
    tone: {
      muted: "bg-muted text-muted-foreground",
      ok: "bg-ok/15 text-ok",
      info: "bg-info/15 text-info",
      warn: "bg-warn/15 text-warn",
      bad: "bg-bad/15 text-bad",
    },
  },
  defaultVariants: { tone: "muted" },
});
export type Tone = NonNullable<VariantProps<typeof variants>["tone"]>;
export function Badge({ className, tone, ...p }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof variants>) {
  return <span className={cn(variants({ tone }), className)} {...p} />;
}
