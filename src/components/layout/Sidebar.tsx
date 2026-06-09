import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Building2, FolderKanban, ListChecks, CalendarDays,
  CheckSquare, BarChart3, Users, ScrollText, Receipt, Settings, LogOut, X,
  Bot, Sparkles, Cpu, Brain, Zap, Flame, Wind,
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

const agents = [
  { id: "openai",  name: "OpenAI",  icon: Sparkles, gradient: "from-[#003B73] to-[#177BBB]" },
  { id: "qwen",    name: "Qwen",    icon: Cpu,      gradient: "from-[#E63946] to-[#F1573D]" },
  { id: "gemini",  name: "Gemini",  icon: Brain,    gradient: "from-[#177BBB] to-[#003B73]" },
  { id: "grok",    name: "Grok",    icon: Zap,      gradient: "from-[#F1573D] to-[#E63946]" },
  { id: "minimax", name: "MiniMax", icon: Flame,    gradient: "from-[#003B73] to-[#E63946]" },
  { id: "kimi",    name: "Kimi",    icon: Wind,     gradient: "from-[#177BBB] to-[#F1573D]" },
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
