import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import {
  Lock, User2, ArrowRight, ShieldCheck, Shield,
  Briefcase, GraduationCap, ArrowLeft, Sparkles,
  TrendingUp, Users, Globe2, Zap, BarChart3, Activity, Star,
} from "lucide-react";
import dashboardHero from "@/assets/auth-dashboard-hero.jpg";
import workspaceImg from "@/assets/auth-workspace.jpg";
import trainingImg from "@/assets/auth-training.jpg";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "666085";

type Role = "admin" | "employee" | "training";

const ROLES: {
  id: Role; title: string; subtitle: string; desc: string; icon: any; tone: string; stat: string; statLabel: string; image: string;
}[] = [
  {
    id: "admin",
    title: "Admin Login",
    subtitle: "Super Admin · Owner",
    desc: "Full control of teams, clients, billing and workspace governance.",
    icon: Shield,
    tone: "from-[hsl(230_55%_18%)] via-[hsl(232_55%_28%)] to-[hsl(235_60%_42%)]",
    stat: "100%",
    statLabel: "Access",
    image: dashboardHero,
  },
  {
    id: "employee",
    title: "Employee Login",
    subtitle: "Staff workspace",
    desc: "Manage clients, brand builder, tasks, meetings and approvals.",
    icon: Briefcase,
    tone: "from-[hsl(235_75%_72%)] via-[hsl(228_75%_78%)] to-[hsl(220_70%_82%)]",
    stat: "12k+",
    statLabel: "Actions / mo",
    image: workspaceImg,
  },
  {
    id: "training",
    title: "Training Portal",
    subtitle: "Learners · Certification",
    desc: "Courses, lessons, exams and certificates — a premium LMS.",
    icon: GraduationCap,
    tone: "from-[hsl(245_80%_92%)] via-[hsl(232_75%_88%)] to-[hsl(220_70%_82%)]",
    stat: "98%",
    statLabel: "Pass rate",
    image: trainingImg,
  },
];

