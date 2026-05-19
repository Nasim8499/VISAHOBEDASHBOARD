import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { businesses, BusinessWorkspace } from "@/data/mock";

interface Ctx {
  workspace: BusinessWorkspace;
  setWorkspaceId: (id: string) => void;
  all: BusinessWorkspace[];
}

const WorkspaceCtx = createContext<Ctx | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState("spicebite");
  const value = useMemo<Ctx>(() => ({
    workspace: businesses.find((b) => b.id === id) || businesses[0],
    setWorkspaceId: setId,
    all: businesses,
  }), [id]);
  return <WorkspaceCtx.Provider value={value}>{children}</WorkspaceCtx.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceCtx);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}
