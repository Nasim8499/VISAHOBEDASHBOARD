import { PageContainer } from "@/components/layout/Page";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Bell,
  Bot,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Globe2,
  ListChecks,
  MessageSquare,
  Plane,
  Plus,
  Receipt,
  Rocket,
  Search,
  Sparkles,
  Stamp,
  Users,
  Wand2,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

/* ----------------------------- Empty + Skeleton ---------------------------- */

function DashboardSkeleton() {
  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="h-24 rounded-3xl bg-muted/60 animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted/60 animate-pulse" />
          ))}
        </div>
        <div className="h-40 rounded-2xl bg-muted/60 animate-pulse" />
        <div className="h-64 rounded-2xl bg-muted/60 animate-pulse" />
      </div>
    </PageContainer>
  );
}

function EmptyDashboard() {
  return (
    <PageContainer>
      <div className="grid min-h-[70vh] place-items-center">
        <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-8 text-center shadow-elegant">
          <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-gradient-blue text-white shadow-glow">
            <Rocket className="size-7" />
          </div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Welcome to VisaHOBe</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
            Add your first client business to unlock pipelines, visa documents, and AI workflows.
          </p>
          <Link
            to="/clients/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-blue px-5 py-3 text-sm font-semibold text-white shadow-elegant hover:shadow-glow"
          >
            <Plus className="size-4" /> Add your first client
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}

/* --------------------------------- Building -------------------------------- */

type Tone = "blue" | "orange" | "red" | "green" | "navy";
const toneStyles: Record<Tone, { bg: string; ring: string; chip: string }> = {
  blue:   { bg: "from-[#177BBB] to-[#003B73]", ring: "ring-[#177BBB]/30", chip: "bg-[#177BBB]/10 text-[#177BBB]" },
  navy:   { bg: "from-[#003B73] to-[#0B1E3F]", ring: "ring-[#003B73]/30", chip: "bg-[#003B73]/10 text-[#003B73]" },
  orange: { bg: "from-[#F1573D] to-[#E63946]", ring: "ring-[#F1573D]/30", chip: "bg-[#F1573D]/10 text-[#F1573D]" },
  red:    { bg: "from-[#E63946] to-[#B72B36]", ring: "ring-[#E63946]/30", chip: "bg-[#E63946]/10 text-[#E63946]" },
  green:  { bg: "from-emerald-500 to-emerald-700", ring: "ring-emerald-500/30", chip: "bg-emerald-500/10 text-emerald-700" },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 320, damping: 28 } },
};
const list = { show: { transition: { staggerChildren: 0.05 } } };

function GreetingHero({ name, totalClients }: { name: string; totalClients: number }) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 26 }}
      className="relative overflow-hidden rounded-3xl p-5 text-white shadow-premium"
      style={{ backgroundImage: "var(--gradient-sidebar)" }}
    >
      <div className="absolute -right-10 -top-10 size-40 rounded-full bg-[#F1573D]/30 blur-3xl" />
      <div className="absolute -bottom-12 -left-8 size-44 rounded-full bg-[#177BBB]/40 blur-3xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">{greet}</p>
          <h1 className="mt-1 font-display text-2xl font-bold leading-tight">
            {name?.split(" ")[0] || "VisaHOBe"} 👋
          </h1>
          <p className="mt-1.5 text-sm text-white/80">
            You have <b className="text-white">{totalClients}</b> active client {totalClients === 1 ? "file" : "files"} in motion today.
          </p>
        </div>
        <Link
          to="/notifications"
          className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/15 text-white backdrop-blur transition active:scale-95"
        >
          <Bell className="size-4" />
        </Link>
      </div>

      <Link
        to="/clients"
        className="relative mt-4 flex items-center gap-2 rounded-2xl bg-white/10 px-3.5 py-2.5 text-sm text-white/85 backdrop-blur ring-1 ring-white/15"
      >
        <Search className="size-4" />
        <span className="flex-1">Search clients, visas, employers…</span>
        <kbd className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10px]">⌘K</kbd>
      </Link>
    </motion.div>
  );
}

