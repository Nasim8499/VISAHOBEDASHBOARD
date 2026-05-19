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

export interface Workspace extends BusinessRow {
  manager: string;
  managerAvatar: string;
  lastActivity: string;
}

interface Ctx {
  workspace: Workspace;
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

  const value = useMemo<Ctx>(() => {
    const raw = all.find((b) => b.id === id) || all[0] || null;
    const base: BusinessRow = raw || {
      id: "none",
      slug: null,
      name: "No workspace yet",
      category: "—",
      city: "",
      country: "",
      logo: "🏢",
      cover: "",
      color: "#003B73",
      slogan: "Create a client business to get started.",
      font: "Inter",
      status: "active",
      stage: "Discovery",
      deadline: null,
      budget: "",
      progress: 0,
      manager_name: "VisaHOBe",
      palette: ["#003B73", "#177BBB", "#E63946", "#F1573D", "#F8FAFC"],
    };
    const workspace = {
      ...base,
      manager: base.manager_name,
      managerAvatar: (base.manager_name || "VH")
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      lastActivity: "Updated recently",
    } as any;
    return { workspace, setWorkspaceId, all, loading, refresh: load };
  }, [all, id, loading, load]);

  return <WorkspaceCtx.Provider value={value}>{children}</WorkspaceCtx.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceCtx);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}
