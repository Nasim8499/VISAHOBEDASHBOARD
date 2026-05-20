import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, GraduationCap, BookOpen, FileCheck2, Award } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const PHASES = [
  { icon: BookOpen, title: "Modules", desc: "Company intro, dashboard, visa, branding, communication & policies." },
  { icon: FileCheck2, title: "100-Mark Exam", desc: "MCQ + scenarios. Pass mark 60–65 to unlock employee dashboard." },
  { icon: Award, title: "Certification", desc: "Auto-generated certificate, joining letter & employee ID after admin approval." },
];

export default function Training() {
  return (
    <div
      className="relative min-h-screen overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(120% 80% at 20% 10%, hsl(193 56% 40% / 0.5) 0%, transparent 60%), radial-gradient(120% 80% at 85% 90%, hsl(178 38% 55% / 0.4) 0%, transparent 55%), linear-gradient(135deg, hsl(212 60% 14%) 0%, hsl(204 58% 26%) 60%, hsl(186 50% 40%) 100%)",
      }}
    >
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-10">
        <Link
          to="/welcome"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-white/80 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-3.5" /> Back
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease }}
          className="mt-16 text-center"
        >
          <div className="mx-auto mb-6 grid size-20 place-items-center rounded-3xl bg-white/10 ring-1 ring-white/25 backdrop-blur-xl">
            <GraduationCap className="size-9" strokeWidth={1.6} />
          </div>
          <div className="mb-2 text-[11px] uppercase tracking-[0.32em] text-cyan-200/90">Training Portal</div>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Get certified before you go live.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            The full LMS — modules, lessons, quizzes, the 100-mark exam, certificate generation and admin approval — is being rolled out next. Here's the shape.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {PHASES.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: 0.2 + i * 0.08 }}
                className="rounded-2xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-xl"
              >
                <div className="grid size-11 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <Icon className="size-5" strokeWidth={1.7} />
                </div>
                <div className="mt-4 font-display text-lg font-semibold">{p.title}</div>
                <p className="mt-1 text-sm leading-relaxed text-white/70">{p.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 rounded-2xl border border-dashed border-white/20 bg-white/[0.04] p-6 text-center text-sm text-white/70 backdrop-blur-md"
        >
          Coming next: lesson player, progress tracking, exam engine, admin approval queue & certificate generator.
        </motion.div>
      </div>
    </div>
  );
}
