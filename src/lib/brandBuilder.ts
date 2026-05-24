// Brand Builder shared types, templates, and per-workspace persistence helpers.
// All state is stored in localStorage so it survives sessions per workspace.

export type BBState = "queued" | "active" | "review" | "sent" | "approved" | "rejected" | "done";

export type BBStage = {
  key: string;
  label: string;
  icon: string;
  pct: number;
  due: string; // ISO yyyy-mm-dd
  state: BBState;
  clientComment?: string;
};

export type BBTemplate = {
  id: string;
  name: string;
  // Plain-text category names this template best fits (matched case-insensitive, substring ok)
  fitCategories: string[];
  stages: Array<{
    key: string;
    label: string;
    icon: string;
    // default offset in days from "today" for the due date
    dueOffsetDays: number;
    // optional starting state/pct so the first preview looks alive
    pct?: number;
    state?: BBState;
  }>;
};

export type BBEvent = {
  id: string;
  workspaceId: string;
  stageKey: string;
  stageLabel: string;
  type:
    | "stage.done"
    | "stage.review"
    | "stage.sent"
    | "stage.approved"
    | "stage.rejected"
    | "stage.reset"
    | "stage.due_updated"
    | "template.switched";
  message: string;
  comment?: string;
  at: string; // ISO timestamp
};

// ----- Templates ---------------------------------------------------------

export const BB_TEMPLATES: BBTemplate[] = [
  {
    id: "standard",
    name: "Standard Brand Build",
    fitCategories: ["default"],
    stages: [
      { key: "identity", label: "Identity & Strategy", icon: "✦", dueOffsetDays: -14, pct: 100, state: "done" },
      { key: "visual", label: "Visual Identity", icon: "◐", dueOffsetDays: -7, pct: 100, state: "done" },
      { key: "stationery", label: "Stationery Kit", icon: "✉", dueOffsetDays: 0, pct: 100, state: "done" },
      { key: "social", label: "Social Media", icon: "❍", dueOffsetDays: 7, pct: 65, state: "active" },
      { key: "launch", label: "Launch", icon: "▲", dueOffsetDays: 14, pct: 0, state: "queued" },
    ],
  },
  {
    id: "hospitality",
    name: "Restaurant & Hospitality",
    fitCategories: ["restaurant", "hospitality", "cafe", "hotel"],
    stages: [
      { key: "concept", label: "Concept & Story", icon: "✦", dueOffsetDays: -10, pct: 100, state: "done" },
      { key: "menu", label: "Menu Design", icon: "✿", dueOffsetDays: -3, pct: 80, state: "active" },
      { key: "signage", label: "Signage & Interior", icon: "◐", dueOffsetDays: 4, pct: 30, state: "active" },
      { key: "delivery", label: "Delivery Packaging", icon: "✉", dueOffsetDays: 10, pct: 0, state: "queued" },
      { key: "campaign", label: "Opening Campaign", icon: "▲", dueOffsetDays: 18, pct: 0, state: "queued" },
    ],
  },
  {
    id: "travel",
    name: "Travel & Tourism",
    fitCategories: ["travel", "tourism", "agency"],
    stages: [
      { key: "research", label: "Audience Research", icon: "✦", dueOffsetDays: -12, pct: 100, state: "done" },
      { key: "brand", label: "Visual Identity", icon: "◐", dueOffsetDays: -2, pct: 90, state: "review" },
      { key: "site", label: "Booking Website", icon: "✉", dueOffsetDays: 6, pct: 45, state: "active" },
      { key: "social", label: "Social Storytelling", icon: "❍", dueOffsetDays: 12, pct: 0, state: "queued" },
      { key: "launch", label: "Destination Launch", icon: "▲", dueOffsetDays: 21, pct: 0, state: "queued" },
    ],
  },
  {
    id: "ecom",
    name: "E-commerce & Retail",
    fitCategories: ["e-commerce", "ecommerce", "retail", "shop"],
    stages: [
      { key: "positioning", label: "Brand Positioning", icon: "✦", dueOffsetDays: -10, pct: 100, state: "done" },
      { key: "visual", label: "Packaging & Visual", icon: "◐", dueOffsetDays: -3, pct: 70, state: "active" },
      { key: "store", label: "Storefront Build", icon: "✉", dueOffsetDays: 5, pct: 40, state: "active" },
      { key: "campaign", label: "Launch Campaign", icon: "❍", dueOffsetDays: 12, pct: 0, state: "queued" },
      { key: "retention", label: "Retention Loop", icon: "▲", dueOffsetDays: 24, pct: 0, state: "queued" },
    ],
  },
  {
    id: "wellness",
    name: "Beauty & Wellness",
    fitCategories: ["beauty", "wellness", "spa", "fitness", "health"],
    stages: [
      { key: "story", label: "Story & Values", icon: "✦", dueOffsetDays: -10, pct: 100, state: "done" },
      { key: "visual", label: "Visual Identity", icon: "◐", dueOffsetDays: -2, pct: 80, state: "active" },
      { key: "booking", label: "Booking Funnel", icon: "✉", dueOffsetDays: 5, pct: 30, state: "active" },
      { key: "content", label: "Content System", icon: "❍", dueOffsetDays: 11, pct: 0, state: "queued" },
      { key: "launch", label: "Grand Opening", icon: "▲", dueOffsetDays: 20, pct: 0, state: "queued" },
    ],
  },
  {
    id: "realestate",
    name: "Real Estate",
    fitCategories: ["real estate", "property"],
    stages: [
      { key: "brand", label: "Brand Architecture", icon: "✦", dueOffsetDays: -12, pct: 100, state: "done" },
      { key: "listings", label: "Listing Templates", icon: "◐", dueOffsetDays: -2, pct: 75, state: "active" },
      { key: "site", label: "Listings Website", icon: "✉", dueOffsetDays: 7, pct: 30, state: "active" },
      { key: "tours", label: "Virtual Tours", icon: "❍", dueOffsetDays: 14, pct: 0, state: "queued" },
      { key: "campaign", label: "Open House Campaign", icon: "▲", dueOffsetDays: 22, pct: 0, state: "queued" },
    ],
  },
];

