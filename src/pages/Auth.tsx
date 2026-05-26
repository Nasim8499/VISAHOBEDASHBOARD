import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, User2, ArrowRight, ShieldCheck, Shield,
  Briefcase, GraduationCap, ArrowLeft, Sparkles,
} from "lucide-react";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "666085";

type Role = "admin" | "employee" | "training";

const ROLES: {
  id: Role; title: string; subtitle: string; desc: string; icon: any; tone: string;
}[] = [
  {
    id: "admin",
    title: "Admin Login",
    subtitle: "Super Admin · Owner",
    desc: "Full control of teams, clients, billing and workspace governance.",
    icon: Shield,
    tone: "from-[hsl(230_55%_18%)] to-[hsl(235_60%_38%)]",
  },
  {
    id: "employee",
    title: "Employee Login",
    subtitle: "Staff workspace",
    desc: "Manage clients, brand builder, tasks, meetings and approvals.",
    icon: Briefcase,
    tone: "from-[hsl(235_75%_72%)] to-[hsl(220_70%_82%)]",
  },
  {
    id: "training",
    title: "Training Portal",
    subtitle: "Learners · Certification",
    desc: "Courses, lessons, exams and certificates — a premium LMS.",
    icon: GraduationCap,
    tone: "from-[hsl(245_80%_92%)] to-[hsl(220_70%_88%)]",
  },
];

function toEmail(username: string) {
  return `${username.toLowerCase().trim().replace(/[^a-z0-9_.-]/g, "")}@visahobe.local`;
}

export default function Auth() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const u = username.toLowerCase().trim();
      const email = toEmail(u);
      const isAdmin = u === ADMIN_USERNAME && password === ADMIN_PASSWORD;

      let { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error && isAdmin) {
        const { error: signUpErr } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: "Super Admin", role: "super_admin", username: u },
          },
        });
        if (signUpErr) throw signUpErr;
        const retry = await supabase.auth.signInWithPassword({ email, password });
        if (retry.error) throw retry.error;
        error = null;
      }

      if (error) throw error;
      toast.success("Welcome back");
      navigate(role === "training" ? "/training" : "/");
    } catch (err: any) {
      toast.error(err?.message || "Invalid credentials");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Editorial ambient orbs */}
      <div className="pointer-events-none absolute -left-32 top-10 size-[28rem] rounded-full bg-[hsl(235_85%_85%)] opacity-50 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-[26rem] rounded-full bg-[hsl(220_80%_88%)] opacity-50 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 sm:px-8 lg:py-14">
        {/* Brand row */}
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-elegant">
            <span className="font-display text-lg font-bold">V</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">VisaHOBe</div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Business OS · Editorial Suite</div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!role ? (
            <motion.section
              key="picker"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 flex flex-1 flex-col"
            >
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                  <Sparkles className="size-3 text-accent" /> Choose your entry
                </div>
                <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
                  A calm,<br/>premium place<br/>to do focused work.
                </h1>
                <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                  Pick how you'd like to sign in today. Each space is tailored for what you do best.
                </p>
              </div>

              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {ROLES.map((r, i) => (
                  <motion.button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    whileHover={{ y: -6 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 text-left shadow-sm transition-shadow hover:shadow-premium"
                  >
                    <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-br ${r.tone} opacity-90`} />
                    <div className="relative">
                      <div className="grid size-12 place-items-center rounded-2xl bg-white/85 text-primary shadow-sm backdrop-blur">
                        <r.icon className="size-5" strokeWidth={1.6} />
                      </div>
                      <div className="mt-16">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          {r.subtitle}
                        </div>
                        <h3 className="mt-1.5 font-display text-xl font-bold text-foreground">{r.title}</h3>
                        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{r.desc}</p>
                      </div>
                      <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                        Continue <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-auto pt-10 text-[11px] text-muted-foreground">
                © VisaHOBe PTE. LTD. · Private workspace — no public sign-up.
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 grid flex-1 gap-10 lg:grid-cols-2 lg:items-center"
            >
              <div className="hidden lg:block">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                  <ShieldCheck className="size-3 text-accent" /> Secure workspace
                </div>
                <h2 className="mt-4 font-display text-5xl font-bold leading-[1.05] text-foreground">
                  {ROLES.find(r => r.id === role)?.title}.
                </h2>
                <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                  {ROLES.find(r => r.id === role)?.desc}
                </p>
                <div className={`mt-10 h-40 max-w-md rounded-3xl bg-gradient-to-br ${ROLES.find(r => r.id === role)?.tone} shadow-premium`} />
              </div>

              <div className="mx-auto w-full max-w-sm">
                <button
                  type="button"
                  onClick={() => setRole(null)}
                  className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
                >
                  <ArrowLeft className="size-3.5" /> Choose a different entry
                </button>

                <div className="mb-6 lg:hidden">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {ROLES.find(r => r.id === role)?.subtitle}
                  </div>
                  <h2 className="mt-1 font-display text-3xl font-bold text-foreground">
                    {ROLES.find(r => r.id === role)?.title}
                  </h2>
                </div>

                <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-elegant">
                  <Field icon={User2} label="Username" value={username} onChange={setUsername} required autoFocus />
                  <Field icon={Lock} label="Password" type="password" value={password} onChange={setPassword} required minLength={6} />

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={busy}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:bg-accent hover:text-accent-foreground hover:shadow-glow disabled:opacity-60"
                  >
                    {busy ? "Please wait…" : "Sign in"}
                    <ArrowRight className="size-4" />
                  </motion.button>

                  <div className="flex items-start gap-2 rounded-2xl bg-muted/60 p-3 text-[11px] leading-relaxed text-muted-foreground">
                    <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-accent" />
                    <span>
                      New accounts are issued by your Super Admin from the Team page.
                    </span>
                  </div>
                </form>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Field({
  icon: Icon, label, value, onChange, type = "text", required, minLength, autoFocus,
}: any) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.6} />
        <input
          type={type}
          required={required}
          minLength={minLength}
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-full rounded-2xl border border-border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
        />
      </div>
    </label>
  );
}
