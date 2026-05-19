import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  ListChecks,
  CalendarDays,
  CheckSquare,
  Palette,
  Wand2,
  Globe2,
  ImageIcon,
  LayoutTemplate,
  Package,
  FileText,
  MessageSquare,
  Video,
  FolderOpen,
  Workflow,
  Sparkles,
  BarChart3,
  Users,
  ScrollText,
  Receipt,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const navGroups = [
  {
    label: "Workspace",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/clients", label: "Client Businesses", icon: Building2 },
      { to: "/projects", label: "Projects", icon: FolderKanban },
      { to: "/tasks", label: "Tasks & Workflow", icon: ListChecks },
      { to: "/calendar", label: "Calendar", icon: CalendarDays },
      { to: "/approvals", label: "Approvals", icon: CheckSquare },
    ],
  },
  {
    label: "Brand Studio",
    items: [
      { to: "/brand-builder", label: "Brand Builder", icon: Palette },
      { to: "/logo-maker", label: "Logo Maker", icon: Wand2 },
      { to: "/website-builder", label: "Website Builder", icon: Globe2 },
      { to: "/post-designer", label: "Post Designer", icon: ImageIcon },
      { to: "/templates", label: "Templates", icon: LayoutTemplate },
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
      { to: "/automation", label: "Automation", icon: Workflow },
      { to: "/ai", label: "AI Assistant", icon: Sparkles },
    ],
  },
  {
    label: "Admin",
    items: [
      { to: "/reports", label: "Reports", icon: BarChart3 },
      { to: "/team", label: "Team Management", icon: Users },
      { to: "/activity", label: "Activity Logs", icon: ScrollText },
      { to: "/billing", label: "Billing & Invoice", icon: Receipt },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  return (
    <aside className="flex h-full w-72 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-gradient-blue text-white shadow-glow">
            <span className="font-display text-base font-bold">V</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">VisaHOBe</div>
            <div className="text-[11px] uppercase tracking-wider text-sidebar-foreground/70">
              Business OS
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent lg:hidden"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <nav className="scrollbar-thin mt-2 flex-1 overflow-y-auto px-3 pb-6">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/50">
              {group.label}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-gradient-to-r from-accent/25 to-transparent text-white shadow-[inset_2px_0_0_0_hsl(var(--accent))]"
                          : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-white"
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
        ))}
      </nav>

      <div className="mx-3 mb-4 rounded-xl bg-sidebar-accent/60 p-3">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-full bg-gradient-red text-white text-xs font-semibold">
            VH
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-white">VisaHOBe Admin</div>
            <div className="truncate text-xs text-sidebar-foreground/70">Super Admin</div>
          </div>
          <button className="rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
