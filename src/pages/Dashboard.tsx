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
  Calendar,
  Rocket,
  Palette,
  Check,
  Eye,
  Send,
  AlertTriangle,
  CalendarClock,
  RotateCcw,
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



          {/* Activity + Donut */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <Card
                title="Project Activity"
                action={
                  <div className="flex items-center gap-1.5">
                    <span className="relative grid size-2 place-items-center">
                      <span className="absolute inset-0 animate-ping rounded-full bg-success/60" />
                      <span className="relative size-2 rounded-full bg-success" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-success">Live</span>
                  </div>
                }
              >
                {(() => {
                  const tones = [
                    { dot: "bg-accent", soft: "bg-accent/10", text: "text-accent", icon: "📤", label: "Upload" },
                    { dot: "bg-primary", soft: "bg-primary/10", text: "text-primary", icon: "📅", label: "Meeting" },
                    { dot: "bg-warning", soft: "bg-warning/10", text: "text-warning", icon: "🎨", label: "Review" },
                    { dot: "bg-success", soft: "bg-success/10", text: "text-success", icon: "🚀", label: "Launch" },
                    { dot: "bg-destructive", soft: "bg-destructive/10", text: "text-destructive", icon: "📄", label: "Delivery" },
                  ];
                  return (
                    <ol className="relative space-y-3">
                      {/* vertical rail */}
                      <span className="pointer-events-none absolute bottom-2 left-[18px] top-2 w-px bg-gradient-to-b from-accent/40 via-border to-transparent" />

                      {activity.map((a, i) => {
                        const t = tones[i % tones.length];
                        const initials = a.who.split(" ").map((n) => n[0]).join("");
                        return (
                          <li
                            key={i}
                            className="group relative flex gap-3 rounded-2xl border border-transparent p-2 transition-all hover:-translate-y-0.5 hover:border-border hover:bg-card hover:shadow-elegant"
                          >
                            {/* Timeline node */}
                            <div className="relative shrink-0">
                              <span
                                className={`relative grid size-9 place-items-center rounded-full text-[11px] font-bold text-white ring-4 ring-background ${t.dot}`}
                              >
                                {initials}
                                <span className={`absolute -bottom-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-background text-[9px] ring-2 ring-background`}>
                                  {t.icon}
                                </span>
                              </span>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[13px] font-bold">{a.who}</span>
                                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${t.soft} ${t.text}`}>
                                  {t.label}
                                </span>
                              </div>
                              <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
                                {a.action}{" "}
                                <span className="font-semibold text-foreground">{a.target}</span>
                              </p>
                              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                <Clock3 className="size-3" />
                                {a.time}
                                <span
                                  className={`ml-auto inline-flex items-center gap-1 text-[10px] font-semibold opacity-0 transition-opacity group-hover:opacity-100 ${t.text}`}
                                >
                                  View <ChevronRight className="size-3" />
                                </span>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  );
                })()}
              </Card>
            </div>
            <div className="lg:col-span-2">
              <Card
                title="Project Progress"
                action={<span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">On Track</span>}
              >
                {(() => {
                  const completed = 28;
                  const inProgress = 14;
                  const waiting = 4;
                  const total = completed + inProgress + waiting;
                  const pct = (n: number) => (n / total) * 100;
                  const R = 56;
                  const C = 2 * Math.PI * R;
                  const segs = [
                    { v: completed, color: "hsl(var(--success))", label: "Completed", icon: CheckCircle2 },
                    { v: inProgress, color: "hsl(var(--accent))", label: "In progress", icon: Clock3 },
                    { v: waiting, color: "hsl(var(--warning))", label: "Waiting", icon: Sparkles },
                  ];
                  let offset = 0;

                  return (
                    <div className="relative">
                      {/* corner glow */}
                      <span className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-success/20 blur-2xl vh-float" />

                      {/* Multi-segment donut */}
                      <div className="relative mx-auto grid size-[160px] place-items-center">
                        <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
                          <circle cx="80" cy="80" r={R} fill="none" stroke="hsl(var(--muted))" strokeWidth="14" />
                          {segs.map((s, i) => {
                            const len = (pct(s.v) / 100) * C;
                            const dash = `${len} ${C - len}`;
                            const el = (
                              <circle
                                key={i}
                                cx="80"
                                cy="80"
                                r={R}
                                fill="none"
                                stroke={s.color}
                                strokeWidth="14"
                                strokeLinecap="butt"
                                strokeDasharray={dash}
                                strokeDashoffset={-offset}
                                style={{ transition: "stroke-dasharray 0.9s ease" }}
                              />
                            );
                            offset += len;
                            return el;
                          })}
                          {/* Inner accent ring */}
                          <circle cx="80" cy="80" r="38" fill="none" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="2 4" />
                        </svg>
                        <div className="absolute inset-0 grid place-items-center text-center">
                          <div>
                            <div className="font-display text-3xl font-extrabold leading-none bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                              {Math.round(pct(completed))}%
                            </div>
                            <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                              Completed
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Total badge */}
                      <div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <span className="h-px w-8 bg-border" />
                        {total} Total Tasks
                        <span className="h-px w-8 bg-border" />
                      </div>

                      {/* Segmented stat bar */}
                      <div className="mt-3 flex h-2 overflow-hidden rounded-full">
                        {segs.map((s, i) => (
                          <div
                            key={i}
                            className="h-full transition-all first:rounded-l-full last:rounded-r-full vh-shimmer"
                            style={{ width: `${pct(s.v)}%`, background: s.color }}
                          />
                        ))}
                      </div>

                      {/* Stat grid */}
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {segs.map((s) => (
                          <div
                            key={s.label}
                            className="group relative overflow-hidden rounded-xl border border-border bg-card p-2 text-center transition hover:-translate-y-0.5 hover:shadow-elegant"
                          >
                            <span
                              className="pointer-events-none absolute -right-4 -top-4 size-10 rounded-full blur-xl opacity-40"
                              style={{ background: s.color }}
                            />
                            <div className="relative mx-auto grid size-7 place-items-center rounded-lg text-white" style={{ background: s.color }}>
                              <s.icon className="size-3.5" />
                            </div>
                            <div className="relative mt-1.5 font-display text-lg font-extrabold leading-none">{s.v}</div>
                            <div className="relative mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {s.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </Card>
            </div>
          </div>

          {/* Insights */}
          <Card
            title="Business Insights"
            action={<span className="rounded-full bg-accent/10 px-2 py-1 text-[11px] font-semibold text-accent">AI Powered</span>}
          >
            <ul className="space-y-3">
              {insights.map((t, i) => (
                <li key={i} className="flex gap-3 rounded-xl bg-muted/60 p-3">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" />
                  <span className="text-sm">{t}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Right panel */}
        <aside className="space-y-5">
          {/* ============ CLIENT COMMUNICATION — premium chat hub ============ */}
          <Card
            title="Client Communication"
            action={
              <Link to="/chat" className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
                Open chat <ChevronRight className="size-3" />
              </Link>
            }
          >
            {/* Animated stat ribbon */}
            <div className="relative mb-3 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[hsl(235_75%_96%)] via-card to-[hsl(260_70%_97%)] p-3">
              <span className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full bg-accent/20 blur-2xl" />
              <div className="relative flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Live inbox</div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-display text-xl font-bold">3</span>
                    <span className="text-[10px] font-medium text-muted-foreground">active chats</span>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {["R", "A", "D"].map((l, i) => (
                    <span key={l} className={`grid size-7 place-items-center rounded-full text-[10px] font-bold text-white ring-2 ring-card ${["bg-accent", "bg-warning", "bg-success"][i]}`}>
                      {l}
                    </span>
                  ))}
                </div>
              </div>
              {/* Sparkline */}
              <svg viewBox="0 0 120 24" className="mt-2 h-6 w-full">
                <polyline points="0,18 15,14 30,16 45,8 60,12 75,4 90,9 105,6 120,2"
                  fill="none" stroke="hsl(235 75% 60%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <ul className="space-y-2">
              {[
                { name: "Rohit (SpiceBite)", msg: "Loving the new logo direction!", t: "2m", unread: 2, tone: "bg-accent", emoji: "💬" },
                { name: "Aaliyah (GlowBeauty)", msg: "Can we tweak the banner copy?", t: "1h", unread: 1, tone: "bg-warning", emoji: "✏️" },
                { name: "Daniel (Elite Travel)", msg: "Approved the social kit ✅", t: "3h", unread: 0, tone: "bg-success", emoji: "✅" },
              ].map((m, i) => (
                <li key={i} className="group relative flex items-start gap-3 overflow-hidden rounded-2xl border border-border bg-card p-2.5 transition-all hover:-translate-y-0.5 hover:shadow-elegant">
                  <span className={`absolute left-0 top-0 h-full w-1 ${m.tone}`} />
                  <span className="relative shrink-0">
                    <span className={`grid size-10 place-items-center rounded-full text-sm font-bold text-white ${m.tone}`}>{m.name[0]}</span>
                    <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card bg-success" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-bold">{m.name}</span>
                      <span className="shrink-0 text-[10px] font-medium text-muted-foreground">{m.t}</span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <p className="truncate text-[11px] text-muted-foreground">
                        <span className="mr-1">{m.emoji}</span>{m.msg}
                      </p>
                      {m.unread > 0 && (
                        <span className="grid size-4 shrink-0 animate-pulse place-items-center rounded-full bg-destructive text-[9px] font-bold text-white">{m.unread}</span>
                      )}
                    </div>
                    {i === 0 && (
                      <div className="mt-1 flex items-center gap-0.5">
                        {[0, 1, 2].map((d) => (
                          <span key={d} className="size-1 animate-bounce rounded-full bg-accent" style={{ animationDelay: `${d * 0.15}s` }} />
                        ))}
                        <span className="ml-1 text-[9px] font-medium text-accent">typing…</span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!quickReply.trim()) return;
                toast.success("Reply sent", { description: quickReply });
                setQuickReply("");
              }}
              className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-1.5"
            >
              <input
                value={quickReply}
                onChange={(e) => setQuickReply(e.target.value)}
                placeholder="Quick reply…"
                className="flex-1 bg-transparent px-2 text-[12px] outline-none placeholder:text-muted-foreground"
              />
              <motion.button type="submit" whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.08 }} className="grid size-7 place-items-center rounded-lg bg-gradient-blue text-white">
                <ChevronRight className="size-3.5" />
              </motion.button>
            </form>
          </Card>

          {/* ============ UPCOMING MEETINGS — timeline rail ============ */}
          <Card title="Upcoming Meetings" action={<Link to="/meetings" className="text-xs font-semibold text-accent">Calendar →</Link>}>
            <div className="relative pl-5">
              {/* Vertical timeline */}
              <span className="absolute left-1.5 top-2 bottom-2 w-px bg-gradient-to-b from-accent via-border to-transparent" />
              <ul className="space-y-3">
                {meetings.map((m, i) => (
                  <li key={i} className="relative">
                    <span className={`absolute -left-[18px] top-3 grid size-3 place-items-center rounded-full ring-4 ring-card ${i === 0 ? "bg-accent" : "bg-muted-foreground/40"}`}>
                      {i === 0 && <span className="size-1.5 animate-ping rounded-full bg-accent" />}
                    </span>
                    <div className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition hover:-translate-y-0.5 hover:shadow-elegant">
                      <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-[hsl(230_55%_18%)] to-[hsl(235_75%_55%)] text-white shadow-elegant">
                        <Calendar className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold">{m.title}</div>
                        <div className="truncate text-[11px] text-muted-foreground">{m.business}</div>
                        <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-semibold text-accent">
                          <span className="size-1 rounded-full bg-accent" /> {m.time}
                        </div>
                      </div>
                      <button
                        onClick={() => toast.success(`Joining ${m.title}…`, { description: "Opening secure room." })}
                        className="rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-bold text-primary-foreground transition group-hover:bg-accent group-hover:text-accent-foreground"
                      >
                        Join
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* ============ AI ASSISTANT — premium glass panel ============ */}
          <Card title="AI Assistant">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(230_55%_14%)] via-[hsl(235_60%_22%)] to-[hsl(260_70%_30%)] p-4 text-white">
              {/* Parallax orbs */}
              <span className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-accent/50 blur-2xl vh-float" />
              <span className="pointer-events-none absolute -bottom-12 -left-8 size-28 rounded-full bg-[hsl(260_75%_60%)]/40 blur-2xl vh-float" style={{ animationDelay: "1s" }} />

              {/* Grid backdrop */}
              <svg className="pointer-events-none absolute inset-0 size-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="ai-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M20 0H0V20" fill="none" stroke="white" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#ai-grid)" />
              </svg>

              {/* Soundwave */}
              <svg className="pointer-events-none absolute bottom-2 right-3 opacity-40" width="80" height="32" viewBox="0 0 80 32">
                {Array.from({ length: 12 }).map((_, i) => (
                  <rect key={i} x={i * 7} y={16 - (4 + (i % 4) * 4)} width="3" height={8 + (i % 4) * 8} rx="1.5" fill="white"
                    style={{ animation: `vh-rise 1.${i}s ease-in-out ${i * 0.08}s infinite alternate` }} />
                ))}
              </svg>

              <div className="relative flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
                  <Sparkles className="size-3 animate-pulse" /> VisaHOBe AI
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-semibold text-success">
                  <span className="size-1.5 animate-pulse rounded-full bg-success" /> Online
                </span>
              </div>

              <div className="relative mt-3 flex items-start gap-2.5">
                <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur">
                  <span className="absolute inset-0 animate-ping rounded-full bg-white/20" />
                  <Wand2 className="relative size-4" />
                </span>
                <div className="relative rounded-2xl rounded-tl-sm border border-white/15 bg-white/10 p-2.5 backdrop-blur">
                  <p className="text-[13px] leading-relaxed">
                    Want me to draft a launch caption for{" "}
                    <span className="font-semibold underline decoration-warning decoration-2 underline-offset-2">{workspace.name}</span>{" "}
                    and 3 ad variations?
                  </p>
                </div>
              </div>

              <div className="relative mt-3 flex flex-wrap gap-1.5">
                {["Captions", "Ad Copy", "Hashtags"].map((c) => (
                  <span key={c} className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-medium backdrop-blur">{c}</span>
                ))}
              </div>

              <motion.button
                onClick={() => navigate("/ai-assistant")}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                className="group relative mt-3 inline-flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-white px-3 py-2 text-xs font-bold text-primary shadow-elegant"
              >
                <span className="relative z-10">Generate now</span>
                <Wand2 className="relative z-10 size-3.5 transition-transform group-hover:rotate-12" />
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-accent/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </motion.button>
            </div>
          </Card>

          {/* ============ QUICK SHORTCUTS — bento tiles ============ */}
          <Card title="Quick Shortcuts" action={<span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">4 tools</span>}>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { to: "/logo-maker",      label: "Logo Maker",    hint: "Brand marks",  icon: Wand2,     grad: "from-[hsl(235_75%_60%)] to-[hsl(260_75%_55%)]", glow: "bg-accent/40",     badge: "AI" },
                { to: "/post-designer",   label: "Post Designer", hint: "Social posts", icon: Sparkles,  grad: "from-[hsl(20_85%_60%)] to-[hsl(340_75%_60%)]",  glow: "bg-warning/40",    badge: "New" },
                { to: "/website-builder", label: "Website",       hint: "Landing page", icon: Rocket,    grad: "from-[hsl(158_60%_45%)] to-[hsl(195_75%_50%)]", glow: "bg-success/40",    badge: "Live" },
                { to: "/documents",       label: "Documents",     hint: "Files & PDFs", icon: FileText,  grad: "from-[hsl(230_55%_18%)] to-[hsl(235_75%_55%)]", glow: "bg-primary/40",    badge: "12" },
              ].map((s) => (
                <Link
                  key={s.label}
                  to={s.to}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-3 transition-all hover:-translate-y-1 hover:shadow-premium"
                >
                  <span className={`pointer-events-none absolute -right-6 -top-6 size-20 rounded-full blur-2xl ${s.glow} opacity-70 transition-opacity group-hover:opacity-100`} />
                  <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id={`dots-${s.label}`} width="10" height="10" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="1" fill="currentColor" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#dots-${s.label})`} />
                  </svg>
                  <div className="relative flex items-start justify-between">
                    <span className={`grid size-10 place-items-center rounded-xl bg-gradient-to-br ${s.grad} text-white shadow-elegant transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                      <s.icon className="size-5" />
                    </span>
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{s.badge}</span>
                  </div>
                  <div className="relative mt-3">
                    <div className="text-[13px] font-bold leading-tight">{s.label}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">{s.hint}</div>
                  </div>
                  <div className="relative mt-2 flex items-center gap-1 text-[10px] font-semibold text-accent">
                    Open <ChevronRight className="size-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </aside>
      </div>

      {/* ============ Bottom banner — colorful, premium, infographic CTA ============ */}
      <div className="relative mt-8 overflow-hidden rounded-[2rem] p-6 text-white shadow-premium sm:p-10"
        style={{
          backgroundImage:
            "linear-gradient(125deg, hsl(260 75% 35%) 0%, hsl(235 75% 42%) 28%, hsl(195 85% 48%) 58%, hsl(158 70% 50%) 85%, hsl(48 95% 60%) 100%)",
        }}
      >
        {/* Animated colorful orbs */}
        <span className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-[hsl(340_85%_65%)]/60 blur-3xl vh-float" />
        <span className="pointer-events-none absolute -bottom-24 right-1/4 size-80 rounded-full bg-[hsl(48_95%_60%)]/50 blur-3xl vh-float" style={{ animationDelay: "1.2s" }} />
        <span className="pointer-events-none absolute right-6 top-4 size-40 rounded-full bg-[hsl(195_85%_70%)]/50 blur-2xl vh-float" style={{ animationDelay: "0.6s" }} />
        <span className="pointer-events-none absolute left-1/3 top-1/2 size-28 rounded-full bg-[hsl(280_85%_70%)]/40 blur-2xl vh-float" style={{ animationDelay: "2s" }} />

        {/* Grid pattern overlay */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="vh-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M32 0H0V32" fill="none" stroke="white" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#vh-grid)" />
        </svg>

        {/* Decorative dotted arcs */}
        <svg className="pointer-events-none absolute -right-10 top-1/2 hidden -translate-y-1/2 opacity-40 md:block" width="300" height="300" viewBox="0 0 300 300">
          <circle cx="150" cy="150" r="140" fill="none" stroke="white" strokeWidth="1" strokeDasharray="2 6" />
          <circle cx="150" cy="150" r="105" fill="none" stroke="white" strokeWidth="1" strokeDasharray="2 6" />
          <circle cx="150" cy="150" r="70" fill="none" stroke="white" strokeWidth="1" strokeDasharray="2 6" />
          <circle cx="150" cy="150" r="35" fill="none" stroke="white" strokeWidth="1.5" />
        </svg>

        {/* Floating sparkles */}
        {[
          { top: "12%", left: "8%", d: 0 },
          { top: "75%", left: "12%", d: 1.2 },
          { top: "18%", left: "55%", d: 0.6 },
          { top: "82%", left: "62%", d: 1.8 },
        ].map((s, i) => (
          <span key={i} className="pointer-events-none absolute hidden vh-float md:block"
            style={{ top: s.top, left: s.left, animationDelay: `${s.d}s` }}>
            <span className="block size-2 rotate-45 bg-white shadow-[0_0_18px_rgba(255,255,255,0.9)]" />
          </span>
        ))}

        <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
              <span className="relative grid size-2 place-items-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-[hsl(48_95%_60%)]" />
                <span className="relative size-2 rounded-full bg-[hsl(48_95%_60%)]" />
              </span>
              VisaHOBe Operating OS
            </div>
            <h3 className="mt-4 font-display text-2xl font-bold leading-tight sm:text-3xl md:text-[2.6rem]">
              Build, manage & grow{" "}
              <span className="bg-gradient-to-r from-[hsl(48_95%_75%)] via-white to-[hsl(340_85%_85%)] bg-clip-text text-transparent">
                your client businesses
              </span>
              <span className="block text-white/90">— all in one beautiful place.</span>
            </h3>

            {/* Infographic mini stat strip — colorful tiles */}
            <div className="mt-5 grid grid-cols-3 gap-2.5 sm:max-w-lg">
              {[
                { v: "12+",  l: "Workspaces", tone: "from-[hsl(340_85%_65%)] to-[hsl(20_85%_60%)]",  icon: "▲" },
                { v: "98%",  l: "On-time",    tone: "from-[hsl(158_70%_50%)] to-[hsl(195_85%_55%)]", icon: "✓" },
                { v: "24/7", l: "AI Support", tone: "from-[hsl(48_95%_60%)] to-[hsl(20_85%_60%)]",   icon: "✦" },
              ].map((s) => (
                <div key={s.l} className="group relative overflow-hidden rounded-2xl border border-white/25 bg-white/10 p-3 text-center backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/15">
                  <span className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${s.tone}`} />
                  <div className="flex items-center justify-center gap-1.5">
                    <span className={`bg-gradient-to-br ${s.tone} bg-clip-text text-sm font-bold text-transparent`}>{s.icon}</span>
                    <span className="font-display text-xl font-bold leading-none">{s.v}</span>
                  </div>
                  <div className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/75">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col gap-2.5 sm:flex-row md:w-auto md:flex-col lg:flex-row">
            <Link
              to="/clients/new"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-primary shadow-premium transition hover:-translate-y-0.5 hover:shadow-glow"
            >
              <span className="relative z-10">+ New Workspace</span>
              <ChevronRight className="relative z-10 size-4 transition-transform group-hover:translate-x-1" />
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[hsl(48_95%_60%)]/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>
            <Link
              to="/brand-builder"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-white/35 bg-white/10 px-6 py-3.5 text-sm font-bold backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/20"
            >
              <Palette className="size-4" />
              Open Brand Builder
            </Link>
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

function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
        {action}
      </header>
      {children}
    </section>
  );
}

function Donut({ value }: { value: number }) {
  const r = 56;
  const c = 2 * Math.PI * r;
  const off = c - (c * value) / 100;
  return (
    <div className="relative mx-auto grid size-40 place-items-center">
      <svg viewBox="0 0 140 140" className="size-40 -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="14" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="url(#grad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          className="transition-[stroke-dashoffset] duration-1000"
        />
        <defs>
          <linearGradient id="grad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#003B73" />
            <stop offset="100%" stopColor="#177BBB" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-bold">{value}%</div>
        <div className="text-xs text-muted-foreground">Overall</div>
      </div>
    </div>
  );
}
