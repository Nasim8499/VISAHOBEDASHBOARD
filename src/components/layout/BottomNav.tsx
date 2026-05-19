import { NavLink } from "react-router-dom";
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
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden">
      <ul className="grid grid-cols-5">
        {items.map((it) => (
          <li key={it.to}>
            <NavLink
              to={it.to}
              end={it.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "grid size-9 place-items-center rounded-xl transition",
                      isActive && "bg-gradient-blue text-white shadow-glow"
                    )}
                  >
                    <it.icon className="size-4" />
                  </span>
                  {it.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
