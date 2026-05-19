import { motion, useReducedMotion } from "framer-motion";

export default function SplashScreen() {
  const reduce = useReducedMotion();
  const letters = "VisaHOBe".split("");

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.65, 0, 0.35, 1] } }}
      className="fixed inset-0 z-[100] grid place-items-center bg-gradient-hero text-white"
    >
      {/* ambient glow */}
      <div className="pointer-events-none absolute -left-32 top-1/3 size-[28rem] rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 size-[28rem] rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex flex-col items-center">
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.78, filter: "blur(14px)" }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="grid size-24 place-items-center rounded-[28px] bg-white/15 backdrop-blur-xl ring-1 ring-white/30 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]"
        >
          <span className="font-display text-4xl font-bold tracking-tight">V</span>
        </motion.div>

        <div className="mt-8 flex overflow-hidden">
          {letters.map((c, i) => (
            <motion.span
              key={i}
              initial={reduce ? { opacity: 0 } : { y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.25 + i * 0.045,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="font-display text-3xl font-semibold tracking-tight"
            >
              {c}
            </motion.span>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-3 text-[11px] uppercase tracking-[0.3em] text-white/80"
        >
          Business OS
        </motion.div>

        {/* shimmer sweep */}
        {!reduce && (
          <motion.div
            initial={{ x: "-120%" }}
            animate={{ x: "120%" }}
            transition={{ delay: 0.4, duration: 1.4, ease: "easeInOut" }}
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent"
          />
        )}
      </div>
    </motion.div>
  );
}
