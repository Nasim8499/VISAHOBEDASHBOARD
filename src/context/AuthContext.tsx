import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "super_admin" | "employee" | "client";

interface Ctx {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  fullName: string;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1) Set up listener FIRST (per docs)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) {
        setRole(null);
        setFullName("");
        setLoading(false);
        return;
      }
      // Defer DB lookups to avoid deadlock
      setTimeout(() => {
        loadRoleAndProfile(s.user.id);
      }, 0);
    });

    // 2) Then check existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadRoleAndProfile(data.session.user.id);
      else setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadRoleAndProfile(uid: string) {
    const [{ data: roleRow }, { data: prof }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid).order("role").limit(1).maybeSingle(),
      supabase.from("profiles").select("full_name").eq("id", uid).maybeSingle(),
    ]);
    // Highest privilege wins: super_admin > employee > client
    const roles = ((await supabase.from("user_roles").select("role").eq("user_id", uid)).data || []).map((r) => r.role);
    const best: AppRole = roles.includes("super_admin")
      ? "super_admin"
      : roles.includes("employee")
      ? "employee"
      : (roleRow?.role as AppRole) || "client";
    setRole(best);
    setFullName(prof?.full_name || "");
    setLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setRole(null);
  }

  return (
    <AuthCtx.Provider value={{ session, user: session?.user ?? null, role, fullName, loading, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
}
