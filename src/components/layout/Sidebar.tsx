import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Building2, FolderKanban, ListChecks, CalendarDays,
  CheckSquare, Palette, Wand2, Globe2, ImageIcon, LayoutTemplate, Package,
  FileText, MessageSquare, Video, FolderOpen, Workflow, Sparkles, BarChart3,
  Users, ScrollText, Receipt, Settings, LogOut, X,
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
    label: "Brand Studio",
    items: [
      { to: "/brand-builder", label: "Brand Builder", icon: Palette, roles: ["super_admin", "employee"] },
      { to: "/logo-maker", label: "Logo Maker", icon: Wand2, roles: ["super_admin", "employee"] },
      { to: "/website-builder", label: "Website Builder", icon: Globe2, roles: ["super_admin", "employee"] },
      { to: "/post-designer", label: "Post Designer", icon: ImageIcon, roles: ["super_admin", "employee"] },
      { to: "/templates", label: "Templates", icon: LayoutTemplate, roles: ["super_admin", "employee"] },
      { to: "/brand-kit", label: "Brand Kit", icon: Package },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/documents", label: "Documents", icon: FileText },
      { to: "/chat", label: "Live Chat", icon: MessageSquare },
      { to: "/meetings", label: "Meetings", icon: Video },
      { to: "/files", label: "File Manager", icon: FolderOpen },
      { to: "/automation", label: "Automation", icon: Workflow, roles: ["super_admin", "employee"] },
      { to: "/ai", label: "AI Assistant", icon: Sparkles, roles: ["super_admin", "employee"] },
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
    <aside className="flex h-full w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-gradient-blue text-primary-foreground shadow-glow">
            <span className="font-display text-base font-bold">V</span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-bold tracking-tight text-sidebar-primary">VisaHOBe</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/60">Business OS</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent lg:hidden">
            <X className="size-4" />
          </button>
        )}
      </div>

      <nav className="scrollbar-thin mt-2 flex-1 overflow-y-auto px-3 pb-6">
        {navGroups.map((group) => {
          const items = group.items.filter(can);
          if (!items.length) return null;
          return (
            <div key={group.label} className="mb-5">
              <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/55">
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
                            ? "bg-sidebar-accent text-sidebar-primary font-semibold shadow-[inset_2px_0_0_0_hsl(var(--accent))]"
                            : "text-sidebar-foreground/80 hover:translate-x-0.5 hover:bg-sidebar-accent/70 hover:text-sidebar-primary"
                        )
                      }
                    >
                      <item.icon className="size-4 shrink-0 opacity-90" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="mx-3 mb-4 rounded-2xl border border-sidebar-border bg-sidebar-accent/60 p-3">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-full bg-gradient-blue text-primary-foreground text-xs font-semibold">
            {(fullName || "VH").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-sidebar-primary">{fullName || "VisaHOBe Admin"}</div>
            <div className="truncate text-xs capitalize text-sidebar-foreground/70">
              {role ? role.replace("_", " ") : "Guest"}
            </div>
          </div>
          <button onClick={signOut} className="rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-primary">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