function KpiCard({
  label, value, delta, icon: Icon, tone,
}: { label: string; value: string; delta?: string; icon: any; tone: Tone }) {
  const t = toneStyles[tone];
  return (
    <motion.div variants={item}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-3.5 shadow-sm">
      <div className={cn("absolute -right-6 -top-6 size-20 rounded-full opacity-20 blur-2xl bg-gradient-to-br", t.bg)} />
      <div className="flex items-center justify-between">
        <span className={cn("grid size-9 place-items-center rounded-xl text-white bg-gradient-to-br", t.bg)}>
          <Icon className="size-4" />
        </span>
        {delta && <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", t.chip)}>{delta}</span>}
      </div>
      <div className="mt-2.5 font-display text-xl font-bold tracking-tight">{value}</div>
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
    </motion.div>
  );
}

function ShortcutTile({
  to, label, icon: Icon, tone, hint,
}: { to: string; label: string; icon: any; tone: Tone; hint?: string }) {
  const t = toneStyles[tone];
  return (
    <motion.div variants={item} whileTap={{ scale: 0.95 }}>
      <Link
        to={to}
        className="group flex h-full flex-col items-start gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-elegant"
      >
        <span className={cn("grid size-10 place-items-center rounded-xl text-white shadow-glow bg-gradient-to-br", t.bg)}>
          <Icon className="size-[18px]" />
        </span>
        <div className="text-[13px] font-semibold leading-tight">{label}</div>
        {hint && <div className="text-[10.5px] text-muted-foreground">{hint}</div>}
      </Link>
    </motion.div>
  );
}

function SectionHeader({ title, to, hint }: { title: string; to?: string; hint?: string }) {
  return (
    <div className="mb-2.5 flex items-end justify-between gap-2">
      <div>
        <h2 className="font-display text-base font-bold tracking-tight">{title}</h2>
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      {to && (
        <Link to={to} className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary">
          See all <ChevronRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}

/* ---------------------------------- Page ---------------------------------- */

export default function Dashboard() {
  const { all, loading } = useWorkspace();
  const { fullName } = useAuth();
  const navigate = useNavigate();

  if (loading) return <DashboardSkeleton />;
  if (all.length === 0) return <EmptyDashboard />;

  const total = all.length;
  const active = all.filter((b) => b.status === "active").length;
  const completed = all.filter((b) => b.status === "completed").length;
  const avgProgress = Math.round(all.reduce((s, b) => s + (b.progress || 0), 0) / total);

  // Pipeline buckets
  const pipeline = [
    { key: "intake",    label: "Intake",       count: all.filter((b) => b.progress < 25).length,                        tone: "navy" as Tone },
    { key: "docs",      label: "Documents",    count: all.filter((b) => b.progress >= 25 && b.progress < 60).length,    tone: "blue" as Tone },
    { key: "submitted", label: "Submitted",    count: all.filter((b) => b.progress >= 60 && b.progress < 90).length,    tone: "orange" as Tone },
    { key: "approved",  label: "Approved",     count: all.filter((b) => b.progress >= 90).length,                       tone: "green" as Tone },
  ];

  // Country roll-up
  const countryMap = new Map<string, number>();
  all.forEach((b) => {
    const c = b.country || "—";
    countryMap.set(c, (countryMap.get(c) || 0) + 1);
  });
  const countries = [...countryMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <PageContainer>
      <div className="space-y-5">
        <GreetingHero name={fullName || "VisaHOBe"} totalClients={active} />

        {/* KPI strip */}
        <motion.div variants={list} initial="hidden" animate="show" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard label="Total clients"   value={String(total)}        delta="+3"   icon={Users}        tone="blue" />
          <KpiCard label="Active files"    value={String(active)}       delta="live" icon={FileText}     tone="orange" />
          <KpiCard label="Avg. progress"   value={`${avgProgress}%`}    delta="+5%"  icon={Clock3}       tone="navy" />
          <KpiCard label="Approved"        value={String(completed)}    delta="+2"   icon={CheckCircle2} tone="green" />
        </motion.div>

        {/* Visa agent workflow shortcuts */}
        <section>
          <SectionHeader title="Quick actions" hint="Agent workflow shortcuts" />
          <motion.div variants={list} initial="hidden" animate="show" className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
            <ShortcutTile to="/ai"             label="AI Assistant"   hint="Draft & translate" icon={Bot}          tone="orange" />
            <ShortcutTile to="/clients/new"    label="New Client"     hint="Onboard fast"      icon={Plus}         tone="blue" />
            <ShortcutTile to="/visa-documents" label="Visa Docs"      hint="A4 templates"      icon={Stamp}        tone="navy" />
            <ShortcutTile to="/meetings"       label="Schedule"       hint="Book a slot"       icon={CalendarClock} tone="red" />
            <ShortcutTile to="/approvals"      label="Approvals"      hint="Review queue"      icon={ListChecks}   tone="green" />
            <ShortcutTile to="/chat"           label="Inbox"          hint="Client messages"   icon={MessageSquare} tone="blue" />
          </motion.div>
        </section>

        {/* Client pipeline */}
        <section>
          <SectionHeader title="Client pipeline" to="/clients" hint="Visa application stages" />
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {pipeline.map((p) => {
              const t = toneStyles[p.tone];
              return (
                <button
                  key={p.key}
                  onClick={() => navigate("/clients")}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-3.5 text-left shadow-sm transition active:scale-[0.97]"
                >
                  <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", t.bg)} />
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {p.label}
                  </div>
                  <div className="mt-1 flex items-end justify-between">
                    <div className="font-display text-2xl font-bold">{p.count}</div>
                    <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Application status — live client list */}
        <section>
          <SectionHeader title="Application status" to="/clients" hint="Live updates from your files" />
          <motion.div variants={list} initial="hidden" animate="show" className="space-y-2.5">
            {all.slice(0, 5).map((b) => (
              <motion.div key={b.id} variants={item}>
                <Link
                  to={`/workspace/${b.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-elegant"
                >
                  <div
                    className="grid size-11 shrink-0 place-items-center rounded-xl text-lg shadow-glow"
                    style={{ backgroundImage: `linear-gradient(135deg, ${b.color}, #003B73)` , color: "white" }}
                  >
                    {b.logo}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-semibold">{b.name}</div>
                      <StatusBadge status={b.status === "active" ? "In Progress" : b.status === "paused" ? "Pending" : "Completed"} className="hidden sm:inline-flex" />
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Globe2 className="size-3" />
                      <span className="truncate">{b.country || "—"}</span>
                      <span>·</span>
                      <span className="truncate">{b.category}</span>
                    </div>
                    <ProgressBar value={b.progress || 0} className="mt-1.5" />
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Two-up: Visa Document Center & AI Assistant */}
        <section className="grid gap-3 sm:grid-cols-2">
          <motion.div variants={item} initial="hidden" animate="show"
            className="relative overflow-hidden rounded-3xl p-5 text-white shadow-premium"
            style={{ backgroundImage: "linear-gradient(135deg, #003B73 0%, #177BBB 100%)" }}
          >
            <div className="absolute -right-8 -bottom-8 size-36 rounded-full bg-[#F1573D]/40 blur-3xl" />
            <div className="relative flex items-start gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                <Stamp className="size-5" />
              </span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-white/70">Document Center</div>
                <h3 className="mt-0.5 font-display text-lg font-bold">10 Visa A4 Templates</h3>
                <p className="mt-1 text-xs text-white/75">Visitor, Work, Study & more — print-ready PDFs.</p>
                <Link to="/visa-documents" className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold backdrop-blur active:scale-95">
                  Open library <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} initial="hidden" animate="show"
            className="relative overflow-hidden rounded-3xl p-5 text-white shadow-premium"
            style={{ backgroundImage: "linear-gradient(135deg, #F1573D 0%, #E63946 100%)" }}
          >
            <div className="absolute -left-8 -bottom-8 size-36 rounded-full bg-white/20 blur-3xl" />
            <div className="relative flex items-start gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-white/20 backdrop-blur">
                <Sparkles className="size-5" />
              </span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-white/80">AI Assistant</div>
                <h3 className="mt-0.5 font-display text-lg font-bold">Draft cover letters in seconds</h3>
                <p className="mt-1 text-xs text-white/85">Generate SOPs, translations, and visa checklists.</p>
                <Link to="/ai" className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2 text-xs font-semibold backdrop-blur active:scale-95">
                  Launch AI <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Employer database + country tracking */}
        <section className="grid gap-3 sm:grid-cols-2">
          <motion.div variants={item} initial="hidden" animate="show"
            className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <SectionHeader title="Employer database" hint="Sponsors & partners" />
              <Link to="/team" className="text-xs font-semibold text-primary">Manage</Link>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["Acme Corp", "BlueOcean", "NovaTech", "Skyline", "Vertex", "Helios"].map((e, i) => (
                <div key={e} className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-muted/40 p-2.5">
                  <div className={cn("grid size-9 place-items-center rounded-xl text-white text-xs font-bold bg-gradient-to-br",
                    ["from-[#003B73] to-[#177BBB]","from-[#F1573D] to-[#E63946]","from-emerald-500 to-emerald-700","from-[#177BBB] to-[#003B73]","from-[#E63946] to-[#F1573D]","from-slate-700 to-slate-900"][i])}>
                    {e.slice(0,2).toUpperCase()}
                  </div>
                  <div className="truncate text-[10.5px] font-semibold">{e}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={item} initial="hidden" animate="show"
            className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <SectionHeader title="Country tracking" hint="Top destinations" />
            <ul className="space-y-2">
              {countries.length === 0 && (
                <li className="text-xs text-muted-foreground">No country data yet.</li>
              )}
              {countries.map(([country, count], i) => {
                const max = countries[0][1] || 1;
                const pct = Math.max(8, Math.round((count / max) * 100));
                return (
                  <li key={country} className="flex items-center gap-3">
                    <span className="grid size-7 place-items-center rounded-lg bg-gradient-blue text-[10px] font-bold text-white">
                      <Plane className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-[12px] font-medium">
                        <span className="truncate">{country}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: i * 0.06, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-[#F1573D] to-[#E63946]"
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </section>

        {/* Billing peek */}
        <motion.div variants={item} initial="hidden" animate="show"
          className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-blue text-white">
              <Receipt className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Billing & invoices</div>
              <div className="text-[11px] text-muted-foreground">Track revenue, send invoices, and manage subscriptions.</div>
            </div>
            <Link to="/billing" className="rounded-xl bg-gradient-orange px-3 py-2 text-xs font-semibold text-white shadow-elegant active:scale-95">
              Open
            </Link>
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
}
