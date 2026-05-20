import { PageContainer } from "@/components/layout/Page";
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
import { Link } from "react-router-dom";

type BBState = "queued" | "active" | "review" | "sent" | "done";
type BBStage = {
  key: string;
  label: string;
  icon: string;
  pct: number;
  due: string; // ISO date
  state: BBState;
};

const BB_DEFAULTS: Omit<BBStage, "due">[] = [
  { key: "identity", label: "Identity & Strategy", icon: "✦", pct: 100, state: "done" },
  { key: "visual", label: "Visual Identity", icon: "◐", pct: 100, state: "done" },
  { key: "stationery", label: "Stationery Kit", icon: "✉", pct: 100, state: "done" },
  { key: "social", label: "Social Media", icon: "❍", pct: 65, state: "active" },
  { key: "launch", label: "Launch", icon: "▲", pct: 0, state: "queued" },
];

function makeDefaultStages(): BBStage[] {
  const base = Date.now();
  return BB_DEFAULTS.map((s, i) => ({
    ...s,
    // Stage 1 due 5d ago (overdue demo for active), then weekly
    due: new Date(base + (i - 3) * 7 * 86400000).toISOString().slice(0, 10),
  }));
}

function loadStages(wsId: string): BBStage[] {
  try {
    const raw = localStorage.getItem(`vh-bb-${wsId}`);
    if (!raw) return makeDefaultStages();
    const parsed = JSON.parse(raw) as BBStage[];
    if (!Array.isArray(parsed) || parsed.length === 0) return makeDefaultStages();
    return parsed;
  } catch {
    return makeDefaultStages();
  }
}

