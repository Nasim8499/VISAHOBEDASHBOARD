import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Shield, Users, GraduationCap, ArrowRight, Sparkles } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

type Role = {
  id: string;
  title: string;
  kicker: string;
  desc: string;
  icon: typeof Shield;
  to: string;
  accent: string;
};

const ROLES: Role[] = [
  {
    id: "admin",
    title: "Admin",
    kicker: "Owner / Super Admin",
    desc: "Full control — businesses, employees, revenue, approvals, training & system settings.",
    icon: Shield,
    to: "/auth?role=admin",
    accent: "from-cyan-300/30 to-teal-200/10",
  },
  {
    id: "employee",
    title: "Employee",
    kicker: "VisaHOBe Team",
    desc: "Workspace for branding, website, visa, marketing & client-support specialists.",
    icon: Users,
    to: "/auth?role=employee",
    accent: "from-teal-300/30 to-cyan-200/10",
  },
  {
    id: "training",
    title: "Training Portal",
    kicker: "Onboarding & Exam",
    desc: "Learn the system, complete modules, pass the 100-mark exam and get certified.",
    icon: GraduationCap,
    to: "/training",
    accent: "from-sky-300/30 to-cyan-200/10",
  },
];

export default function Welcome() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  return (
    <div
      className="relative min-h-screen overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(120% 80% at 20% 10%, hsl(193 56% 40% / 0.55) 0%, transparent 60%), radial-gradient(120% 80% at 85% 90%, hsl(178 38% 55% / 0.45) 0%, transparent 55%), linear-gradient(135deg, hsl(212 60% 14%) 0%, hsl(204 58% 26%) 60%, hsl(186 50% 40%) 100%)",
      }}
    >
      {/* ambient orbs */}
      <motion.div
        aria-hidden
        animate={reduce ? undefined : { x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-40 top-1/4 size-[34rem] rounded-full bg-cyan-300/10 blur-3xl"
      />
      <motion.div
        aria-hidden
        animate={reduce ? undefined : { x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-40 bottom-1/4 size-[36rem] rounded-full bg-teal-300/10 blur-3xl"
      />
      {/* subtle grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        {/* top bar */}
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="flex items-center gap-2"
          >
            <div className="grid size-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/25 backdrop-blur-md">
              <Sparkles className="size-4" />
            </div>
            <div className="font-display text-lg font-semibold tracking-tight">
              VisaHOBe<span className="text-cyan-200/80"> Business OS</span>
            </div>
          </motion.div>
          <motion.button
            onClick={() => navigate("/auth")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-white/80 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
          >
            Sign in
          </motion.button>
        </div>

        {/* hero */}
        <div className="mx-auto mt-16 max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-cyan-100/90 backdrop-blur-md"
          >
            <span className="size-1.5 rounded-full bg-cyan-300" />
            Choose your workspace
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease, delay: 0.18 }}
            className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl"
          >
            Build, train & grow{" "}
            <span className="bg-gradient-to-r from-cyan-200 via-teal-100 to-white bg-clip-text text-transparent">
              any business
            </span>{" "}
            from one OS.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.3 }}
            className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base"
          >
            Pick the door that fits you. Admins run the platform, employees deliver client work, and trainees get certified before going live.
          </motion.p>
        </div>

        {/* role cards */}
        <div className="mt-14 grid flex-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.button
                key={r.id}
                onClick={() => navigate(r.to)}
                initial={{ opacity: 0, y: 22, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.55, ease, delay: 0.35 + i * 0.08 }}
                whileHover={reduce ? undefined : { y: -6, scale: 1.015 }}
                whileTap={reduce ? undefined : { scale: 0.985 }}
                className="group relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] p-7 text-left backdrop-blur-xl shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] transition-colors hover:border-white/25 hover:bg-white/[0.09]"
              >
                {/* gradient sheen */}
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br ${r.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                />
                {/* glow line */}
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, ease, delay: 0.6 + i * 0.08 }}
                />

                <div className="relative flex items-start justify-between">
                  <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-white/15 to-white/[0.04] ring-1 ring-white/20 backdrop-blur-md transition group-hover:ring-cyan-200/50">
                    <Icon className="size-6" strokeWidth={1.7} />
                  </div>
                  <motion.span
                    aria-hidden
                    className="grid size-9 place-items-center rounded-full bg-white/10 text-white/70 ring-1 ring-white/15 transition group-hover:bg-white group-hover:text-[hsl(212_60%_14%)]"
                    whileHover={reduce ? undefined : { rotate: -10 }}
                  >
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </motion.span>
                </div>

                <div className="relative mt-6">
                  <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/80">
                    {r.kicker}
                  </div>
                  <h3 className="mt-1.5 font-display text-2xl font-semibold tracking-tight">
                    {r.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    {r.desc}
                  </p>
                </div>

                <div className="relative mt-7 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-white/55">
                  <span>Continue</span>
                  <span className="text-cyan-100/80">{r.id === "training" ? "Open portal" : "Sign in"}</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-[11px] uppercase tracking-[0.22em] text-white/50 sm:flex-row"
        >
          <span>© {new Date().getFullYear()} VisaHOBe</span>
          <span className="flex items-center gap-4">
            <span>Working hours · Sat–Sun off · 9am–5pm Dhaka</span>
          </span>
        </motion.div>
      </div>
    </div>
  );
}
