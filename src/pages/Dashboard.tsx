import { PageContainer } from "@/components/layout/Page";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/context/WorkspaceContext";
import { activity, deliverables, insights, meetings } from "@/data/mock";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock3,
  DollarSign,
  FolderKanban,
  Sparkles,
  Plus,
  MessageSquare,
  Video,
  Wand2,
  FileText,
  ChevronRight,
  Rocket,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  BB_TEMPLATES,
  BBStage,
  BBState,
  daysUntil,
  isDueSoon,
  isOverdue,
  loadEvents,
  loadStages,
  loadTemplateId,
  pickTemplateForCategory,
  pushEvent,
  saveStages,
  saveTemplateId,
  templateToStages,
} from "@/lib/brandBuilder";


const kpis = [
  {
    label: "Total Clients",
    value: "24",
    delta: "+3",
    icon: Building2,
    tone: "bg-gradient-blue",
    trend: [6, 8, 7, 10, 12, 14, 13, 16, 18, 20, 22, 24],
    sub: "12 mo growth",
  },
  {
    label: "Active Projects",
    value: "12",
    delta: "+2",
    icon: FolderKanban,
    tone: "bg-gradient-red",
    trend: [4, 5, 7, 6, 8, 9, 8, 10, 11, 10, 12, 12],
    sub: "vs last week",
  },
  {
    label: "In Progress",
    value: "38",
    delta: "+8",
    icon: Clock3,
    tone: "bg-primary",
    trend: [22, 24, 21, 26, 28, 30, 29, 31, 33, 34, 36, 38],
    sub: "tasks moving",
  },
  {
    label: "Completed",
    value: "146",
    delta: "+12",
    icon: CheckCircle2,
    tone: "bg-success",
    trend: [80, 88, 95, 102, 110, 116, 122, 128, 132, 138, 142, 146],
    sub: "all-time",
  },
  {
    label: "Revenue · Month",
    value: "$184k",
    delta: "+18%",
    icon: DollarSign,
    tone: "bg-accent",
    trend: [90, 102, 96, 118, 124, 132, 140, 148, 156, 162, 174, 184],
    sub: "MRR trend",
    bars: true,
  },
];

function Sparkline({ data, bars = false }: { data: number[]; bars?: boolean }) {
  const W = 100;
  const H = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = W / (data.length - 1);
  const pts = data.map((v, i) => [i * step, H - ((v - min) / range) * (H - 4) - 2] as const);

  if (bars) {
    const bw = W / data.length - 1.5;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-8 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparkBar" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {data.map((v, i) => {
          const h = ((v - min) / range) * (H - 4) + 3;
          return (
            <rect
              key={i}
              x={i * (W / data.length) + 0.75}
              y={H - h}
              width={bw}
              height={h}
              rx={1.2}
              fill="url(#sparkBar)"
            />
          );
        })}
      </svg>
    );
  }

  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  const area = `${d} L${W},${H} L0,${H} Z`;
  const last = pts[pts.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-8 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkFill)" />
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.2" fill="currentColor" />
      <circle cx={last[0]} cy={last[1]} r="4.5" fill="currentColor" opacity="0.18">
        <animate attributeName="r" values="3;6;3" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.25;0;0.25" dur="2.4s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}


