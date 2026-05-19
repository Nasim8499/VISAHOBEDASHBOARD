import { Bell, HelpCircle, Mail, Menu, Search, Check } from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { assertWorkspaceField } from "@/utils/logger";

const DEFAULT_COLOR = "#003B73";
const DEFAULT_LOGO = "🏢";

export function TopHeader({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { workspace, setWorkspaceId, all } = useWorkspace();
  const [open, setOpen] = useState(false);

  assertWorkspaceField("TopHeader", workspace as any, ["color", "logo", "name"]);
  const wsColor = workspace?.color || DEFAULT_COLOR;
  const wsLogo = workspace?.logo || DEFAULT_LOGO;
  const wsName = workspace?.name || "No workspace";
  const wsId = workspace?.id;


  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur lg:px-8">
      <button
        onClick={onOpenSidebar}
        className="grid size-9 place-items-center rounded-lg border border-border bg-card text-foreground lg:hidden"
      >
        <Menu className="size-4" />
      </button>

      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2 text-left shadow-sm transition hover:shadow-elegant"
        >
          <div
            className="grid size-8 place-items-center rounded-lg text-white text-sm font-semibold"
            style={{ background: wsColor }}
          >
            {wsLogo}
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="text-xs text-muted-foreground">Workspace</div>
            <div className="text-sm font-semibold">{wsName}</div>
          </div>

          <svg className="ml-1 size-3.5 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 8l5 5 5-5H5z" />
          </svg>
        </button>
        {open && (
          <div className="absolute left-0 top-full z-50 mt-2 w-80 animate-scale-in rounded-2xl border border-border bg-popover p-2 shadow-premium">
            <div className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Client Business Workspaces
            </div>
            {all.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setWorkspaceId(b.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted"
              >
                <span
                  className="grid size-9 place-items-center rounded-lg text-white"
                  style={{ background: b.color || DEFAULT_COLOR }}
                >
                  {b.logo || DEFAULT_LOGO}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium">{b.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {b.category} · {b.city}
                  </span>
                </span>
                {b.id === wsId && <Check className="size-4 text-accent" />}

              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative ml-2 hidden flex-1 max-w-xl md:block">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
          placeholder="Search businesses, files, tasks…"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {[Mail, Bell, HelpCircle].map((Icon, i) => (
          <button
            key={i}
            className="relative grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Icon className="size-4" />
            {i < 2 && (
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-gradient-red" />
            )}
          </button>
        ))}
        <div className="ml-2 grid size-9 place-items-center rounded-full bg-gradient-blue text-xs font-semibold text-white">
          VH
        </div>
      </div>
    </header>
  );
}
