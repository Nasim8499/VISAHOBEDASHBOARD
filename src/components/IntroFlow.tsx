import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Building2, Sparkles, Rocket } from "lucide-react";

type Slide = {
  kicker: string;
  title: string;
  body: string;
  icon: typeof Rocket;
};

const SLIDES: Slide[] = [
  {
    kicker: "Welcome",
    title: "VisaHOBe Business OS",
    body: "One command center for clients, brands, documents and operations — built for agencies that move fast.",
    icon: Sparkles,
  },
  {
    kicker: "Workspaces",
    title: "Every client, organized",
    body: "Spin up branded workspaces with projects, tasks, approvals and a private portal in a few clicks.",
    icon: Building2,
  },
  {
    kicker: "Ready",
    title: "Let's get to work",
    body: "Jump into your dashboard and start shipping. You can always revisit this tour from settings.",
    icon: Rocket,
  },
];

export default function IntroFlow({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  const slide = SLIDES[i];
  const Icon = slide.icon;
  const last = i === SLIDES.length - 1;

  const next = () => (last ? onDone() : setI(i + 1));

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45, ease: [0.65, 0, 0.35, 1] } }}
      className="fixed inset-0 z-[100] grid place-items-center overflow-hidden text-white"
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
        className="pointer-events-none absolute -left-32 top-1/4 size-[30rem] rounded-full bg-cyan-300/10 blur-3xl"
      />
      <motion.div
        aria-hidden
        animate={reduce ? undefined : { x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-32 bottom-1/4 size-[32rem] rounded-full bg-teal-300/10 blur-3xl"
      />

      {/* skip */}
      <button
        onClick={onDone}
        className="absolute right-5 top-5 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-white/80 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
      >
        Skip
      </button>

      <div className="relative z-10 w-full max-w-xl px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-8 grid size-24 place-items-center rounded-[28px] bg-white/10 ring-1 ring-white/25 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)]">
              <Icon className="size-10" strokeWidth={1.6} />
            </div>

            <div className="mb-3 text-[11px] uppercase tracking-[0.32em] text-cyan-200/90">
              {slide.kicker}
            </div>
            <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {slide.title}
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
              {slide.body}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* dots */}
        <div className="mt-10 flex items-center justify-center gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className="group h-1.5 overflow-hidden rounded-full bg-white/20 transition-all"
              style={{ width: idx === i ? 32 : 14 }}
            >
              <motion.span
                initial={false}
                animate={{ opacity: idx === i ? 1 : 0 }}
                className="block h-full w-full bg-gradient-to-r from-cyan-300 to-teal-200"
              />
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 flex justify-center">
          <motion.button
            onClick={next}
            whileHover={reduce ? undefined : { scale: 1.03 }}
            whileTap={reduce ? undefined : { scale: 0.97 }}
            className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-[hsl(212_60%_14%)] shadow-[0_20px_60px_-15px_rgba(92,189,185,0.7)] transition hover:bg-cyan-50"
          >
            {last ? "Enter dashboard" : "Next"}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
