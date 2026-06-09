import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Building2, FolderKanban, ListChecks, CalendarDays,
  CheckSquare, BarChart3, Users, ScrollText, Receipt, Settings, LogOut, X,
  Bot, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, AppRole } from "@/context/AuthContext";

type Item = { to: string; label: string; icon: any; roles?: AppRole[] };
type Group = { label: string; items: Item[] };

export const navGroups: Group[] = [
  {
    label: "Workspace",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["super_admin", "employee"] },
      { to: "/clients", label: "Client Businesses", icon: Building2, roles: ["super_admin", "employee"] },
      { to: "/projects", label: "Projects", icon: FolderKanban, roles: ["super_admin", "employee"] },
      { to: "/tasks", label: "Tasks & Workflow", icon: ListChecks, roles: ["super_admin", "employee"] },
      { to: "/calendar", label: "Calendar", icon: CalendarDays },
      { to: "/approvals", label: "Approvals", icon: CheckSquare },
    ],
  },
  {
    label: "Admin",
    items: [
      { to: "/reports", label: "Reports", icon: BarChart3, roles: ["super_admin"] },
      { to: "/team", label: "Team Management", icon: Users, roles: ["super_admin"] },
      { to: "/activity", label: "Activity Logs", icon: ScrollText, roles: ["super_admin", "employee"] },
      { to: "/billing", label: "Billing & Invoice", icon: Receipt, roles: ["super_admin"] },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const { role, fullName, signOut } = useAuth();
  const can = (it: Item) => !it.roles || (role && it.roles.includes(role));

  return (
    <aside
      className="relative flex h-full w-72 flex-col overflow-hidden border-r border-sidebar-border text-sidebar-foreground"
      style={{
        backgroundImage: "var(--gradient-sidebar)",
        color: "hsl(0 0% 100%)",
      }}
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-gradient-blue text-primary-foreground shadow-glow">
            <span className="font-display text-base font-bold">V</span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-bold tracking-tight text-white">VisaHOBe</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">Business OS</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-md p-1.5 text-white/80 hover:bg-white/10 lg:hidden">
            <X className="size-4" />
          </button>
        )}
      </div>

      <nav className="scrollbar-thin relative mt-2 flex-1 overflow-y-auto px-3 pb-6">
        {navGroups.map((group) => {
          const items = group.items.filter(can);
          if (!items.length) return null;
          return (
            <div key={group.label} className="mb-5">
              <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                {group.label}
              </div>
              <ul className="space-y-0.5">
                {items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === "/"}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200",
                          isActive
                            ? "bg-white/15 text-white font-semibold shadow-[inset_2px_0_0_0_hsl(var(--accent))] backdrop-blur"
                            : "text-white/85 hover:translate-x-0.5 hover:bg-white/10 hover:text-white"
                        )
                      }
                    >
                      <item.icon className="size-4 shrink-0 opacity-95" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        <div className="mb-5 px-1">
          <NavLink
            to="/ai-agents"
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-r from-[#003B73] via-[#177BBB] to-[#E63946] p-3 text-white shadow-lg shadow-black/20 transition-all duration-300",
                isActive
                  ? "ring-2 ring-white/40 shadow-[0_0_20px_rgba(23,123,187,0.35)] scale-[1.02]"
                  : "hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(23,123,187,0.3)] hover:border-white/30"
              )
            }
          >
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
              <Bot className="size-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold tracking-tight text-white">VisaHOBe Agent</div>
              <div className="text-[10px] font-medium text-white/80 truncate">AI-powered visa assistant</div>
            </div>
            <Sparkles className="size-4 shrink-0 text-white/60 animate-pulse" />
          </NavLink>
        </div>
      </nav>


      <div className="mx-3 mb-4 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-full bg-white/20 text-white text-xs font-semibold ring-1 ring-white/30">
            {(fullName || "VH").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">{fullName || "VisaHOBe Admin"}</div>
            <div className="truncate text-xs capitalize text-white/70">
              {role ? role.replace("_", " ") : "Guest"}
            </div>
          </div>
          <button onClick={signOut} className="rounded-lg p-1.5 text-white/80 hover:bg-white/15 hover:text-white">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
