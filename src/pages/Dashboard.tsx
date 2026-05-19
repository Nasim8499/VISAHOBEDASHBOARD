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
  { label: "Total Clients", value: "24", delta: "+3", icon: Building2, tone: "bg-gradient-blue" },
  { label: "Active Projects", value: "12", delta: "+2", icon: FolderKanban, tone: "bg-gradient-red" },
  { label: "In Progress", value: "38", delta: "+8", icon: Clock3, tone: "bg-primary" },
  { label: "Completed", value: "146", delta: "+12", icon: CheckCircle2, tone: "bg-success" },
  { label: "Revenue · Month", value: "$184k", delta: "+18%", icon: DollarSign, tone: "bg-accent" },
];

export default function Dashboard() {
  const { workspace, all, loading } = useWorkspace();

  if (!loading && all.length === 0) {
    return <EmptyDashboard />;
  }



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
            className="group rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:shadow-elegant"
          >
            <div className="flex items-start justify-between">
              <span className={`grid size-9 place-items-center rounded-xl ${k.tone} text-white`}>
                <k.icon className="size-4" />
              </span>
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                {k.delta}
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold">{k.value}</div>
            <div className="text-xs text-muted-foreground">{k.label}</div>
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

          {/* Brand Builder Progress timeline */}
          <Card title="Brand Builder Progress" action={<Link to="/brand-builder" className="text-xs font-semibold text-accent">Open builder →</Link>}>
            <ol className="relative ml-3 space-y-5 border-l border-border pl-6">
              {["Identity & Strategy", "Visual Identity", "Stationery Kit", "Social Media", "Launch"].map(
                (step, i) => {
                  const done = i < 3;
                  const current = i === 3;
                  return (
                    <li key={step} className="relative">
                      <span
                        className={`absolute -left-[34px] grid size-6 place-items-center rounded-full text-[11px] font-bold ring-4 ring-background ${
                          done
                            ? "bg-success text-white"
                            : current
                            ? "bg-gradient-red text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {done ? "✓" : i + 1}
                      </span>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold">{step}</div>
                          <div className="text-xs text-muted-foreground">
                            {done
                              ? "Completed and approved by client"
                              : current
                              ? "In progress — 2 items waiting approval"
                              : "Up next"}
                          </div>
                        </div>
                        <StatusBadge status={done ? "Completed" : current ? "In Progress" : "Not Started"} />
                      </div>
                    </li>
                  );
                }
              )}
            </ol>
          </Card>

          {/* Deliverables overview */}
          <Card title="Deliverables Overview" action={<button className="text-xs font-semibold text-accent">Filter →</button>}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {deliverables.map((d) => (
                <div key={d.key} className="rounded-2xl border border-border bg-gradient-card p-4 hover:shadow-elegant transition">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{d.title}</div>
                    <StatusBadge status={d.status} />
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={d.progress} tone={d.progress > 70 ? "blue" : "red"} />
                    <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                      <span>{d.progress}% done</span>
                      <span>Owner · Sara K.</span>
                    </div>
                  </div>
                </div>
              ))}
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

      {/* Bottom banner */}
      <div className="mt-8 overflow-hidden rounded-3xl bg-gradient-hero p-6 text-white shadow-premium sm:p-10">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              VisaHOBe Operating OS
            </div>
            <h3 className="mt-1 max-w-2xl font-display text-2xl font-bold sm:text-3xl">
              Build, manage & grow your client businesses — all in one place.
            </h3>
          </div>
          <div className="flex gap-2">
            <Link
              to="/clients/new"
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary hover:bg-white/90"
            >
              New Workspace
            </Link>
            <Link
              to="/brand-builder"
              className="rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur hover:bg-white/20"
            >
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
