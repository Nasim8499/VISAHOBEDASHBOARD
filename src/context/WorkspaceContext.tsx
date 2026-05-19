import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { logClientWarn } from "@/utils/logger";

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

export const EMPTY_BUSINESS: BusinessRow = {
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

export const EMPTY_WORKSPACE: Workspace = normalizeWorkspace(EMPTY_BUSINESS);

/** Ensures every Workspace consumer receives a fully populated, type-safe shape. */
export function normalizeWorkspace(input: Partial<BusinessRow> | null | undefined): Workspace {
  const base = input || {};
  const missing: string[] = [];
  const pick = <K extends keyof BusinessRow>(k: K, fallback: BusinessRow[K]): BusinessRow[K] => {
    const v = base[k];
    if (v === undefined || v === null || v === "") {
      if (input) missing.push(String(k));
      return fallback;
    }
    return v as BusinessRow[K];
  };

  const palette = Array.isArray(base.palette) && base.palette.length
    ? base.palette
    : EMPTY_BUSINESS.palette;

  const row: BusinessRow = {
    id: pick("id", EMPTY_BUSINESS.id),
    slug: (base.slug ?? null) as string | null,
    name: pick("name", EMPTY_BUSINESS.name),
    category: pick("category", EMPTY_BUSINESS.category),
    city: pick("city", EMPTY_BUSINESS.city),
    country: pick("country", EMPTY_BUSINESS.country),
    logo: pick("logo", EMPTY_BUSINESS.logo),
    cover: pick("cover", EMPTY_BUSINESS.cover),
    color: pick("color", EMPTY_BUSINESS.color),
    slogan: pick("slogan", EMPTY_BUSINESS.slogan),
    font: pick("font", EMPTY_BUSINESS.font),
    status: pick("status", EMPTY_BUSINESS.status),
    stage: pick("stage", EMPTY_BUSINESS.stage),
    deadline: (base.deadline ?? null) as string | null,
    budget: pick("budget", EMPTY_BUSINESS.budget),
    progress: typeof base.progress === "number" ? base.progress : EMPTY_BUSINESS.progress,
    manager_name: pick("manager_name", EMPTY_BUSINESS.manager_name),
    palette,
  };

  if (input && missing.length) {
    logClientWarn("normalizeWorkspace filled missing fields", { id: row.id, missing });
  }

  return {
    ...row,
    manager: row.manager_name,
    managerAvatar: row.manager_name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "VH",
    lastActivity: "Updated recently",
  };
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
    const workspace = raw ? normalizeWorkspace(raw) : EMPTY_WORKSPACE;
    return { workspace, setWorkspaceId, all, loading, refresh: load };
  }, [all, id, loading, load]);

  return <WorkspaceCtx.Provider value={value}>{children}</WorkspaceCtx.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceCtx);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}
