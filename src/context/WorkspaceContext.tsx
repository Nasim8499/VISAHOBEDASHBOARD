import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export interface BusinessRow {
  id: string;
  slug: string | null;
  name: string;
  category: string;
  city: string;
  country: string;
  logo: string;
  cover: string;
  color: string;
  slogan: string;
  font: string;
  status: "active" | "paused" | "completed";
  stage: string;
  deadline: string | null;
  budget: string;
  progress: number;
  manager_name: string;
  palette: string[];
}

interface Ctx {
  workspace: BusinessRow | null;
  setWorkspaceId: (id: string) => void;
  all: BusinessRow[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const WorkspaceCtx = createContext<Ctx | null>(null);
const LS_KEY = "visahobe.activeWorkspace";

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [all, setAll] = useState<BusinessRow[]>([]);
  const [id, setId] = useState<string | null>(() => localStorage.getItem(LS_KEY));
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) {
      setAll([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("businesses")
      .select("*")
      .order("created_at", { ascending: true });
    const rows = (data || []) as BusinessRow[];
    setAll(rows);
    setLoading(false);
    if (!id && rows.length) {
      setId(rows[0].id);
      localStorage.setItem(LS_KEY, rows[0].id);
    } else if (id && !rows.find((r) => r.id === id) && rows.length) {
      setId(rows[0].id);
      localStorage.setItem(LS_KEY, rows[0].id);
    }
  }, [session, id]);

  useEffect(() => {
    load();
  }, [load]);

  const setWorkspaceId = (next: string) => {
    setId(next);
    localStorage.setItem(LS_KEY, next);
  };

  const value = useMemo<Ctx>(
    () => ({
      workspace: all.find((b) => b.id === id) || all[0] || null,
      setWorkspaceId,
      all,
      loading,
      refresh: load,
    }),
    [all, id, loading, load]
  );

  return <WorkspaceCtx.Provider value={value}>{children}</WorkspaceCtx.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceCtx);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}
