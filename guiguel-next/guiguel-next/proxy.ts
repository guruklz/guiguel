import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED = ["/painel", "/mapa", "/os", "/pendencias", "/paradas", "/planos", "/diario", "/equipamentos", "/cadastros", "/estoque", "/analises", "/relatorios", "/admin"];

// Com Supabase configurado: renova a sessão e bloqueia rotas privadas (e /admin por papel).
// Sem Supabase (modo demonstração): a proteção é feita no cliente (components/app/shell.tsx).
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isPrivate = PROTECTED.some((p) => path === p || path.startsWith(p + "/"));
  if (isPrivate && !data.user) return NextResponse.redirect(new URL("/login", request.url));
  if (path.startsWith("/admin") && data.user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
    if (profile?.role !== "admin") return NextResponse.redirect(new URL("/painel", request.url));
  }
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|.*\\.(?:png|svg|mp4|jpg|ico)$).*)"] };