const METRICS = [
  { icon: Users, value: "24,580", label: "Active users", trend: "+18.4%" },
  { icon: Globe2, value: "47", label: "Countries", trend: "+6" },
  { icon: TrendingUp, value: "$2.1M", label: "Processed", trend: "+32%" },
  { icon: Activity, value: "99.99%", label: "Uptime SLA", trend: "stable" },
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

  // Parallax pointer tracking
  const containerRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 18 });
  const smy = useSpring(my, { stiffness: 60, damping: 18 });
  const orb1X = useTransform(smx, [-1, 1], [-40, 40]);
  const orb1Y = useTransform(smy, [-1, 1], [-30, 30]);
  const orb2X = useTransform(smx, [-1, 1], [30, -30]);
  const orb2Y = useTransform(smy, [-1, 1], [25, -25]);
  const gridX = useTransform(smx, [-1, 1], [-12, 12]);
  const gridY = useTransform(smy, [-1, 1], [-12, 12]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth, h = window.innerHeight;
      mx.set((e.clientX / w) * 2 - 1);
      my.set((e.clientY / h) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  // Scroll parallax
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.4]);

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
    <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-[hsl(240_60%_98%)]">
      {/* === Parallax ambient layer === */}
      <motion.div
        style={{ x: orb1X, y: orb1Y }}
        className="pointer-events-none absolute -left-40 top-0 size-[36rem] rounded-full bg-gradient-to-br from-[hsl(235_85%_82%)] to-[hsl(260_75%_85%)] opacity-60 blur-3xl"
      />
      <motion.div
        style={{ x: orb2X, y: orb2Y }}
        className="pointer-events-none absolute -right-32 top-40 size-[32rem] rounded-full bg-gradient-to-br from-[hsl(220_85%_85%)] to-[hsl(195_80%_82%)] opacity-50 blur-3xl"
      />
      <motion.div
        style={{ x: orb1X, y: orb2Y }}
        className="pointer-events-none absolute bottom-0 left-1/3 size-[30rem] rounded-full bg-gradient-to-br from-[hsl(340_75%_88%)] to-[hsl(20_85%_88%)] opacity-40 blur-3xl"
      />

      {/* Grid backdrop with parallax */}
      <motion.div
        style={{ x: gridX, y: gridY }}
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
      >
        <svg className="size-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
              <path d="M 56 0 L 0 0 0 56" fill="none" stroke="hsl(230 45% 30%)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </motion.div>

      {/* Floating infographic shards */}
      <FloatingShards />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-8 sm:px-8 lg:py-12">
        {/* Brand row */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="relative grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-[hsl(230_55%_18%)] to-[hsl(235_60%_38%)] text-primary-foreground shadow-premium">
              <span className="font-display text-lg font-bold">V</span>
              <span className="absolute -right-1 -top-1 size-3 rounded-full bg-[hsl(20_85%_60%)] ring-2 ring-background" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">VisaHOBe</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Business OS · Premium Suite</div>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-[11px] font-medium text-muted-foreground backdrop-blur sm:inline-flex">
            <span className="size-1.5 animate-pulse rounded-full bg-[hsl(158_60%_45%)]" />
            All systems operational
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!role ? (
            <motion.section
              key="picker"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-12 flex flex-1 flex-col"
            >
              {/* HERO with parallax */}
              <motion.div style={{ y: heroY, opacity: heroOpacity }} className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur">
                    <Sparkles className="size-3 text-accent" /> Premium · Choose your entry
                  </div>
                  <h1 className="mt-5 font-display text-5xl font-bold leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                    {["A calm,", "premium place", "to do focused work."].map((line, li) => (
                      <span key={li} className="block overflow-hidden">
                        <motion.span
                          initial={{ y: "110%", opacity: 0 }}
                          animate={{ y: "0%", opacity: 1 }}
                          transition={{ delay: 0.15 + li * 0.12, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                          className={li === 1 ? "inline-block bg-gradient-to-r from-[hsl(230_55%_18%)] via-[hsl(235_75%_55%)] to-[hsl(0_75%_58%)] bg-clip-text text-transparent" : "inline-block"}
                        >
                          {line}
                        </motion.span>
                      </span>
                    ))}
                  </h1>
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.6 }}
                    className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground"
                  >
                    Editorial design meets enterprise power. Pick how you'd like to sign in — each space is tailored to what you do best.
                  </motion.p>

                  {/* Animated infographic stats */}
                  <div className="mt-10 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
                    {METRICS.map((m, i) => (
                      <motion.div
                        key={m.label}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                        className="group relative overflow-hidden rounded-2xl border border-border bg-card/80 p-3 backdrop-blur transition hover:-translate-y-1 hover:shadow-elegant"
                      >
                        <m.icon className="size-4 text-accent" strokeWidth={1.6} />
                        <div className="mt-2 font-display text-lg font-bold leading-none">{m.value}</div>
                        <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{m.label}</div>
                        <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-[hsl(158_60%_38%)]">
                          <TrendingUp className="size-2.5" /> {m.trend}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Right-side infographic dashboard mock */}
                <InfographicPanel />
              </motion.div>

              {/* Role cards */}
              <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {ROLES.map((r, i) => (
                  <motion.button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    whileHover={{ y: -8, rotateX: 2, rotateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                    className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 text-left shadow-sm transition-shadow hover:shadow-premium"
                  >
                    <div className="absolute inset-x-0 top-0 h-44 overflow-hidden">
                      <motion.img
                        src={r.image}
                        alt={r.title}
                        loading="lazy"
                        className="absolute inset-0 size-full object-cover"
                        initial={{ scale: 1.15 }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-br ${r.tone} opacity-70 mix-blend-multiply`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/0 to-transparent" />
                    </div>
                    {/* Decorative rings */}
                    <svg className="absolute -right-8 -top-8 size-40 opacity-25" viewBox="0 0 200 200">
                      <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="1" />
                      <circle cx="100" cy="100" r="60" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                      <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="1" />
                    </svg>

                    <div className="relative">
                      <div className="flex items-start justify-between">
                        <div className="grid size-12 place-items-center rounded-2xl bg-white/90 text-primary shadow-sm backdrop-blur">
                          <r.icon className="size-5" strokeWidth={1.6} />
                        </div>
                        <div className="rounded-xl bg-white/85 px-3 py-1.5 text-right backdrop-blur">
                          <div className="font-display text-base font-bold leading-none text-foreground">{r.stat}</div>
                          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{r.statLabel}</div>
                        </div>
                      </div>
                      <div className="mt-28">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          {r.subtitle}
                        </div>
                        <h3 className="mt-1.5 font-display text-xl font-bold text-foreground">{r.title}</h3>
                        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{r.desc}</p>
                      </div>
                      <div className="mt-6 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                          Continue <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1.5" />
                        </span>
                        <div className="flex gap-1">
                          {[0,1,2].map(d => (
                            <span key={d} className="size-1 rounded-full bg-foreground/20" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-auto pt-12 text-center text-[11px] text-muted-foreground">
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
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur">
                  <ShieldCheck className="size-3 text-accent" /> Secure workspace
                </div>
                <h2 className="mt-4 font-display text-5xl font-bold leading-[1.05] text-foreground">
                  {ROLES.find(r => r.id === role)?.title}.
                </h2>
                <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                  {ROLES.find(r => r.id === role)?.desc}
                </p>
                <div className={`relative mt-10 h-56 max-w-md overflow-hidden rounded-3xl bg-gradient-to-br ${ROLES.find(r => r.id === role)?.tone} shadow-premium`}>
                  <svg className="absolute inset-0 size-full opacity-30" viewBox="0 0 400 200" preserveAspectRatio="none">
                    <path d="M0 150 Q 100 80 200 120 T 400 100 L 400 200 L 0 200 Z" fill="white" />
                  </svg>
                  <div className="absolute bottom-5 left-5 right-5 grid grid-cols-3 gap-3 text-white">
                    {[
                      { icon: Zap, label: "Fast" },
                      { icon: ShieldCheck, label: "Secure" },
                      { icon: BarChart3, label: "Insightful" },
                    ].map((f, i) => (
                      <div key={i} className="rounded-2xl bg-white/15 p-3 backdrop-blur">
                        <f.icon className="size-4" strokeWidth={1.6} />
                        <div className="mt-2 text-[11px] font-semibold">{f.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
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

                <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-border bg-card/90 p-6 shadow-premium backdrop-blur-xl">
                  <Field icon={User2} label="Username" value={username} onChange={setUsername} required autoFocus />
                  <Field icon={Lock} label="Password" type="password" value={password} onChange={setPassword} required minLength={6} />

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={busy}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[hsl(230_55%_18%)] to-[hsl(235_60%_38%)] px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:shadow-glow disabled:opacity-60"
                  >
                    {busy ? "Please wait…" : "Sign in"}
                    <ArrowRight className="size-4" />
                  </motion.button>

                  <div className="flex items-start gap-2 rounded-2xl bg-muted/60 p-3 text-[11px] leading-relaxed text-muted-foreground">
                    <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-accent" />
                    <span>New accounts are issued by your Super Admin from the Team page.</span>
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

/* ===== Floating infographic shards (decorative parallax) ===== */
function FloatingShards() {
  const shards = [
    { top: "12%", left: "6%", size: 50, rot: -12, delay: 0 },
    { top: "70%", left: "4%", size: 36, rot: 18, delay: 0.8 },
    { top: "20%", left: "92%", size: 44, rot: 24, delay: 0.4 },
    { top: "80%", left: "88%", size: 58, rot: -8, delay: 1.2 },
  ];
  return (
    <>
      {shards.map((s, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute hidden lg:block"
          style={{ top: s.top, left: s.left }}
          animate={{ y: [0, -14, 0], rotate: [s.rot, s.rot + 6, s.rot] }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
        >
          <div
            style={{ width: s.size, height: s.size }}
            className="rounded-2xl border border-border bg-card/70 shadow-elegant backdrop-blur"
          />
        </motion.div>
      ))}
    </>
  );
}

/* ===== Infographic dashboard mock ===== */
function InfographicPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto hidden w-full max-w-md lg:block"
    >
      {/* Hero dashboard image with tilt + glow */}
      <motion.div
        initial={{ rotateY: -8, rotateX: 6 }}
        whileHover={{ rotateY: 0, rotateX: 0, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 80, damping: 14 }}
        style={{ transformStyle: "preserve-3d", perspective: 1200 }}
        className="relative overflow-hidden rounded-3xl border border-border shadow-premium"
      >
        <motion.img
          src={dashboardHero}
          alt="VisaHOBe analytics dashboard"
          width={1024}
          height={1024}
          className="block size-full object-cover"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Sheen sweep */}
        <motion.div
          initial={{ x: "-120%" }}
          animate={{ x: "160%" }}
          transition={{ duration: 2.4, ease: "easeInOut", delay: 0.8, repeat: Infinity, repeatDelay: 4 }}
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
        />
        {/* Live badge */}
        <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
          <span className="size-1.5 animate-pulse rounded-full bg-[hsl(158_60%_55%)]" />
          Live analytics
        </div>
      </motion.div>

      {/* Floating mini stat */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-6 -top-6 rounded-2xl border border-border bg-card/95 p-3 shadow-elegant backdrop-blur"
      >
        <Zap className="size-4 text-accent" />
        <div className="mt-1.5 font-display text-sm font-bold">1.2s</div>
        <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Avg load</div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        className="absolute -bottom-6 -right-4 flex items-center gap-2 rounded-2xl border border-border bg-card/95 p-3 shadow-elegant backdrop-blur"
      >
        <div className="grid size-8 place-items-center rounded-xl bg-[hsl(158_60%_45%)]/15">
          <TrendingUp className="size-4 text-[hsl(158_60%_38%)]" />
        </div>
        <div>
          <div className="font-display text-sm font-bold">+312</div>
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Today</div>
        </div>
      </motion.div>
    </motion.div>
  );
}
