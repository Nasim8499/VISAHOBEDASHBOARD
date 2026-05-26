import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  FileCheck2,
  Award,
  PlayCircle,
  Clock,
  Flame,
  ChevronRight,
  Sparkles,
  Trophy,
} from "lucide-react";
import { PhotoCard } from "@/components/ui/photo-card";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

const COURSES = [
  {
    eyebrow: "Module 01",
    title: "Company DNA & Brand Voice",
    description: "Who we are, how we speak to clients, and the rituals that shape every deliverable.",
    minutes: 42,
    lessons: 8,
    progress: 100,
    tone: "navy" as const,
    badge: "Completed",
  },
  {
    eyebrow: "Module 02",
    title: "The VisaHOBe Operating System",
    description: "Master the dashboard, workspaces, automations, and how a project flows end-to-end.",
    minutes: 65,
    lessons: 12,
    progress: 72,
    tone: "lavender" as const,
    badge: "In progress",
  },
  {
    eyebrow: "Module 03",
    title: "Visa, Documentation & Compliance",
    description: "Country playbooks, document standards, edge cases, and how to brief a client cleanly.",
    minutes: 88,
    lessons: 14,
    progress: 28,
    tone: "blush" as const,
    badge: "New",
  },
  {
    eyebrow: "Module 04",
    title: "Brand Builder Studio Craft",
    description: "Hands-on with logo, post and website builders. Editorial taste, not templated output.",
    minutes: 54,
    lessons: 10,
    progress: 0,
    tone: "sand" as const,
    badge: "Locked",
  },
];

const PHASES = [
  { icon: BookOpen, title: "Learn", desc: "Lessons, video walkthroughs and interactive checkpoints." },
  { icon: FileCheck2, title: "100-mark Exam", desc: "MCQ + scenarios. Pass mark 60 to unlock the dashboard." },
  { icon: Award, title: "Certify", desc: "Auto-generated certificate, joining letter & employee ID." },
];

export default function Training() {
  const overall = Math.round(
    COURSES.reduce((s, c) => s + c.progress, 0) / COURSES.length
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Editorial hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-hero" />
        <div className="absolute -left-24 top-10 -z-10 size-72 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute -right-32 -top-10 -z-10 size-96 rounded-full bg-primary/20 blur-3xl" />

        <div className="mx-auto max-w-5xl px-5 pt-8 sm:px-8 sm:pt-12">
          <Link
            to="/welcome"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-md transition hover:bg-card hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Back
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease }}
            className="mt-8 sm:mt-12"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-card/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary backdrop-blur">
              <Sparkles className="size-3" /> Training Portal · Mobile LMS
            </div>
            <h1 className="font-display text-[2.4rem] font-bold leading-[1.02] tracking-tight text-primary sm:text-6xl">
              Get certified <br className="hidden sm:block" />
              <span className="text-gradient-blue">before you go live.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              A guided path through company culture, the operating system and the studio crafts —
              built for phone, perfected for focus.
            </p>
          </motion.div>

          {/* Hero progress card */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.2 }}
            className="mt-8 grid gap-4 sm:grid-cols-[1.4fr_1fr]"
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-premium sm:p-8">
              <div className="absolute -right-10 -top-10 size-44 rounded-full bg-accent/20 blur-2xl" />
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Your journey
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-warning/15 px-2.5 py-1 text-[11px] font-semibold text-warning">
                  <Flame className="size-3" /> 5-day streak
                </div>
              </div>
              <div className="mt-4 flex items-end gap-3">
                <div className="font-display text-6xl font-bold tracking-tight text-primary">
                  {overall}
                  <span className="text-xl text-muted-foreground">%</span>
                </div>
                <div className="pb-2 text-sm text-muted-foreground">
                  Across {COURSES.length} modules
                </div>
              </div>
              <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overall}%` }}
                  transition={{ duration: 1.1, ease, delay: 0.4 }}
                  className="h-full rounded-full bg-gradient-blue"
                />
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" /> ~4h remaining
                </span>
                <span className="size-1 rounded-full bg-border" />
                <span>Next lesson in 2 min</span>
              </div>
              <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:-translate-y-0.5 active:scale-[0.98]">
                <PlayCircle className="size-4" /> Resume Module 02
              </button>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-elegant">
                <div className="grid size-11 place-items-center rounded-xl bg-accent/20 text-primary">
                  <Trophy className="size-5" strokeWidth={1.8} />
                </div>
                <div className="mt-3 font-display text-2xl font-bold text-primary">62 / 100</div>
                <div className="text-xs text-muted-foreground">Mock exam best score</div>
              </div>
              <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-elegant">
                <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="size-5" strokeWidth={1.8} />
                </div>
                <div className="mt-3 font-display text-2xl font-bold text-primary">14</div>
                <div className="text-xs text-muted-foreground">Lessons completed this week</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Course library */}
      <section className="mx-auto max-w-5xl px-5 pt-12 sm:px-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Curriculum
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl">
              Modules tailored for you
            </h2>
          </div>
          <button className="hidden items-center gap-1 text-sm font-semibold text-primary sm:inline-flex">
            View all <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {COURSES.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease, delay: 0.08 * i }}
            >
              <PhotoCard
                eyebrow={c.eyebrow}
                title={c.title}
                description={c.description}
                tone={c.tone}
                badge={c.badge}
                aspect="video"
                onClick={() => {}}
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <PlayCircle className="size-3.5" /> {c.lessons} lessons
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5" /> {c.minutes} min
                  </span>
                </div>
                <div className="mt-1">
                  <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-primary">{c.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-[width] duration-700",
                        c.progress === 100 ? "bg-success" : "bg-gradient-blue"
                      )}
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                </div>
              </PhotoCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Phases */}
      <section className="mx-auto max-w-5xl px-5 pt-14 sm:px-8">
        <div className="mb-5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            How certification works
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            Three calm steps to go live
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {PHASES.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: 0.15 + i * 0.08 }}
                className="group relative overflow-hidden rounded-[1.5rem] border border-border bg-card p-6 shadow-elegant transition hover:-translate-y-1 hover:shadow-premium"
              >
                <div className="absolute right-4 top-4 font-display text-5xl font-bold text-muted/40">
                  0{i + 1}
                </div>
                <div className="grid size-12 place-items-center rounded-2xl bg-accent/20 text-primary">
                  <Icon className="size-5" strokeWidth={1.8} />
                </div>
                <div className="mt-4 font-display text-lg font-bold tracking-tight text-primary">
                  {p.title}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 rounded-[1.75rem] border border-dashed border-accent/50 bg-card/70 p-6 text-center text-sm text-muted-foreground backdrop-blur">
          Coming next — interactive lesson player, exam engine, admin approval queue & certificate generator.
        </div>
      </section>
    </div>
  );
}
