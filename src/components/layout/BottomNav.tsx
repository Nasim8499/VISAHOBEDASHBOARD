import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Building2, ListChecks, MessageSquare, Grid3x3 } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/clients", label: "Clients", icon: Building2 },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/more", label: "More", icon: Grid3x3 },
];

export function BottomNav() {
  const location = useLocation();
  const activeIndex = items.findIndex((it) =>
    it.to === "/" ? location.pathname === "/" : location.pathname.startsWith(it.to)
  );

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto mb-2 max-w-md px-3">
        <div className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/80 px-2 py-2 shadow-premium backdrop-blur-2xl">
          {/* Ambient glow that tracks the active tab */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-6 h-16 w-16 rounded-full bg-gradient-blue opacity-25 blur-2xl"
            animate={{
              left: `calc(${(activeIndex + 0.5) * (100 / items.length)}% - 2rem)`,
            }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          />
          <ul className="relative grid grid-cols-5">
            {items.map((it, i) => {
              const isActive = i === activeIndex;
              return (
                <li key={it.to} className="relative">
                  <NavLink
                    to={it.to}
                    end={it.to === "/"}
                    className="flex flex-col items-center gap-1 py-1.5 text-[10.5px] font-medium tracking-tight outline-none"
                  >
                    <motion.span
                      whileTap={{ scale: 0.78 }}
                      transition={{ type: "spring", stiffness: 520, damping: 20 }}
                      className="relative grid size-11 place-items-center"
                    >
                      {isActive && (
                        <motion.span
                          layoutId="bn-pill"
                          transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.7 }}
                          className="absolute inset-0 rounded-2xl bg-gradient-blue shadow-glow"
                        />
                      )}
                      <motion.span
                        animate={{ scale: isActive ? 1.08 : 1, y: isActive ? -1 : 0 }}
                        transition={{ type: "spring", stiffness: 420, damping: 24 }}
                        className="relative grid place-items-center"
                      >
                        <it.icon
                          className={cn(
                            "size-[18px] transition-colors duration-300",
                            isActive ? "text-primary-foreground" : "text-muted-foreground"
                          )}
                          strokeWidth={isActive ? 2.4 : 1.9}
                        />
                      </motion.span>
                    </motion.span>
                    <motion.span
                      animate={{
                        opacity: isActive ? 1 : 0.7,
                        y: isActive ? 0 : 1,
                      }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className={cn(
                        "transition-colors",
                        isActive ? "text-foreground font-semibold" : "text-muted-foreground"
                      )}
                    >
                      {it.label}
                    </motion.span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
