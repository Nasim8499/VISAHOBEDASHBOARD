import { PageContainer } from "@/components/layout/Page";
import { useWorkspace } from "@/context/WorkspaceContext";
import { activity, deliverables, insights, meetings } from "@/data/mock";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
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
} from "lucide-react";
import { Link } from "react-router-dom";

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

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-elegant"
          >
            {/* corner glow */}
            <div
              aria-hidden
              className={`pointer-events-none absolute -right-8 -top-8 size-24 rounded-full ${k.tone} opacity-10 blur-2xl transition group-hover:opacity-20`}
            />
            <div className="relative flex items-start justify-between">
              <span className={`grid size-9 place-items-center rounded-xl ${k.tone} text-white shadow-sm`}>
                <k.icon className="size-4" />
              </span>
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                {k.delta}
              </span>
            </div>
            <div className="relative mt-3 text-2xl font-bold tracking-tight">{k.value}</div>
            <div className="relative text-xs text-muted-foreground">{k.label}</div>
            <div className="relative mt-3 text-primary">
              <Sparkline data={k.trend} bars={k.bars} />
            </div>
            <div className="relative mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
              {k.sub}
            </div>
          </div>
        ))}
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

          {/* Brand Builder Progress — responsive visual grid */}
          <Card title="Brand Builder Progress" action={<Link to="/brand-builder" className="text-xs font-semibold text-accent">Open builder →</Link>}>
            {(() => {
              const steps = [
                { label: "Identity & Strategy", icon: "✦" },
                { label: "Visual Identity", icon: "◐" },
                { label: "Stationery Kit", icon: "✉" },
                { label: "Social Media", icon: "❍" },
                { label: "Launch", icon: "▲" },
              ];
              const completed = 3;
              const overall = Math.round((completed / steps.length) * 100);
              return (
                <>
                  {/* Overall progress bar */}
                  <div className="mb-4 rounded-2xl border border-border bg-gradient-card p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold">Overall completion</span>
                      <span className="font-bold text-primary">{overall}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full gradient-blue vh-shimmer"
                        style={{ width: `${overall}%` }}
                      />
                    </div>
                  </div>

                  {/* Step tiles — 2 per row on mobile, scales up on larger screens */}
                  <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {steps.map((s, i) => {
                      const done = i < completed;
                      const current = i === completed;
                      return (
                        <li
                          key={s.label}
                          className={`group relative overflow-hidden rounded-2xl border p-3 transition-all hover:-translate-y-1 hover:shadow-elegant ${
                            done
                              ? "border-success/30 bg-success/5"
                              : current
                              ? "border-accent/40 bg-gradient-card shadow-elegant"
                              : "border-border bg-card"
                          }`}
                        >
                          {/* Decorative corner glow */}
                          <span
                            className={`pointer-events-none absolute -right-6 -top-6 size-16 rounded-full blur-2xl ${
                              done ? "bg-success/30" : current ? "bg-accent/40 vh-float" : "bg-muted"
                            }`}
                          />
                          <div className="relative flex items-start justify-between">
                            <span
                              className={`grid size-9 place-items-center rounded-xl text-sm font-bold ring-2 ring-background ${
                                done
                                  ? "bg-success text-white"
                                  : current
                                  ? "gradient-red text-white vh-pop"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {done ? "✓" : i + 1}
                            </span>
                            <span
                              className={`text-lg ${
                                done ? "text-success" : current ? "text-accent" : "text-muted-foreground/60"
                              }`}
                            >
                              {s.icon}
                            </span>
                          </div>
                          <div className="relative mt-3">
                            <div className="text-[13px] font-semibold leading-tight">{s.label}</div>
                            <div className="mt-1 text-[10px] leading-snug text-muted-foreground line-clamp-2">
                              {done ? "Completed & approved" : current ? "2 items waiting" : "Up next"}
                            </div>
                          </div>
                          <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-muted/70">
                            <div
                              className={`h-full rounded-full ${
                                done ? "bg-success w-full" : current ? "gradient-blue w-2/3 vh-shimmer" : "w-0"
                              }`}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </>
              );
            })()}
          </Card>


          {/* Deliverables overview — eye-catching ring + gradient tiles */}
          <Card title="Deliverables Overview" action={<button className="text-xs font-semibold text-accent">Filter →</button>}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {deliverables.map((d, i) => {
                const tones = [
                  { ring: "hsl(var(--accent))", glow: "bg-accent/30", chip: "bg-accent/10 text-accent" },
                  { ring: "hsl(var(--primary))", glow: "bg-primary/30", chip: "bg-primary/10 text-primary" },
                  { ring: "hsl(var(--success))", glow: "bg-success/30", chip: "bg-success/10 text-success" },
                  { ring: "hsl(var(--warning))", glow: "bg-warning/30", chip: "bg-warning/10 text-warning" },
                  { ring: "hsl(var(--destructive))", glow: "bg-destructive/30", chip: "bg-destructive/10 text-destructive" },
                ];
                const t = tones[i % tones.length];
                const r = 22;
                const c = 2 * Math.PI * r;
                const dash = (d.progress / 100) * c;
                const initials = d.title
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("");
                return (
                  <div
                    key={d.key}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-card p-3 transition-all hover:-translate-y-1 hover:shadow-elegant sm:p-4"
                  >
                    {/* corner glow */}
                    <span
                      className={`pointer-events-none absolute -right-8 -top-8 size-20 rounded-full blur-2xl ${t.glow} vh-float`}
                    />

                    <div className="relative flex items-start gap-3">
                      {/* Progress ring */}
                      <div className="relative shrink-0">
                        <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
                          <circle cx="28" cy="28" r={r} stroke="hsl(var(--muted))" strokeWidth="5" fill="none" />
                          <circle
                            cx="28"
                            cy="28"
                            r={r}
                            stroke={t.ring}
                            strokeWidth="5"
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray={`${dash} ${c}`}
                            style={{ transition: "stroke-dasharray 0.8s ease" }}
                          />
                        </svg>
                        <div className="absolute inset-0 grid place-items-center text-[11px] font-bold">
                          {d.progress}%
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold leading-tight line-clamp-2">{d.title}</div>
                        <div className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${t.chip}`}>
                          {d.status}
                        </div>
                      </div>
                    </div>

                    {/* Animated bar */}
                    <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-muted/70">
                      <div
                        className="h-full rounded-full vh-shimmer"
                        style={{ width: `${d.progress}%`, background: t.ring }}
                      />
                    </div>

                    <div className="relative mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="grid size-5 place-items-center rounded-full text-[9px] font-bold text-white"
                          style={{ background: t.ring }}
                        >
                          {initials}
                        </span>
                        Sara K.
                      </span>
                      <span className="font-semibold">{d.progress > 70 ? "On track" : d.progress > 30 ? "In flight" : "Kickoff"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>


          {/* Activity + Donut */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <Card title="Project Activity">
                <ul className="space-y-4">
                  {activity.map((a, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-gradient-blue text-[11px] font-semibold text-white">
                        {a.who.split(" ").map((n) => n[0]).join("")}
                      </span>
                      <div className="text-sm">
                        <span className="font-semibold">{a.who}</span>{" "}
                        <span className="text-muted-foreground">{a.action}</span>{" "}
                        <span className="font-medium">{a.target}</span>
                        <div className="text-xs text-muted-foreground">{a.time}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <Card title="Project Progress">
                <Donut value={workspace.progress} />
                <div className="mt-4 space-y-2 text-sm">
                  {[
                    { label: "Completed tasks", v: 28, t: "text-success" },
                    { label: "In progress", v: 14, t: "text-accent" },
                    { label: "Waiting approval", v: 4, t: "text-warning" },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className={`font-semibold ${r.t}`}>{r.v}</span>
                    </div>
                  ))}
                </div>
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
          <Card title="Client Communication" action={<Link to="/chat" className="text-xs font-semibold text-accent">Open chat →</Link>}>
            <ul className="space-y-3">
              {[
                { name: "Rohit (SpiceBite)", msg: "Loving the new logo direction!", t: "2m" },
                { name: "Aaliyah (GlowBeauty)", msg: "Can we tweak the banner copy?", t: "1h" },
                { name: "Daniel (Elite Travel)", msg: "Approved the social kit ✅", t: "3h" },
              ].map((m, i) => (
                <li key={i} className="flex items-start gap-3 rounded-xl p-2 hover:bg-muted/60">
                  <span className="grid size-9 place-items-center rounded-full bg-gradient-red text-xs font-semibold text-white">
                    {m.name[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="truncate font-semibold">{m.name}</span>
                      <span className="text-xs text-muted-foreground">{m.t}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{m.msg}</p>
                  </div>
                </li>
              ))}
            </ul>
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
            <div className="rounded-2xl bg-gradient-hero p-4 text-white">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-90">
                <Sparkles className="size-3.5" /> VisaHOBe AI
              </div>
              <p className="mt-2 text-sm leading-relaxed">
                Want me to draft a launch caption for {workspace.name} and 3 ad variations?
              </p>
              <button className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur hover:bg-white/25">
                Generate now <Wand2 className="size-3.5" />
              </button>
            </div>
          </Card>

          <Card title="Quick Shortcuts">
            <div className="grid grid-cols-2 gap-2">
              {[
                { to: "/logo-maker", label: "Logo Maker", icon: Wand2 },
                { to: "/post-designer", label: "Post Designer", icon: Sparkles },
                { to: "/website-builder", label: "Website", icon: Rocket },
                { to: "/documents", label: "Documents", icon: FileText },
              ].map((s) => (
                <Link
                  key={s.label}
                  to={s.to}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm font-medium transition hover:shadow-elegant"
                >
                  <span className="grid size-8 place-items-center rounded-lg bg-gradient-blue text-white">
                    <s.icon className="size-4" />
                  </span>
                  {s.label}
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
