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
        <div className="relative rounded-[28px] border border-border/60 bg-card/85 px-2 py-2 shadow-premium backdrop-blur-xl">
          <ul className="relative grid grid-cols-5">
            {items.map((it, i) => {
              const isActive = i === activeIndex;
              return (
                <li key={it.to} className="relative">
                  <NavLink
                    to={it.to}
                    end={it.to === "/"}
                    className="flex flex-col items-center gap-1 py-1.5 text-[10.5px] font-medium tracking-tight"
                  >
                    <motion.span
                      whileTap={{ scale: 0.82 }}
                      transition={{ type: "spring", stiffness: 500, damping: 22 }}
                      className="relative grid size-11 place-items-center"
                    >
                      {isActive && (
                        <motion.span
                          layoutId="bn-pill"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          className="absolute inset-0 rounded-2xl bg-gradient-blue shadow-glow"
                        />
                      )}
                      <it.icon
                        className={cn(
                          "relative size-[18px] transition-colors",
                          isActive ? "text-primary-foreground" : "text-muted-foreground"
                        )}
                        strokeWidth={isActive ? 2.4 : 1.9}
                      />
                    </motion.span>
                    <span
                      className={cn(
                        "transition-colors",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {it.label}
                    </span>
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