export function pickTemplateForCategory(category?: string): BBTemplate {
  if (!category) return BB_TEMPLATES[0];
  const c = category.toLowerCase();
  for (const t of BB_TEMPLATES) {
    if (t.fitCategories.some((k) => c.includes(k))) return t;
  }
  return BB_TEMPLATES[0];
}

export function templateToStages(t: BBTemplate): BBStage[] {
  const base = Date.now();
  return t.stages.map((s) => ({
    key: s.key,
    label: s.label,
    icon: s.icon,
    pct: s.pct ?? 0,
    state: s.state ?? "queued",
    due: new Date(base + s.dueOffsetDays * 86400000).toISOString().slice(0, 10),
  }));
}

// ----- Persistence -------------------------------------------------------

const stagesKey = (wsId: string) => `vh-bb-${wsId}`;
const tplKey = (wsId: string) => `vh-bb-tpl-${wsId}`;
const eventsKey = (wsId: string) => `vh-bb-events-${wsId}`;

export function loadTemplateId(wsId: string): string | null {
  try { return localStorage.getItem(tplKey(wsId)); } catch { return null; }
}
export function saveTemplateId(wsId: string, id: string) {
  try { localStorage.setItem(tplKey(wsId), id); } catch {}
}

export function loadStages(wsId: string, fallback: BBStage[]): BBStage[] {
  try {
    const raw = localStorage.getItem(stagesKey(wsId));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as BBStage[];
    if (!Array.isArray(parsed) || parsed.length === 0) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}
export function saveStages(wsId: string, stages: BBStage[]) {
  try { localStorage.setItem(stagesKey(wsId), JSON.stringify(stages)); } catch {}
}

export function loadEvents(wsId: string): BBEvent[] {
  try {
    const raw = localStorage.getItem(eventsKey(wsId));
    if (!raw) return [];
    return JSON.parse(raw) as BBEvent[];
  } catch { return []; }
}
export function pushEvent(wsId: string, e: Omit<BBEvent, "id" | "at" | "workspaceId">): BBEvent {
  const evt: BBEvent = {
    ...e,
    id: (crypto as any)?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    at: new Date().toISOString(),
    workspaceId: wsId,
  };
  const list = [evt, ...loadEvents(wsId)].slice(0, 50);
  try { localStorage.setItem(eventsKey(wsId), JSON.stringify(list)); } catch {}
  return evt;
}

// All workspaces — aggregate for the global approval inbox
export function listAllPendingApprovals(workspaces: Array<{ id: string; name: string; logo?: string; color?: string; category?: string }>) {
  const out: Array<{ wsId: string; wsName: string; wsLogo?: string; wsColor?: string; stage: BBStage }> = [];
  for (const ws of workspaces) {
    const tpl = pickTemplateForCategory(ws.category);
    const stages = loadStages(ws.id, templateToStages(tpl));
    for (const s of stages) {
      if (s.state === "sent" || s.state === "rejected") {
        out.push({ wsId: ws.id, wsName: ws.name, wsLogo: ws.logo, wsColor: ws.color, stage: s });
      }
    }
  }
  return out;
}

// ----- Date helpers ------------------------------------------------------

export function daysUntil(dueIso: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(dueIso); due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86400000);
}
export function isOverdue(s: BBStage): boolean {
  if (s.pct >= 100 || s.state === "done" || s.state === "approved") return false;
  return daysUntil(s.due) < 0;
}
export function isDueSoon(s: BBStage, withinDays = 3): boolean {
  if (s.pct >= 100 || s.state === "done" || s.state === "approved") return false;
  const d = daysUntil(s.due);
  return d >= 0 && d <= withinDays;
}
