"use client";
import * as React from "react";
import * as T from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = T.Root;
export const TabsContent = T.Content;
export const TabsList = ({ className, ...p }: React.ComponentProps<typeof T.List>) => (
  <T.List className={cn("mb-3 flex gap-1 overflow-x-auto border-b border-border", className)} {...p} />
);
export const TabsTrigger = ({ className, ...p }: React.ComponentProps<typeof T.Trigger>) => (
  <T.Trigger
    className={cn(
      "h-11 shrink-0 rounded-t-md px-3 text-sm text-muted-foreground md:h-9 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:text-foreground",
      className,
    )}
    {...p}
  />
);
