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
  /** Tailwind gradient for the card face */
  face: string;
  /** Whether face renders dark text */
  light: boolean;
};

const ROLES: Role[] = [
  {
    id: "admin",
    title: "Admin",
    kicker: "Owner / Super Admin",
    desc: "Full control — businesses, employees, revenue, approvals, training & system settings.",
    icon: Shield,
    to: "/auth?role=admin",
    face: "from-[hsl(230_55%_22%)] via-[hsl(235_65%_38%)] to-[hsl(245_70%_60%)]",
    light: false,
  },
  {
    id: "employee",
    title: "Employee",
    kicker: "VisaHOBe Team",
    desc: "Workspace for branding, website, visa, marketing & client-support specialists.",
    icon: Users,
    to: "/auth?role=employee",
    face: "from-[hsl(245_80%_88%)] via-[hsl(235_75%_78%)] to-[hsl(225_70%_70%)]",
    light: true,
  },
  {
    id: "training",
    title: "Training Portal",
    kicker: "Onboarding & Exam",
    desc: "Learn the system, complete modules, pass the 100-mark exam and get certified.",
    icon: GraduationCap,
    to: "/training",
    face: "from-[hsl(340_70%_88%)] via-[hsl(20_80%_84%)] to-[hsl(35_80%_80%)]",
    light: true,
  },
];

export default function Welcome() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Editorial lavender backdrop */}
      <div className="absolute inset-0 -z-10 bg-gradient-hero" />
      <motion.div
        aria-hidden
        animate={reduce ? undefined : { x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-40 top-1/4 -z-10 size-[34rem] rounded-full bg-accent/30 blur-3xl"
      />
      <motion.div
        aria-hidden
        animate={reduce ? undefined : { x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-40 bottom-1/4 -z-10 size-[36rem] rounded-full bg-primary/20 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-8 sm:px-8 sm:py-10">
        {/* top bar */}
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="flex items-center gap-2"
          >
            <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow">
              <Sparkles className="size-4" />
            </div>
            <div className="font-display text-base font-bold tracking-tight text-primary sm:text-lg">
              VisaHOBe
              <span className="text-muted-foreground"> · Business OS</span>
            </div>
          </motion.div>
          <motion.button
            onClick={() => navigate("/auth")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-md transition hover:bg-card hover:text-primary"
          >
            Sign in
          </motion.button>
        </div>

        {/* hero */}
        <div className="mx-auto mt-12 max-w-2xl text-center sm:mt-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-card/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary backdrop-blur"
          >
            <span className="size-1.5 rounded-full bg-accent" />
            Choose your workspace
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease, delay: 0.18 }}
            className="font-display text-[2.2rem] font-bold leading-[1.02] tracking-tight text-primary sm:text-5xl"
          >
            Build, train & grow{" "}
            <span className="text-gradient-blue">any business</span>{" "}
            from one OS.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.3 }}
            className="mx-auto mt-4 max-w-xl text-[13.5px] leading-relaxed text-muted-foreground sm:text-base"
          >
            Pick the door that fits you. Admins run the platform, employees deliver client work, and trainees get certified before going live.
          </motion.p>
        </div>

        {/* role cards — Apple-style photo cards */}
        <div className="mt-10 grid flex-1 items-start gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {ROLES.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.button
                key={r.id}
                onClick={() => navigate(r.to)}
                initial={{ opacity: 0, y: 22, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.55, ease, delay: 0.35 + i * 0.08 }}
                whileHover={reduce ? undefined : { y: -6 }}
                whileTap={reduce ? undefined : { scale: 0.98 }}
                className="group relative overflow-hidden rounded-[1.75rem] border border-border bg-card text-left shadow-premium transition-all"
              >
                {/* Photo face */}
                <div className={`relative h-44 bg-gradient-to-br ${r.face} p-5`}>
                  <div className="absolute -right-10 -top-10 size-44 rounded-full bg-white/25 blur-3xl" />
                  <div className="absolute -bottom-12 -left-8 size-36 rounded-full bg-black/15 blur-2xl" />
                  <div className="relative flex items-start justify-between">
                    <div
                      className={`grid size-12 place-items-center rounded-2xl backdrop-blur-md ring-1 ${
                        r.light
                          ? "bg-white/60 text-primary ring-white/70"
                          : "bg-white/15 text-white ring-white/25"
                      }`}
                    >
                      <Icon className="size-5" strokeWidth={1.8} />
                    </div>
                    <motion.span
                      aria-hidden
                      className={`grid size-9 place-items-center rounded-full ring-1 transition ${
                        r.light
                          ? "bg-white/70 text-primary ring-white/70"
                          : "bg-white/15 text-white ring-white/25"
                      } group-hover:bg-primary group-hover:text-primary-foreground`}
                      whileHover={reduce ? undefined : { rotate: -10 }}
                    >
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </motion.span>
                  </div>

                  <div className="absolute inset-x-5 bottom-4">
                    <div
                      className={`text-[10px] font-bold uppercase tracking-[0.22em] ${
                        r.light ? "text-primary/75" : "text-white/85"
                      }`}
                    >
                      {r.kicker}
                    </div>
                    <h3
                      className={`mt-1 font-display text-2xl font-bold leading-tight tracking-tight ${
                        r.light ? "text-primary" : "text-white"
                      }`}
                    >
                      {r.title}
                    </h3>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <p className="text-[13px] leading-relaxed text-muted-foreground">
                    {r.desc}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[10px] font-semibold uppercase tracking-[0.2em]">
                    <span className="text-muted-foreground">Continue</span>
                    <span className="inline-flex items-center gap-1 text-primary transition group-hover:gap-2">
                      {r.id === "training" ? "Open portal" : "Sign in"}
                      <ArrowRight className="size-3" />
                    </span>
                  </div>
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
          className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:flex-row"
        >
          <span>© {new Date().getFullYear()} VisaHOBe</span>
          <span>Working hours · Sat–Sun off · 9am–5pm Dhaka</span>
        </motion.div>
      </div>
    </div>
  );
}