function isOverdue(s: BBStage) {
  if (s.pct >= 100 || s.state === "done") return false;
  const today = new Date().toISOString().slice(0, 10);
  return s.due < today;
}

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

  const [stages, setStages] = useState<BBStage[]>(() => makeDefaultStages());
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    if (workspace?.id) setStages(loadStages(workspace.id));
  }, [workspace?.id]);

  useEffect(() => {
    if (workspace?.id) {
      try { localStorage.setItem(`vh-bb-${workspace.id}`, JSON.stringify(stages)); } catch {}
    }
  }, [stages, workspace?.id]);

  const updateStage = (i: number, patch: Partial<BBStage>) =>
    setStages((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const markDone = (i: number) => {
    updateStage(i, { pct: 100, state: "done" });
    toast.success(`${stages[i].label} marked as done`);
  };
  const requestReview = (i: number) => {
    updateStage(i, { state: "review", pct: Math.max(stages[i].pct, 80) });
    toast.message(`Review requested · ${stages[i].label}`, { description: "Internal QA team notified." });
  };
  const sendToClient = (i: number) => {
    updateStage(i, { state: "sent", pct: Math.max(stages[i].pct, 90) });
    toast.success(`Sent to client · ${stages[i].label}`, { description: "Awaiting client approval." });
  };
  const setDue = (i: number, due: string) => {
    updateStage(i, { due });
    toast.success(`Due date updated · ${stages[i].label}`);
  };
  const resetStage = (i: number) => {
    updateStage(i, { pct: 0, state: "queued" });
    toast.message(`${stages[i].label} reset to queued`);
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
          <Link
            to="/clients/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-blue px-4 py-2.5 text-sm font-semibold text-white shadow-elegant transition hover:shadow-glow"
          >
            <Plus className="size-4" /> Add Client Business
          </Link>
          <Link
            to="/reports"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted"
          >
            View Reports <ArrowUpRight className="size-4" />
          </Link>
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
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to={`/workspace/${workspace.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
                >
                  Open Workspace <ChevronRight className="size-3.5" />
                </Link>
                <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
                  <MessageSquare className="size-3.5" /> Chat with client
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
                  <Video className="size-3.5" /> Schedule meeting
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
                  <FileText className="size-3.5" /> Generate invoice
                </button>
              </div>
            </div>
          </div>

          {/* Brand Builder Progress — interactive journey stepper */}
          <Card title="Brand Builder Progress" action={<Link to="/brand-builder" className="text-xs font-semibold text-accent inline-flex items-center gap-1">Open builder <ChevronRight className="size-3" /></Link>}>
            {(() => {
              const completed = stages.filter((s) => s.pct === 100 || s.state === "done").length;
              const overall = Math.round(stages.reduce((a, s) => a + s.pct, 0) / stages.length);
              const overdueCount = stages.filter(isOverdue).length;
              const ringR = 18, ringC = 2 * Math.PI * ringR;

              return (
                <>
                  {/* Hero summary strip */}
                  <div className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-hero p-4 text-white">
                    <span className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-warning/40 blur-2xl vh-float" />
                    <span className="pointer-events-none absolute -bottom-12 -left-8 size-28 rounded-full bg-accent/40 blur-2xl vh-float" style={{ animationDelay: "1.2s" }} />
                    <div className="relative flex items-center justify-between gap-3">
                      <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur">
                          <span className="size-1.5 animate-pulse rounded-full bg-success" />
                          Active Build · Saved
                        </div>
                        <div className="mt-1.5 font-display text-2xl font-extrabold leading-none">{overall}%</div>
                        <div className="text-[10px] text-white/70">{completed} of {stages.length} stages complete</div>
                        {overdueCount > 0 && (
                          <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-destructive/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                            <AlertTriangle className="size-3" /> {overdueCount} overdue
                          </div>
                        )}
                      </div>
                      <div className="relative grid size-16 place-items-center">
                        <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
                          <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.2)" strokeWidth="5" fill="none" />
                          <circle cx="32" cy="32" r="26" stroke="white" strokeWidth="5" strokeLinecap="round" fill="none"
                            strokeDasharray={`${(overall / 100) * (2 * Math.PI * 26)} ${2 * Math.PI * 26}`} />
                        </svg>
                        <Sparkles className="absolute size-5 text-warning animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Horizontal connected stepper — clickable */}
                  <div className="relative mb-4 overflow-x-auto">
                    <div className="relative flex min-w-[480px] items-start justify-between gap-1 px-2 pb-1">
                      <span className="pointer-events-none absolute left-6 right-6 top-[22px] h-0.5 bg-muted" />
                      <span
                        className="pointer-events-none absolute left-6 top-[22px] h-0.5 gradient-blue vh-shimmer transition-all"
                        style={{ width: `calc((100% - 48px) * ${overall / 100})` }}
                      />
                      {stages.map((s, i) => {
                        const done = s.pct === 100 || s.state === "done";
                        const current = !done && s.pct > 0;
                        const overdue = isOverdue(s);
                        return (
                          <button
                            key={s.key}
                            onClick={() => setOpenIdx(i)}
                            className="relative z-10 flex w-1/5 flex-col items-center focus:outline-none"
                            aria-label={`Open ${s.label}`}
                          >
                            <div className="relative grid size-11 place-items-center transition-transform hover:scale-110">
                              <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
                                <circle cx="22" cy="22" r={ringR} fill="hsl(var(--background))" stroke={overdue ? "hsl(var(--destructive))" : "hsl(var(--muted))"} strokeWidth="3" />
                                <circle cx="22" cy="22" r={ringR} fill="none"
                                  stroke={overdue ? "hsl(var(--destructive))" : done ? "hsl(var(--success))" : current ? "hsl(var(--accent))" : "hsl(var(--muted))"}
                                  strokeWidth="3" strokeLinecap="round"
                                  strokeDasharray={`${(s.pct / 100) * ringC} ${ringC}`} />
                              </svg>
                              <span className={`absolute text-[12px] font-extrabold ${
                                overdue ? "text-destructive vh-pop" : done ? "text-success" : current ? "text-accent vh-pop" : "text-muted-foreground"
                              }`}>
                                {done ? "✓" : i + 1}
                              </span>
                              {overdue && (
                                <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-destructive text-white">
                                  <AlertTriangle className="size-2.5" />
                                </span>
                              )}
                            </div>
                            <div className={`mt-1.5 text-center text-[9px] font-bold uppercase tracking-wider ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
                              {new Date(s.due).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Detail rows — clickable + per-stage actions */}
                  <ul className="space-y-2">
                    {stages.map((s, i) => {
                      const done = s.pct === 100 || s.state === "done";
                      const current = !done && s.pct > 0;
                      const overdue = isOverdue(s);
                      const tone = overdue ? "destructive" : done ? "success" : current ? "accent" : "muted-foreground";
                      const statusLabel =
                        s.state === "sent" ? "Sent" :
                        s.state === "review" ? "In Review" :
                        done ? "Done" : current ? "Active" : "Queued";
                      const statusClass =
                        overdue ? "bg-destructive/10 text-destructive" :
                        s.state === "sent" ? "bg-primary/10 text-primary" :
                        s.state === "review" ? "bg-warning/10 text-warning" :
                        done ? "bg-success/10 text-success" :
                        current ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground";
                      return (
                        <li key={s.key}
                          className={`group relative overflow-hidden rounded-xl border bg-card p-2.5 transition-all hover:-translate-y-0.5 hover:shadow-elegant ${
                            overdue ? "border-destructive/40 shadow-elegant" :
                            current ? "border-accent/40 shadow-elegant" :
                            done ? "border-success/20" : "border-border"
                          }`}
                        >
                          <span className={`absolute left-0 top-0 h-full w-1 bg-${tone}`} />
                          <button
                            onClick={() => setOpenIdx(i)}
                            className="flex w-full items-center gap-3 text-left"
                          >
                            <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-base ${
                              overdue ? "bg-destructive/15 text-destructive vh-pop" :
                              done ? "bg-success/15 text-success" :
                              current ? "bg-accent/15 text-accent vh-float" : "bg-muted text-muted-foreground/60"
                            }`}>
                              {s.icon}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="truncate text-[13px] font-bold">{s.label}</span>
                                <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusClass}`}>
                                  {overdue ? "Overdue" : statusLabel}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center gap-2">
                                <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted/70">
                                  <div className={`h-full rounded-full ${current ? "vh-shimmer" : ""}`}
                                    style={{ width: `${s.pct}%`, background: overdue ? "hsl(var(--destructive))" : done ? "hsl(var(--success))" : current ? "hsl(var(--accent))" : "transparent" }} />
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground">{s.pct}%</span>
                              </div>
                              <div className={`mt-1 flex items-center gap-1 text-[10px] ${overdue ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                                <CalendarClock className="size-3" />
                                Due {new Date(s.due).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                              </div>
                            </div>
                          </button>

                          {/* Per-stage quick actions */}
                          <div className="mt-2 flex flex-wrap gap-1.5 pl-12">
                            <button
                              onClick={() => markDone(i)}
                              disabled={done}
                              className="inline-flex items-center gap-1 rounded-md border border-success/30 bg-success/5 px-2 py-1 text-[10px] font-bold text-success hover:bg-success/10 disabled:opacity-40"
                            >
                              <Check className="size-3" /> Mark done
                            </button>
                            <button
                              onClick={() => requestReview(i)}
                              className="inline-flex items-center gap-1 rounded-md border border-warning/30 bg-warning/5 px-2 py-1 text-[10px] font-bold text-warning hover:bg-warning/10"
                            >
                              <Eye className="size-3" /> Request review
                            </button>
                            <button
                              onClick={() => sendToClient(i)}
                              className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/5 px-2 py-1 text-[10px] font-bold text-primary hover:bg-primary/10"
                            >
                              <Send className="size-3" /> Send to client
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </>
              );
            })()}
          </Card>

          {/* Brand Builder stage side panel */}
          <Sheet open={openIdx !== null} onOpenChange={(o) => !o && setOpenIdx(null)}>
            <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
              {openIdx !== null && stages[openIdx] && (() => {
                const s = stages[openIdx];
                const done = s.pct === 100 || s.state === "done";
                const overdue = isOverdue(s);
                return (
                  <>
                    <SheetHeader>
                      <div className={`mb-2 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        overdue ? "bg-destructive/10 text-destructive" :
                        done ? "bg-success/10 text-success" :
                        s.state === "sent" ? "bg-primary/10 text-primary" :
                        s.state === "review" ? "bg-warning/10 text-warning" :
                        s.pct > 0 ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                      }`}>
                        {overdue && <AlertTriangle className="size-3" />}
                        Stage {openIdx + 1} of {stages.length}
                      </div>
                      <SheetTitle className="flex items-center gap-2 text-xl">
                        <span className="text-2xl">{s.icon}</span> {s.label}
                      </SheetTitle>
                      <SheetDescription>
                        Manage progress, due date, and approvals for this Brand Builder stage. Changes auto-save for this workspace.
                      </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 space-y-5">
                      {/* Progress with slider */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Progress</label>
                          <span className="text-sm font-extrabold">{s.pct}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={s.pct}
                          onChange={(e) => updateStage(openIdx, { pct: Number(e.target.value), state: Number(e.target.value) === 100 ? "done" : Number(e.target.value) > 0 ? (s.state === "queued" ? "active" : s.state) : "queued" })}
                          className="w-full accent-accent"
                        />
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full vh-shimmer transition-all"
                            style={{ width: `${s.pct}%`, background: overdue ? "hsl(var(--destructive))" : done ? "hsl(var(--success))" : "hsl(var(--accent))" }} />
                        </div>
                      </div>

                      {/* Due date */}
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Due date</label>
                        <div className="flex items-center gap-2">
                          <CalendarClock className={`size-4 ${overdue ? "text-destructive" : "text-muted-foreground"}`} />
                          <input
                            type="date"
                            value={s.due}
                            onChange={(e) => setDue(openIdx, e.target.value)}
                            className={`flex-1 rounded-lg border bg-card px-3 py-2 text-sm font-semibold ${overdue ? "border-destructive/50 text-destructive" : "border-border"}`}
                          />
                        </div>
                        {overdue && (
                          <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-destructive">
                            <AlertTriangle className="size-3" /> This stage is past its due date.
                          </p>
                        )}
                      </div>

                      {/* Status */}
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(["queued", "active", "review", "sent", "done"] as BBState[]).map((st) => (
                            <button
                              key={st}
                              onClick={() => updateStage(openIdx, { state: st, pct: st === "done" ? 100 : s.pct })}
                              className={`rounded-lg border px-2 py-1.5 text-[11px] font-bold capitalize transition ${
                                s.state === st
                                  ? "border-accent bg-accent/10 text-accent"
                                  : "border-border bg-card text-muted-foreground hover:bg-muted"
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</label>
                        <button
                          onClick={() => markDone(openIdx)}
                          disabled={done}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-success px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-40"
                        >
                          <Check className="size-4" /> Mark as done
                        </button>
                        <button
                          onClick={() => requestReview(openIdx)}
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-4 py-2.5 text-sm font-bold text-warning hover:bg-warning/20"
                        >
                          <Eye className="size-4" /> Request review
                        </button>
                        <button
                          onClick={() => sendToClient(openIdx)}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-blue px-4 py-2.5 text-sm font-bold text-white hover:opacity-90"
                        >
                          <Send className="size-4" /> Send to client approval
                        </button>
                        <button
                          onClick={() => resetStage(openIdx)}
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                        >
                          <RotateCcw className="size-3.5" /> Reset stage
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </SheetContent>
          </Sheet>




          {/* Deliverables overview — each card a distinct infographic */}
          <Card title="Deliverables Overview" action={<button className="text-xs font-semibold text-accent">Filter →</button>}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {deliverables.map((d, i) => {
                const tones = [
                  { ring: "hsl(var(--accent))", glow: "bg-accent/30", chip: "bg-accent/10 text-accent", text: "text-accent" },
                  { ring: "hsl(var(--primary))", glow: "bg-primary/30", chip: "bg-primary/10 text-primary", text: "text-primary" },
                  { ring: "hsl(var(--success))", glow: "bg-success/30", chip: "bg-success/10 text-success", text: "text-success" },
                  { ring: "hsl(var(--warning))", glow: "bg-warning/30", chip: "bg-warning/10 text-warning", text: "text-warning" },
                  { ring: "hsl(var(--destructive))", glow: "bg-destructive/30", chip: "bg-destructive/10 text-destructive", text: "text-destructive" },
                ];
                const t = tones[i % tones.length];
                const initials = d.title.split(" ").slice(0, 2).map((w) => w[0]).join("");

                // Distinct infographic per card
                const renderViz = () => {
                  switch (i % 5) {
                    case 0: {
                      // Circular progress ring
                      const R = 22, C = 2 * Math.PI * R;
                      return (
                        <div className="relative grid size-14 place-items-center">
                          <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
                            <circle cx="28" cy="28" r={R} stroke="hsl(var(--muted))" strokeWidth="5" fill="none" />
                            <circle cx="28" cy="28" r={R} stroke={t.ring} strokeWidth="5" strokeLinecap="round" fill="none"
                              strokeDasharray={`${(d.progress / 100) * C} ${C}`} />
                          </svg>
                          <div className="absolute text-[11px] font-extrabold">{d.progress}%</div>
                        </div>
                      );
                    }
                    case 1:
                      // Vertical bar chart
                      return (
                        <div className="flex h-14 w-14 items-end justify-between gap-0.5">
                          {[40, 65, 55, 80, d.progress].map((h, k) => (
                            <span key={k} className="w-2 rounded-t vh-shimmer"
                              style={{ height: `${h}%`, background: k === 4 ? t.ring : "hsl(var(--muted))", animationDelay: `${k * 0.1}s` }} />
                          ))}
                        </div>
                      );
                    case 2: {
                      // Half donut gauge
                      const R = 20, C = Math.PI * R;
                      return (
                        <div className="relative grid h-14 w-14 place-items-center">
                          <svg width="56" height="34" viewBox="0 0 56 34">
                            <path d="M6 28 A22 22 0 0 1 50 28" fill="none" stroke="hsl(var(--muted))" strokeWidth="5" strokeLinecap="round" />
                            <path d="M6 28 A22 22 0 0 1 50 28" fill="none" stroke={t.ring} strokeWidth="5" strokeLinecap="round"
                              strokeDasharray={`${(d.progress / 100) * C} ${C}`} />
                          </svg>
                          <div className={`absolute bottom-0 text-[10px] font-extrabold ${t.text}`}>{d.progress}%</div>
                        </div>
                      );
                    }
                    case 3:
                      // Dotted progress pellets
                      return (
                        <div className="grid h-14 w-14 grid-cols-5 grid-rows-2 gap-1">
                          {Array.from({ length: 10 }).map((_, k) => {
                            const on = k < Math.round(d.progress / 10);
                            return (
                              <span key={k} className="rounded-full"
                                style={{
                                  background: on ? t.ring : "hsl(var(--muted))",
                                  animation: on ? `vh-pop 0.4s ${k * 0.05}s both` : undefined,
                                }} />
                            );
                          })}
                        </div>
                      );
                    default:
                      // Area sparkline
                      return (
                        <svg width="56" height="56" viewBox="0 0 56 56">
                          <defs>
                            <linearGradient id={`del-${i}`} x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor={t.ring} stopOpacity="0.5" />
                              <stop offset="100%" stopColor={t.ring} stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path d="M0 40 L10 32 L20 36 L28 22 L38 28 L48 14 L56 18 L56 56 L0 56 Z" fill={`url(#del-${i})`} />
                          <path d="M0 40 L10 32 L20 36 L28 22 L38 28 L48 14 L56 18" fill="none" stroke={t.ring} strokeWidth="2" strokeLinecap="round" />
                          <circle cx="56" cy="18" r="3" fill={t.ring}>
                            <animate attributeName="r" values="3;5;3" dur="1.4s" repeatCount="indefinite" />
                          </circle>
                        </svg>
                      );
                  }
                };

                return (
                  <div
                    key={d.key}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-card p-3 transition-all hover:-translate-y-1 hover:shadow-elegant sm:p-4"
                  >
                    {/* corner glow */}
                    <span className={`pointer-events-none absolute -right-8 -top-8 size-20 rounded-full blur-2xl ${t.glow} vh-float`} />

                    <div className="relative flex items-start gap-3">
                      <div className="shrink-0">{renderViz()}</div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold leading-tight line-clamp-2">{d.title}</div>
                        <div className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${t.chip}`}>
                          {d.status}
                        </div>
                      </div>
                    </div>

                    {/* Animated bar */}
                    <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-muted/70">
                      <div className="h-full rounded-full vh-shimmer" style={{ width: `${d.progress}%`, background: t.ring }} />
                    </div>

                    <div className="relative mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="grid size-5 place-items-center rounded-full text-[9px] font-bold text-white" style={{ background: t.ring }}>
                          {initials}
                        </span>
                        Sara K.
                      </span>
                      <span className={`font-bold ${t.text}`}>
                        {d.progress > 70 ? "On track" : d.progress > 30 ? "In flight" : "Kickoff"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>


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
        <aside className="space-y-6">
          <Card
            title="Client Communication"
            action={
              <Link to="/chat" className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
                Open chat <ChevronRight className="size-3" />
              </Link>
            }
          >
            {/* Live header strip */}
            <div className="mb-3 flex items-center justify-between rounded-xl border border-border bg-gradient-card p-2.5">
              <div className="flex items-center gap-2 text-[11px] font-semibold">
                <span className="relative grid size-2 place-items-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-success/60" />
                  <span className="relative size-2 rounded-full bg-success" />
                </span>
                3 active chats
              </div>
              <div className="flex -space-x-2">
                {["R", "A", "D"].map((l, i) => (
                  <span
                    key={l}
                    className={`grid size-6 place-items-center rounded-full text-[10px] font-bold text-white ring-2 ring-card ${
                      ["bg-accent", "bg-warning", "bg-success"][i]
                    }`}
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>

            <ul className="space-y-2">
              {[
                { name: "Rohit (SpiceBite)", msg: "Loving the new logo direction!", t: "2m", unread: 2, tone: "bg-accent", emoji: "💬" },
                { name: "Aaliyah (GlowBeauty)", msg: "Can we tweak the banner copy?", t: "1h", unread: 1, tone: "bg-warning", emoji: "✏️" },
                { name: "Daniel (Elite Travel)", msg: "Approved the social kit ✅", t: "3h", unread: 0, tone: "bg-success", emoji: "✅" },
              ].map((m, i) => (
                <li
                  key={i}
                  className="group relative flex items-start gap-3 overflow-hidden rounded-2xl border border-border bg-card p-2.5 transition-all hover:-translate-y-0.5 hover:shadow-elegant"
                >
                  {/* Left accent rail */}
                  <span className={`absolute left-0 top-0 h-full w-1 ${m.tone}`} />

                  {/* Avatar with status dot */}
                  <span className="relative shrink-0">
                    <span className={`grid size-10 place-items-center rounded-full text-sm font-bold text-white ${m.tone}`}>
                      {m.name[0]}
                    </span>
                    <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card bg-success" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-bold">{m.name}</span>
                      <span className="shrink-0 text-[10px] font-medium text-muted-foreground">{m.t}</span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <p className="truncate text-[11px] text-muted-foreground">
                        <span className="mr-1">{m.emoji}</span>
                        {m.msg}
                      </p>
                      {m.unread > 0 && (
                        <span className="grid size-4 shrink-0 animate-pulse place-items-center rounded-full bg-destructive text-[9px] font-bold text-white">
                          {m.unread}
                        </span>
                      )}
                    </div>
                    {/* Typing wave for first item */}
                    {i === 0 && (
                      <div className="mt-1 flex items-center gap-0.5">
                        {[0, 1, 2].map((d) => (
                          <span
                            key={d}
                            className="size-1 animate-bounce rounded-full bg-accent"
                            style={{ animationDelay: `${d * 0.15}s` }}
                          />
                        ))}
                        <span className="ml-1 text-[9px] font-medium text-accent">typing…</span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Quick reply input */}
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-1.5">
              <input
                placeholder="Quick reply…"
                className="flex-1 bg-transparent px-2 text-[12px] outline-none placeholder:text-muted-foreground"
              />
              <button className="grid size-7 place-items-center rounded-lg bg-gradient-blue text-white transition hover:scale-110">
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </Card>

          <Card title="Upcoming Meetings" action={<Link to="/meetings" className="text-xs font-semibold text-accent">Calendar →</Link>}>
            <ul className="space-y-3">
              {meetings.map((m, i) => (
                <li key={i} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <div className="grid size-11 place-items-center rounded-xl bg-gradient-blue text-white">
                    <Calendar className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{m.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{m.business}</div>
                    <div className="text-[11px] text-accent">{m.time}</div>
                  </div>
                  <button className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-muted">
                    Join
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="AI Assistant">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-hero p-4 text-white">
              {/* Animated orbs */}
              <span className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-accent/40 blur-2xl vh-float" />
              <span className="pointer-events-none absolute -bottom-12 -left-8 size-28 rounded-full bg-warning/30 blur-2xl vh-float" style={{ animationDelay: "1s" }} />

              {/* Soundwave SVG */}
              <svg className="pointer-events-none absolute bottom-2 right-3 opacity-40" width="80" height="32" viewBox="0 0 80 32">
                {Array.from({ length: 12 }).map((_, i) => (
                  <rect
                    key={i}
                    x={i * 7}
                    y={16 - (4 + (i % 4) * 4)}
                    width="3"
                    height={8 + (i % 4) * 8}
                    rx="1.5"
                    fill="white"
                    style={{ animation: `vh-rise 1.${i}s ease-in-out ${i * 0.08}s infinite alternate` }}
                  />
                ))}
              </svg>

              <div className="relative flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
                  <Sparkles className="size-3 animate-pulse" /> VisaHOBe AI
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-success">
                  <span className="size-1.5 animate-pulse rounded-full bg-success" /> Online
                </span>
              </div>

              {/* Avatar + bubble */}
              <div className="relative mt-3 flex items-start gap-2.5">
                <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur">
                  <span className="absolute inset-0 animate-ping rounded-full bg-white/20" />
                  <Wand2 className="relative size-4" />
                </span>
                <div className="relative rounded-2xl rounded-tl-sm border border-white/15 bg-white/10 p-2.5 backdrop-blur">
                  <p className="text-[13px] leading-relaxed">
                    Want me to draft a launch caption for{" "}
                    <span className="font-semibold underline decoration-warning decoration-2 underline-offset-2">
                      {workspace.name}
                    </span>{" "}
                    and 3 ad variations?
                  </p>
                </div>
              </div>

              {/* Suggestion chips */}
              <div className="relative mt-3 flex flex-wrap gap-1.5">
                {["Captions", "Ad Copy", "Hashtags"].map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-medium backdrop-blur"
                  >
                    {c}
                  </span>
                ))}
              </div>

              <button className="group relative mt-3 inline-flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-white px-3 py-2 text-xs font-bold text-primary shadow-elegant transition hover:-translate-y-0.5">
                <span className="relative z-10">Generate now</span>
                <Wand2 className="relative z-10 size-3.5 transition-transform group-hover:rotate-12" />
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-accent/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>
            </div>
          </Card>

          <Card title="Quick Shortcuts" action={<span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">4 tools</span>}>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  to: "/logo-maker",
                  label: "Logo Maker",
                  hint: "Brand marks",
                  icon: Wand2,
                  grad: "from-accent to-primary",
                  glow: "bg-accent/40",
                  badge: "AI",
                },
                {
                  to: "/post-designer",
                  label: "Post Designer",
                  hint: "Social posts",
                  icon: Sparkles,
                  grad: "from-warning to-destructive",
                  glow: "bg-warning/40",
                  badge: "New",
                },
                {
                  to: "/website-builder",
                  label: "Website",
                  hint: "Landing page",
                  icon: Rocket,
                  grad: "from-success to-accent",
                  glow: "bg-success/40",
                  badge: "Live",
                },
                {
                  to: "/documents",
                  label: "Documents",
                  hint: "Files & PDFs",
                  icon: FileText,
                  grad: "from-primary to-accent",
                  glow: "bg-primary/40",
                  badge: "12",
                },
              ].map((s) => (
                <Link
                  key={s.label}
                  to={s.to}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-3 transition-all hover:-translate-y-1 hover:shadow-elegant"
                >
                  {/* corner glow */}
                  <span className={`pointer-events-none absolute -right-6 -top-6 size-16 rounded-full blur-2xl ${s.glow} opacity-60 transition-opacity group-hover:opacity-100`} />

                  {/* dotted pattern */}
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
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                      {s.badge}
                    </span>
                  </div>

                  <div className="relative mt-3">
                    <div className="text-[13px] font-bold leading-tight">{s.label}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">{s.hint}</div>
                  </div>

                  <div className="relative mt-2 flex items-center gap-1 text-[10px] font-semibold text-accent">
                    Open
                    <ChevronRight className="size-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </aside>
      </div>

      {/* Bottom banner — graphic-rich CTA */}
      <div className="relative mt-8 overflow-hidden rounded-3xl bg-gradient-hero p-6 text-white shadow-premium sm:p-10">
        {/* Animated orbs */}
        <span className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-white/20 blur-3xl vh-float" />
        <span className="pointer-events-none absolute -bottom-20 right-1/4 size-72 rounded-full bg-accent/40 blur-3xl vh-float" style={{ animationDelay: "1.2s" }} />
        <span className="pointer-events-none absolute right-10 top-6 size-32 rounded-full bg-warning/30 blur-2xl vh-float" style={{ animationDelay: "0.6s" }} />

        {/* Grid pattern overlay */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="vh-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M32 0H0V32" fill="none" stroke="white" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#vh-grid)" />
        </svg>

        {/* Decorative dotted arcs (desktop only) */}
        <svg className="pointer-events-none absolute -right-10 top-1/2 hidden -translate-y-1/2 opacity-30 md:block" width="260" height="260" viewBox="0 0 260 260">
          <circle cx="130" cy="130" r="120" fill="none" stroke="white" strokeWidth="1" strokeDasharray="2 6" />
          <circle cx="130" cy="130" r="90" fill="none" stroke="white" strokeWidth="1" strokeDasharray="2 6" />
          <circle cx="130" cy="130" r="60" fill="none" stroke="white" strokeWidth="1" strokeDasharray="2 6" />
        </svg>

        <div className="relative flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur">
              <span className="size-1.5 animate-pulse rounded-full bg-success" />
              VisaHOBe Operating OS
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
              Build, manage & grow your client businesses
              <span className="block bg-gradient-to-r from-white via-warning to-white bg-clip-text text-transparent">
                — all in one place.
              </span>
            </h3>

            {/* Mini stat strip */}
            <div className="mt-4 grid grid-cols-3 gap-2 sm:max-w-md">
              {[
                { v: "12+", l: "Workspaces" },
                { v: "98%", l: "On-time" },
                { v: "24/7", l: "AI Support" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-white/20 bg-white/10 p-2 text-center backdrop-blur">
                  <div className="font-display text-lg font-bold leading-none">{s.v}</div>
                  <div className="mt-1 text-[9px] uppercase tracking-wider text-white/70">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto md:flex-col lg:flex-row">
            <Link
              to="/clients/new"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary shadow-elegant transition hover:-translate-y-0.5 hover:shadow-glow"
            >
              <span className="relative z-10">+ New Workspace</span>
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-accent/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>
            <Link
              to="/brand-builder"
              className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
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
