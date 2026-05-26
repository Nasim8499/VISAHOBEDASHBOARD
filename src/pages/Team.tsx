import { useState } from "react";
import { PageContainer, PageHeader } from "@/components/layout/Page";
import { employees } from "@/data/mock";
import { Plus, X, Loader2, ShieldCheck, Users, UserCheck, Briefcase, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkline, MiniRing, KpiCard } from "@/components/charts/MiniCharts";

const ease = [0.22, 1, 0.36, 1] as const;

type Role = "employee" | "client";

const seedTrend = (seed: number) =>
  Array.from({ length: 10 }, (_, i) => Math.round(10 + Math.sin(i / 1.4 + seed) * 6 + (i % 5) + (seed % 4)));

const kpis = [
  { label: "Team members", value: String(employees.length), delta: "+1", icon: Users, tone: "bg-gradient-blue", trend: [4, 5, 6, 7, 7, 8, 9, 10], sub: "active staff" },
  { label: "Available now", value: String(Math.max(1, employees.length - 2)), delta: "live", icon: UserCheck, tone: "bg-success", trend: [3, 4, 5, 5, 6, 7, 7, 8], sub: "online today" },
  { label: "Avg. workload", value: "72%", delta: "balanced", icon: Briefcase, tone: "bg-accent", trend: [55, 60, 64, 66, 68, 70, 71, 72], bars: true, sub: "across team" },
  { label: "Tasks moved", value: "184", delta: "+24", icon: Activity, tone: "bg-gradient-red", trend: [110, 124, 132, 145, 156, 168, 176, 184], sub: "this week" },
];

export default function Team() {
  const { role } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <PageContainer>
      <PageHeader
        title="Team Management"
        subtitle="VisaHOBe employees, roles, workload and assigned client businesses."
        actions={
          role === "super_admin" ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-blue px-4 py-2.5 text-sm font-semibold text-white shadow-elegant transition hover:shadow-glow"
            >
              <Plus className="size-4" /> Create user
            </motion.button>
          ) : null
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k, i) => <KpiCard key={k.label} {...k} index={i} />)}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {employees.map((e, i) => {
          const workload = Math.min(100, e.load * 12);
          const ringColor = workload > 80 ? "hsl(var(--destructive))" : workload > 60 ? "hsl(var(--warning))" : "hsl(var(--primary))";
          return (
            <motion.article
              key={e.name}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.2 + i * 0.05 }}
              whileHover={{ y: -3 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-elegant"
            >
              <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-gradient-blue opacity-[0.08] blur-2xl transition group-hover:opacity-20" />
              <div className="relative flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-gradient-blue text-sm font-semibold text-white shadow-sm">
                  {e.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{e.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{e.role}</div>
                </div>
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">Available</span>
              </div>

              <div className="relative mt-5 flex items-center gap-4">
                <div style={{ color: ringColor }}>
                  <MiniRing value={workload} size={64} stroke={7} color={ringColor} />
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Stat label="Clients" value={e.clients} />
                    <Stat label="Tasks" value={e.load} />
                  </div>
                </div>
              </div>

              <div className="relative mt-4">
                <div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
                  <span>Activity · 10d</span>
                  <span>+{(i + 1) * 4}%</span>
                </div>
                <div className="text-primary">
                  <Sparkline data={seedTrend(i + 3)} className="h-9 w-full" />
                </div>
              </div>

              <div className="relative mt-4 flex gap-2">
                <button
                  onClick={() => toast.success(`Opening ${e.name}'s profile`, { description: `${e.role} · ${e.clients} clients · ${e.load} tasks` })}
                  className="tap flex-1 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold transition hover:bg-muted"
                >
                  View profile
                </button>
                <button
                  onClick={() => toast.message(`Permissions · ${e.name}`, { description: "Role-based access editor coming next." })}
                  className="tap rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold transition hover:bg-muted"
                >
                  Permissions
                </button>
              </div>
            </motion.article>
          );
        })}
      </div>

      <AnimatePresence>
        {open && <CreateUserModal onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </PageContainer>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-muted/50 p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-base font-bold leading-tight">{value}</div>
    </div>
  );
}


function CreateUserModal({ onClose }: { onClose: () => void }) {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("employee");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-create-user", {
        body: { username, password, role, full_name: fullName || username },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success(`${role === "employee" ? "Employee" : "Client"} account created`);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Could not create user");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-elegant"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" /> Super Admin
            </div>
            <h3 className="mt-1 font-display text-xl font-bold">Create new user</h3>
            <p className="text-xs text-muted-foreground">Provision an employee or client account individually.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <Input label="Username" value={username} onChange={setUsername} required placeholder="e.g. sarah" />
          <Input label="Full name" value={fullName} onChange={setFullName} placeholder="Sarah Tan" />
          <Input label="Password" type="password" value={password} onChange={setPassword} required minLength={6} />

          <div>
            <div className="mb-1.5 text-xs font-semibold text-muted-foreground">Role</div>
            <div className="grid grid-cols-2 gap-2">
              {(["employee", "client"] as const).map((r) => (
                <button
                  type="button" key={r} onClick={() => setRole(r)}
                  className={`rounded-xl border p-3 text-left text-sm transition ${
                    role === r ? "border-primary bg-primary/5 font-semibold" : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="capitalize">{r}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {r === "employee" ? "Internal team access" : "Limited portal access"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={busy}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-blue px-4 py-3 text-sm font-semibold text-white shadow-elegant transition hover:shadow-glow disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function Input({ label, value, onChange, type = "text", required, minLength, placeholder }: any) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        type={type}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </label>
  );
}
