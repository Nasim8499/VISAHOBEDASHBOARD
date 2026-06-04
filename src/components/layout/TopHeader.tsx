import {
  Bell, HelpCircle, Mail, Menu, Search, Check, Sparkles,
  Settings, LogOut, User, MessageSquare, FileText, Calendar,
  CheckCircle2, ExternalLink, Command, BookOpen, LifeBuoy, Send,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useAuth } from "@/context/AuthContext";
import { assertWorkspaceField } from "@/utils/logger";
import { toast } from "sonner";

const DEFAULT_COLOR = "#003B73";
const DEFAULT_LOGO = "🏢";

type PanelKey = "ws" | "mail" | "bell" | "help" | "user" | null;

export function TopHeader({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const navigate = useNavigate();
  const { workspace, setWorkspaceId, all } = useWorkspace();
  const { signOut, fullName, user } = useAuth() as any;
  const [open, setOpen] = useState<PanelKey>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  assertWorkspaceField("TopHeader", workspace as any, ["color", "logo", "name"]);
  const wsColor = workspace?.color || DEFAULT_COLOR;
  const wsLogo = workspace?.logo || DEFAULT_LOGO;
  const wsName = workspace?.name || "No workspace";
  const wsId = workspace?.id;

  // Close on outside click / Esc
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const toggle = (k: PanelKey) => setOpen((o) => (o === k ? null : k));
  const go = (path: string) => { setOpen(null); navigate(path); };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/75 px-4 backdrop-blur-xl lg:px-8">
      <button
        onClick={onOpenSidebar}
        className="grid size-9 place-items-center rounded-xl border border-border bg-card text-foreground transition hover:-translate-y-0.5 hover:shadow-elegant lg:hidden"
      >
        <Menu className="size-4" />
      </button>

      <div className="relative" ref={wrapRef}>
        {/* Workspace picker */}
        <button
          onClick={() => toggle("ws")}
          className="group flex items-center gap-2.5 rounded-2xl border border-border bg-card px-2.5 py-1.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-elegant"
        >
          <div
            className="relative grid size-9 place-items-center rounded-xl text-white text-sm font-semibold shadow-elegant"
            style={{ background: `linear-gradient(135deg, ${wsColor}, ${wsColor}cc)` }}
          >
            {wsLogo}
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-success ring-2 ring-card" />
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Workspace</div>
            <div className="text-sm font-bold">{wsName}</div>
          </div>
          <svg className="ml-1 size-3.5 text-muted-foreground transition group-hover:translate-y-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 8l5 5 5-5H5z" />
          </svg>
        </button>

        {open === "ws" && (
          <Panel className="left-0 w-80">
            <PanelHeader title="Client Workspaces" subtitle={`${all.length} businesses`} />
            <div className="max-h-80 space-y-0.5 overflow-y-auto p-1.5">
              {all.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { setWorkspaceId(b.id); setOpen(null); }}
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition hover:bg-muted"
                >
                  <span
                    className="grid size-10 place-items-center rounded-xl text-white shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${b.color || DEFAULT_COLOR}, ${b.color || DEFAULT_COLOR}cc)` }}
                  >
                    {b.logo || DEFAULT_LOGO}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block truncate text-sm font-bold">{b.name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {b.category} · {b.city}
                    </span>
                  </span>
                  {b.id === wsId && (
                    <span className="grid size-5 place-items-center rounded-full bg-accent/15">
                      <Check className="size-3 text-accent" />
                    </span>
                  )}
                </button>
              ))}
            </div>
            <PanelFooter>
              <button onClick={() => go("/clients/new")} className="w-full rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition hover:bg-accent hover:text-accent-foreground">
                + New Workspace
              </button>
            </PanelFooter>
          </Panel>
        )}
      </div>

      {/* Search */}
      <div className="relative ml-2 hidden flex-1 max-w-xl md:block">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const v = (e.target as HTMLInputElement).value.trim();
              if (v) toast.success(`Searching "${v}"…`);
            }
          }}
          className="h-10 w-full rounded-2xl border border-border bg-card pl-10 pr-16 text-sm outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
          placeholder="Search businesses, files, tasks…"
        />
        <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground lg:inline-flex">
          <Command className="size-2.5" /> K
        </kbd>
      </div>

      {/* Right side actions */}
      <div className="relative ml-auto flex items-center gap-1" ref={wrapRef as any}>
        {/* Mail */}
        <IconBtn label="Inbox" active={open === "mail"} dot onClick={() => toggle("mail")}>
          <Mail className="size-4" />
        </IconBtn>
        {open === "mail" && (
          <Panel className="right-0 top-12 w-80">
            <PanelHeader title="Inbox" subtitle="3 unread messages" icon={Mail} />
            <ul className="max-h-72 space-y-0.5 overflow-y-auto p-1.5">
              {[
                { who: "Rohit (SpiceBite)", msg: "Loving the new logo direction!", t: "2m", c: "bg-accent" },
                { who: "Aaliyah (GlowBeauty)", msg: "Can we tweak the banner copy?", t: "1h", c: "bg-warning" },
                { who: "Daniel (Elite Travel)", msg: "Approved the social kit ✅", t: "3h", c: "bg-success" },
              ].map((n, i) => (
                <button key={i} onClick={() => go("/chat")} className="flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition hover:bg-muted">
                  <span className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${n.c}`}>{n.who[0]}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-bold">{n.who}</span>
                      <span className="text-[10px] text-muted-foreground">{n.t}</span>
                    </div>
                    <p className="truncate text-[11px] text-muted-foreground">{n.msg}</p>
                  </div>
                </button>
              ))}
            </ul>
            <PanelFooter>
              <button onClick={() => go("/chat")} className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition hover:bg-accent hover:text-accent-foreground">
                Open all chats <ExternalLink className="size-3" />
              </button>
            </PanelFooter>
          </Panel>
        )}

        {/* Notifications */}
        <IconBtn label="Notifications" active={open === "bell"} dot onClick={() => toggle("bell")}>
          <Bell className="size-4" />
        </IconBtn>
        {open === "bell" && (
          <Panel className="right-0 top-12 w-80">
            <PanelHeader title="Notifications" subtitle="Today" icon={Bell} />
            <ul className="max-h-72 space-y-0.5 overflow-y-auto p-1.5">
              {[
                { icon: CheckCircle2, c: "text-success bg-success/10", title: "Task approved", desc: "SpiceBite logo set marked done", t: "5m", to: "/approvals" },
                { icon: Calendar,     c: "text-accent bg-accent/15",   title: "Meeting in 30m", desc: "Brand Review · SpiceBite", t: "30m", to: "/meetings" },
                { icon: FileText,     c: "text-warning bg-warning/15", title: "Invoice generated", desc: "GlowBeauty · $1,240 due Fri", t: "1h", to: "/billing" },
                { icon: MessageSquare,c: "text-primary bg-primary/10", title: "New comment", desc: "Aaliyah replied on banner copy", t: "2h", to: "/chat" },
              ].map((n, i) => (
                <button key={i} onClick={() => go(n.to)} className="flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition hover:bg-muted">
                  <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${n.c}`}>
                    <n.icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-bold">{n.title}</span>
                      <span className="text-[10px] text-muted-foreground">{n.t}</span>
                    </div>
                    <p className="truncate text-[11px] text-muted-foreground">{n.desc}</p>
                  </div>
                </button>
              ))}
            </ul>
            <PanelFooter>
              <button onClick={() => { setOpen(null); toast.success("All notifications marked as read"); }} className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold transition hover:bg-muted">
                Mark all as read
              </button>
            </PanelFooter>
          </Panel>
        )}

        {/* Help */}
        <IconBtn label="Help" active={open === "help"} onClick={() => toggle("help")}>
          <HelpCircle className="size-4" />
        </IconBtn>
        {open === "help" && (
          <Panel className="right-0 top-12 w-72">
            <PanelHeader title="Help & Support" icon={LifeBuoy} />
            <div className="space-y-0.5 p-1.5">
              {[
                { icon: BookOpen,     label: "Documentation",   hint: "Guides & tutorials", action: () => { setOpen(null); toast.info("Opening docs…"); } },
                { icon: MessageSquare,label: "Live chat",       hint: "Talk to our team",   action: () => go("/chat") },
                { icon: Send,         label: "Send feedback",   hint: "Help us improve",    action: () => { setOpen(null); toast.success("Feedback channel opened"); } },
                { icon: Sparkles,     label: "What's new",      hint: "Recent updates",     action: () => { setOpen(null); toast.info("v2.4 — premium UI refresh"); } },
              ].map((item, i) => (
                <button key={i} onClick={item.action} className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition hover:bg-muted">
                  <span className="grid size-9 place-items-center rounded-xl bg-muted text-foreground">
                    <item.icon className="size-4" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-xs font-bold">{item.label}</span>
                    <span className="block text-[10px] text-muted-foreground">{item.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </Panel>
        )}

        {/* User avatar */}
        <button
          onClick={() => toggle("user")}
          className="ml-2 grid size-9 place-items-center rounded-full bg-gradient-to-br from-[hsl(230_55%_18%)] to-[hsl(235_75%_55%)] text-xs font-bold text-white shadow-elegant transition hover:-translate-y-0.5 hover:shadow-glow"
          aria-label="Account"
        >
          VH
        </button>
        {open === "user" && (
          <Panel className="right-0 top-12 w-64">
            <div className="flex items-center gap-3 border-b border-border p-3.5">
              <div className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-[hsl(230_55%_18%)] to-[hsl(235_75%_55%)] text-sm font-bold text-white">
                VH
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">{profile?.full_name || "Super Admin"}</div>
                <div className="truncate text-[11px] text-muted-foreground">{profile?.username || "admin"}@visahobe</div>
              </div>
            </div>
            <div className="space-y-0.5 p-1.5">
              {[
                { icon: User,     label: "Profile",  action: () => go("/settings") },
                { icon: Settings, label: "Settings", action: () => go("/settings") },
                { icon: FileText, label: "Activity log", action: () => go("/activity-logs") },
              ].map((item, i) => (
                <button key={i} onClick={item.action} className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm transition hover:bg-muted">
                  <item.icon className="size-4 text-muted-foreground" />
                  {item.label}
                </button>
              ))}
            </div>
            <div className="border-t border-border p-1.5">
              <button
                onClick={async () => { setOpen(null); try { await signOut?.(); toast.success("Signed out"); navigate("/auth"); } catch { toast.error("Sign out failed"); } }}
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm font-semibold text-destructive transition hover:bg-destructive/10"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </div>
          </Panel>
        )}
      </div>
    </header>
  );
}

/* ============ helpers ============ */

function IconBtn({
  children, onClick, label, active, dot,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
  dot?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`relative grid size-9 place-items-center rounded-xl border transition ${
        active
          ? "border-accent/40 bg-accent/10 text-accent shadow-elegant"
          : "border-transparent text-muted-foreground hover:-translate-y-0.5 hover:border-border hover:bg-card hover:text-foreground"
      }`}
    >
      {children}
      {dot && (
        <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-gradient-to-br from-[hsl(20_85%_60%)] to-[hsl(340_75%_60%)] ring-2 ring-background" />
      )}
    </button>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`absolute z-50 mt-2 animate-scale-in overflow-hidden rounded-2xl border border-border bg-popover shadow-premium ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

function PanelHeader({
  title, subtitle, icon: Icon,
}: { title: string; subtitle?: string; icon?: any }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-border bg-gradient-to-br from-card to-muted/50 px-4 py-3">
      {Icon && (
        <span className="grid size-8 place-items-center rounded-xl bg-accent/15 text-accent">
          <Icon className="size-4" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold">{title}</div>
        {subtitle && <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{subtitle}</div>}
      </div>
    </div>
  );
}

function PanelFooter({ children }: { children: React.ReactNode }) {
  return <div className="border-t border-border bg-muted/30 p-2">{children}</div>;
}
