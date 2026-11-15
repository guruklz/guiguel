"use client";
import { useCallback, useEffect, useState } from "react";
import type { Role } from "./types";

// Sessão de demonstração. Com Supabase configurado, o login real usa supabase.auth (ver app/(auth)/login).
export const SESSION_KEY = "guiguel-session";
export interface SessionUser { name: string; role: Role }

export function useSession() {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined); // undefined = carregando
  useEffect(() => {
    try {
      const r = localStorage.getItem(SESSION_KEY);
      setUser(r ? (JSON.parse(r) as SessionUser) : null);
    } catch {
      setUser(null);
    }
  }, []);
  const login = useCallback((u: SessionUser) => {
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(u)); } catch { /* ignore */ }
    setUser(u);
  }, []);
  const logout = useCallback(() => {
    try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
    setUser(null);
  }, []);
  return { user, login, logout };
}