function EmptyDashboard() {
  return (
    <PageContainer>
      <div className="grid min-h-[70vh] place-items-center">
        <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-10 text-center shadow-elegant">
          <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-gradient-blue text-white shadow-glow">
            <Rocket className="size-7" />
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            VisaHOBe Business OS
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
            Launch your first client business
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
            Create a workspace to start branding, building, and operating a client business
            from a single command center.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-2 text-left text-xs">
            {[
              { icon: Building2, label: "Onboard client" },
              { icon: Wand2, label: "Build brand" },
              { icon: Rocket, label: "Launch & grow" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-muted/40 p-3">
                <s.icon className="mb-2 size-4 text-primary" />
                <div className="font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              to="/clients/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-blue px-5 py-3 text-sm font-semibold text-white shadow-elegant transition hover:shadow-glow"
            >
              <Plus className="size-4" /> Create first workspace
            </Link>
            <Link
              to="/clients"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold transition hover:bg-muted"
            >
              Browse clients <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function DashboardSkeleton() {
  return (
    <PageContainer>
      <div className="mb-6 space-y-3 animate-fade-in">
        <div className="h-4 w-48 rounded bg-muted animate-pulse" />
        <div className="h-8 w-2/3 rounded bg-muted animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl border border-border bg-card p-4">
            <div className="h-4 w-20 rounded bg-muted animate-pulse mb-3" />
            <div className="h-7 w-16 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-64 rounded-2xl border border-border bg-card animate-pulse lg:col-span-2" />
        <div className="h-64 rounded-2xl border border-border bg-card animate-pulse" />
      </div>
    </PageContainer>
  );
}

export default function Dashboard() {
  const { workspace, all, loading } = useWorkspace();
  const navigate = useNavigate();
  const [quickReply, setQuickReply] = useState("");

  // Brand Builder: template (per workspace/category) + persisted stages + timeline.
  const initialTpl = pickTemplateForCategory(workspace?.category);
  const [templateId, setTemplateId] = useState<string>(initialTpl.id);
  const [stages, setStages] = useState<BBStage[]>(() => templateToStages(initialTpl));
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [events, setEvents] = useState(() => (workspace?.id ? loadEvents(workspace.id) : []));

  useEffect(() => {
    if (!workspace?.id) return;
    const storedId = loadTemplateId(workspace.id);
    const tpl = storedId
      ? BB_TEMPLATES.find((t) => t.id === storedId) ?? pickTemplateForCategory(workspace.category)
      : pickTemplateForCategory(workspace.category);
    setTemplateId(tpl.id);
    setStages(loadStages(workspace.id, templateToStages(tpl)));
    setEvents(loadEvents(workspace.id));
  }, [workspace?.id, workspace?.category]);

  useEffect(() => {
    if (workspace?.id) saveStages(workspace.id, stages);
  }, [stages, workspace?.id]);

  const logEvent = (e: Parameters<typeof pushEvent>[1]) => {
    if (!workspace?.id) return;
    pushEvent(workspace.id, e);
    setEvents(loadEvents(workspace.id));
  };

  const updateStage = (i: number, patch: Partial<BBStage>) =>
    setStages((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const markDone = (i: number) => {
    updateStage(i, { pct: 100, state: "done" });
    toast.success(`${stages[i].label} marked as done`);
    logEvent({ stageKey: stages[i].key, stageLabel: stages[i].label, type: "stage.done", message: `Marked “${stages[i].label}” as done` });
  };
  const requestReview = (i: number) => {
    updateStage(i, { state: "review", pct: Math.max(stages[i].pct, 80) });
    toast.message(`Review requested · ${stages[i].label}`, { description: "Internal QA team notified." });
    logEvent({ stageKey: stages[i].key, stageLabel: stages[i].label, type: "stage.review", message: `Requested internal review for “${stages[i].label}”` });
  };
  const sendToClient = (i: number) => {
    updateStage(i, { state: "sent", pct: Math.max(stages[i].pct, 90) });
    toast.success(`Sent to client · ${stages[i].label}`, { description: "Awaiting client approval." });
    logEvent({ stageKey: stages[i].key, stageLabel: stages[i].label, type: "stage.sent", message: `Sent “${stages[i].label}” to client for approval` });
  };
  const setDue = (i: number, due: string) => {
    updateStage(i, { due });
    toast.success(`Due date updated · ${stages[i].label}`);
    logEvent({ stageKey: stages[i].key, stageLabel: stages[i].label, type: "stage.due_updated", message: `Updated due date for “${stages[i].label}” to ${due}` });
  };
  const resetStage = (i: number) => {
    updateStage(i, { pct: 0, state: "queued" });
    toast.message(`${stages[i].label} reset to queued`);
    logEvent({ stageKey: stages[i].key, stageLabel: stages[i].label, type: "stage.reset", message: `Reset “${stages[i].label}” to queued` });
  };
  const switchTemplate = (id: string) => {
    const tpl = BB_TEMPLATES.find((t) => t.id === id);
    if (!tpl || !workspace?.id) return;
    setTemplateId(id);
    saveTemplateId(workspace.id, id);
    const next = templateToStages(tpl);
    setStages(next);
    saveStages(workspace.id, next);
    toast.success(`Template applied · ${tpl.name}`);
    logEvent({ stageKey: "_template", stageLabel: tpl.name, type: "template.switched", message: `Switched template to “${tpl.name}”` });
  };


  if (loading) return <DashboardSkeleton />;
  if (all.length === 0) return <EmptyDashboard />;



  return (
    <PageContainer>
      {/* Greeting */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Good afternoon, VisaHOBe Admin 👋</p>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Operate every client business from one workspace.
          </h1>
        </div>
        <div className="flex gap-2">
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 380, damping: 24 }}>
            <Link
              to="/clients/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-blue px-4 py-2.5 text-sm font-semibold text-white shadow-elegant transition hover:shadow-glow"
            >
              <Plus className="size-4" /> Add Client Business
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 380, damping: 24 }}>
            <Link
              to="/reports"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted"
            >
              View Reports <ArrowUpRight className="size-4" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* KPI cards — each one a distinct mini-infographic */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((k, idx) => {
          // Distinct visual per card
          const styles = [
            { ring: "hsl(var(--accent))", soft: "bg-accent/10", text: "text-accent", glow: "bg-accent/30" },
            { ring: "hsl(var(--destructive))", soft: "bg-destructive/10", text: "text-destructive", glow: "bg-destructive/30" },
            { ring: "hsl(var(--primary))", soft: "bg-primary/10", text: "text-primary", glow: "bg-primary/30" },
            { ring: "hsl(var(--success))", soft: "bg-success/10", text: "text-success", glow: "bg-success/30" },
            { ring: "hsl(var(--warning))", soft: "bg-warning/10", text: "text-warning", glow: "bg-warning/30" },
          ];
          const s = styles[idx % styles.length];
          const num = parseInt(String(k.value).replace(/\D/g, "")) || 0;
          const pct = Math.min(100, Math.max(15, (num / (num > 100 ? num * 1.2 : 50)) * 100));

          // Infographic variants
          const renderInfographic = () => {
            switch (idx) {
              case 0: {
                // Total Clients — progress ring
                const R = 14;
                const C = 2 * Math.PI * R;
                return (
                  <div className="relative grid size-10 place-items-center">
                    <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
                      <circle cx="20" cy="20" r={R} fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                      <circle
                        cx="20" cy="20" r={R} fill="none"
                        stroke={s.ring} strokeWidth="3" strokeLinecap="round"
                        strokeDasharray={`${(pct / 100) * C} ${C}`}
                      />
                    </svg>
                    <span className="absolute text-[9px] font-bold">{Math.round(pct)}%</span>
                  </div>
                );
              }
              case 1:
                // Active Projects — segmented dots row
                return (
                  <div className="flex h-10 items-end gap-1">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <span
                        key={i}
                        className="w-1.5 rounded-full vh-shimmer"
                        style={{
                          height: `${20 + (i % 4) * 16}%`,
                          background: i < 5 ? s.ring : "hsl(var(--muted))",
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                );
              case 2:
                // In Progress — animated dashed flow
                return (
                  <svg width="56" height="40" viewBox="0 0 56 40" className="overflow-visible">
                    <path d="M2 20 Q14 4 28 20 T54 20" fill="none" stroke={s.ring} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4">
                      <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.2s" repeatCount="indefinite" />
                    </path>
                    <circle r="3" fill={s.ring}>
                      <animateMotion dur="2.2s" repeatCount="indefinite" path="M2 20 Q14 4 28 20 T54 20" />
                    </circle>
                  </svg>
                );
              case 3:
                // Completed — checkmark stack of bars
                return (
                  <div className="space-y-1">
                    {[100, 80, 60].map((w, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <CheckCircle2 className={`size-2.5 ${s.text}`} />
                        <span
                          className="h-1 rounded-full vh-shimmer"
                          style={{ width: `${w * 0.32}px`, background: s.ring, animationDelay: `${i * 0.15}s` }}
                        />
                      </div>
                    ))}
                  </div>
                );
              default:
                // Revenue — area + dot
                return (
                  <svg width="64" height="36" viewBox="0 0 64 36">
                    <defs>
                      <linearGradient id={`rev-${idx}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={s.ring} stopOpacity="0.5" />
                        <stop offset="100%" stopColor={s.ring} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0 28 L10 22 L20 24 L30 14 L42 18 L52 8 L64 12 L64 36 L0 36 Z" fill={`url(#rev-${idx})`} />
                    <path d="M0 28 L10 22 L20 24 L30 14 L42 18 L52 8 L64 12" fill="none" stroke={s.ring} strokeWidth="2" strokeLinecap="round" />
                    <circle cx="64" cy="12" r="3" fill={s.ring}>
                      <animate attributeName="r" values="3;5;3" dur="1.4s" repeatCount="indefinite" />
                    </circle>
                  </svg>
                );
            }
          };

          return (
            <div
              key={k.label}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-sm transition-all hover:-translate-y-1 hover:shadow-elegant sm:p-4"
            >
              {/* corner glow */}
              <span className={`pointer-events-none absolute -right-8 -top-8 size-24 rounded-full blur-2xl opacity-60 transition-opacity group-hover:opacity-100 ${s.glow} vh-float`} />

              {/* dotted bg */}
              <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05]">
                <defs>
                  <pattern id={`kpi-dots-${idx}`} width="8" height="8" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#kpi-dots-${idx})`} />
              </svg>

              <div className="relative flex items-start justify-between">
                <span className="grid size-9 place-items-center rounded-xl text-white shadow-elegant transition-transform group-hover:scale-110 group-hover:rotate-6" style={{ background: s.ring }}>
                  <k.icon className="size-4" />
                </span>
                <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${s.soft} ${s.text}`}>
                  <ArrowUpRight className="size-2.5" />
                  {k.delta}
                </span>
              </div>

              <div className="relative mt-3 font-display text-2xl font-extrabold leading-none tracking-tight">
                {k.value}
              </div>
              <div className="relative mt-1 text-[11px] font-semibold text-foreground/80">{k.label}</div>

              {/* Per-card infographic */}
              <div className={`relative mt-2.5 ${s.text}`}>{renderInfographic()}</div>

              <div className="relative mt-1.5 flex items-center justify-between text-[9px] uppercase tracking-wider text-muted-foreground">
                <span>{k.sub}</span>
                <span className={`font-bold ${s.text}`}>●</span>
              </div>
            </div>
          );
        })}
      </div>



      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 xl:col-span-2">
          {/* Featured project */}
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-elegant">
            <div className="relative h-48 sm:h-64">
              <img
                src={workspace.cover}
                alt={`${workspace.name} cover`}
                className="absolute inset-0 size-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/85 via-[#0B132B]/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-12 place-items-center rounded-2xl text-xl ring-2 ring-white/40"
                    style={{ background: workspace.color }}
                  >
                    {workspace.logo}
                  </span>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-white/70">
                      Featured active project
                    </div>
                    <h3 className="text-xl font-bold sm:text-2xl">{workspace.name}</h3>
                    <div className="text-xs text-white/80">
                      {workspace.category} · {workspace.city}, {workspace.country}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-4 sm:p-6">
              <Meta label="Project Manager" value={workspace.manager} />
              <Meta label="Deadline" value={workspace.deadline} />
              <Meta label="Budget" value={workspace.budget} />
              <Meta label="Stage" value={workspace.stage} />
            </div>
            <div className="px-5 pb-5 sm:px-6 sm:pb-6">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Overall Progress</span>
                <span className="font-semibold text-foreground">{workspace.progress}%</span>
              </div>
              <ProgressBar value={workspace.progress} />
              <motion.div
                className="mt-4 flex flex-wrap gap-2"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
                }}
              >
                {[
                  { type: "link", to: `/workspace/${workspace.id}`, label: "Open Workspace", icon: ChevronRight, primary: true },
                  { type: "button", onClick: () => navigate("/ai-assistant"), label: "AI Agent", icon: Sparkles, gradient: true },
                  { type: "button", onClick: () => navigate("/chat"), label: "Chat with client", icon: MessageSquare },
                  { type: "button", onClick: () => navigate("/calendar"), label: "Schedule meeting", icon: Video },
                  { type: "button", onClick: () => navigate("/billing"), label: "Generate invoice", icon: FileText },
                ].map((b: any) => {
                  const cls = b.primary
                    ? "inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm"
                    : b.gradient
                    ? "inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-accent to-primary px-3 py-2 text-xs font-semibold text-white shadow-elegant"
                    : "inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold";
                  return (
                    <motion.div
                      key={b.label}
                      variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                      whileHover={{ y: -2, scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 380, damping: 22 }}
                    >
                      {b.type === "link" ? (
                        <Link to={b.to} className={cls}>
                          {b.label} <b.icon className="size-3.5" />
                        </Link>
                      ) : (
                        <button onClick={b.onClick} className={cls}>
                          <b.icon className={`size-3.5 ${b.gradient ? "animate-pulse" : ""}`} /> {b.label}
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </div>



        </div>

      </div>

    </PageContainer>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}

