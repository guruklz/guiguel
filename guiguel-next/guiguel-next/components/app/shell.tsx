"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu as MenuIcon, Moon, Sun } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/form";
import { useSession } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { MENU } from "@/lib/menu";
import { planSit } from "@/lib/domain";
import { cn } from "@/lib/utils";

export function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useSession();
  const { state } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  React.useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  const badges: Record<string, string | number> = {
    "/os": state.orders.filter((o) => o.status !== "done").length || "",
    "/planos": state.plans.filter((p) => planSit(p).tone !== "ok").length || "",
    "/estoque": state.stock.filter((i) => i.qty < i.min_qty).length || "",
    "/paradas": state.downtimes.filter((d) => !d.ended_at).length || "",
  };
  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  if (!user) {
    return <div className="grid min-h-dvh place-items-center"><Skeleton className="h-10 w-48" /></div>;
  }
  const out = () => { logout(); router.replace("/login"); };
  return (
    <div className="md:grid md:grid-cols-[17rem_1fr]">
      {/* Menu lateral (desktop) */}
      <aside className="no-print sticky top-0 hidden h-dvh flex-col border-r border-border bg-card md:flex">
        <div className="px-4 pb-2 pt-5"><img src="/logo.svg" alt="Guiguel" className="w-36" /></div>
        <nav className="flex-1 overflow-y-auto px-2 pb-4" aria-label="Menu principal">
          {MENU.map((g) => (
            <div key={g.group}>
              <div className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{g.group}</div>
              {g.items.map((i) => (
                <Link key={i.href} href={i.href} aria-current={active(i.href) ? "page" : undefined}
                  className={cn("flex h-9 items-center gap-2.5 rounded-md px-3 text-sm hover:bg-muted",
                    active(i.href) && "bg-muted font-semibold shadow-[inset_3px_0_0_var(--primary)]")}>
                  <i.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{i.label}</span>
                  {badges[i.href] ? <span className="ml-auto rounded-sm bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">{badges[i.href]}</span> : null}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-2 border-t border-border p-3 text-sm">
          <div className="min-w-0 flex-1"><div className="truncate font-medium">{user.name}</div><div className="text-xs capitalize text-muted-foreground">{user.role}</div></div>
          <ThemeButton /><button onClick={out} aria-label="Sair" className="grid h-9 w-9 place-items-center rounded-md hover:bg-muted"><LogOut className="h-4 w-4" /></button>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Barra superior (celular) */}
        <header className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] md:hidden">
          <img src="/logo.svg" alt="Guiguel" className="h-9" />
          <div className="flex items-center"><ThemeButton /><button onClick={out} aria-label="Sair" className="grid h-11 w-11 place-items-center"><LogOut className="h-4 w-4" /></button></div>
        </header>
        <main className="mx-auto max-w-[1180px] p-4 pb-28 md:p-7 md:pb-10">{children}</main>
      </div>

      {/* Navegação inferior (celular) */}
      <nav aria-label="Navegação" className="no-print fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
        {MENU.flatMap((g) => g.items).filter((i) => i.main).map((i) => (
          <Link key={i.href} href={i.href} aria-current={active(i.href) ? "page" : undefined}
            className={cn("relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] text-muted-foreground", active(i.href) && "font-semibold text-foreground")}>
            <i.icon className={cn("h-5 w-5", active(i.href) && "text-primary")} />{i.short ?? i.label}
            {badges[i.href] ? <span className="absolute right-3 top-1 rounded-sm bg-primary px-1 text-[10px] font-bold text-primary-foreground">{badges[i.href]}</span> : null}
          </Link>
        ))}
        <Dialog>
          <DialogTrigger className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] text-muted-foreground"><MenuIcon className="h-5 w-5" />Mais</DialogTrigger>
          <DialogContent title="Menu">
            {MENU.map((g) => (
              <div key={g.group}>
                <div className="pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{g.group}</div>
                <div className="grid grid-cols-2 gap-2">
                  {g.items.map((i) => (
                    <DialogClose asChild key={i.href}>
                      <Link href={i.href} className="flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm"><i.icon className="h-4 w-4" />{i.label}</Link>
                    </DialogClose>
                  ))}
                </div>
              </div>
            ))}
          </DialogContent>
        </Dialog>
      </nav>
    </div>
  );
}

function ThemeButton() {
  const toggle = () => {
    const dark = document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", !dark);
    try { localStorage.setItem("theme", dark ? "light" : "dark"); } catch { /* ignore */ }
  };
  return (
    <button onClick={toggle} aria-label="Alternar modo escuro" className="grid h-11 w-11 place-items-center rounded-md hover:bg-muted md:h-9 md:w-9">
      <Sun className="hidden h-4 w-4 dark:block" /><Moon className="h-4 w-4 dark:hidden" />
    </button>
  );
}
