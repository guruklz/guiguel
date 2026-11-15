"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/form";
import { useSession } from "@/lib/auth";

const schema = z.object({ email: z.string().trim().email("E-mail inválido").max(120), password: z.string().min(6, "Mínimo de 6 caracteres").max(72) });
const HAS_SUPABASE = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function LoginPage() {
  const router = useRouter();
  const { login } = useSession();
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const fails = React.useRef(0);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (fails.current >= 5) return setError("Muitas tentativas. Aguarde um minuto e tente de novo.");
    const f = new FormData(e.currentTarget);
    const r = schema.safeParse({ email: f.get("email"), password: f.get("password") });
    if (!r.success) return setError(r.error.issues[0].message);
    setBusy(true);
    setError("");
    if (HAS_SUPABASE) {
      const { createClient } = await import("@/lib/supabase/client");
      const { error: err } = await createClient().auth.signInWithPassword(r.data);
      if (err) {
        fails.current++;
        setTimeout(() => (fails.current = 0), 60_000);
        setBusy(false);
        return setError("E-mail ou senha incorretos.");
      }
      router.replace("/painel");
      router.refresh();
      return;
    }
    login({ name: "Admin Guiguel", role: "admin" });
    router.replace("/painel");
  }

  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <Card className="w-full max-w-sm p-6">
        <img src="/logo.svg" alt="Guiguel" className="mx-auto mb-5 w-44" />
        <h1 className="text-center text-lg font-semibold">Entrar no sistema</h1>
        <form onSubmit={submit} noValidate>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" autoComplete="email" defaultValue={HAS_SUPABASE ? "" : "admin@guiguel.com.br"} />
          <Label htmlFor="password">Senha</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" defaultValue={HAS_SUPABASE ? "" : "demonstracao"} />
          {error && <p role="alert" className="mt-3 text-sm text-bad">{error}</p>}
          <Button type="submit" className="mt-5 w-full" disabled={busy}>{busy ? "Entrando…" : "Entrar"}</Button>
        </form>
        {!HAS_SUPABASE && <p className="mt-4 text-center text-xs text-muted-foreground">Modo demonstração: qualquer e-mail e senha entram. Os dados ficam só neste aparelho.</p>}
      </Card>
    </main>
  );
}
