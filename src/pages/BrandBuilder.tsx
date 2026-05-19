import { PageContainer, PageHeader } from "@/components/layout/Page";
import { brandBuilderSteps } from "@/data/mock";
import { useWorkspace } from "@/context/WorkspaceContext";
import { StatusBadge } from "@/components/ui/status-badge";
import { Download, Eye, Send } from "lucide-react";

export default function BrandBuilder() {
  const { workspace: ws } = useWorkspace();

  return (
    <PageContainer>
      <PageHeader
        title="Brand Builder"
        subtitle={`Premium structured brand workflow for ${ws.name}`}
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-blue px-4 py-2.5 text-sm font-semibold text-white">
            <Send className="size-4" /> Send for Approval
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Steps */}
        <div className="space-y-5 lg:col-span-2">
          {brandBuilderSteps.map((s, idx) => (
            <section key={s.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-gradient-blue text-sm font-bold text-white">
                  {idx + 1}
                </span>
                <h3 className="text-base font-semibold">{s.title}</h3>
              </div>
              <ul className="space-y-2">
                {s.items.map((it) => (
                  <li
                    key={it.name}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm"
                  >
                    <span>{it.name}</span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={it.status} />
                      <button className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs hover:bg-muted">
                        Edit
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Previews */}
        <div className="space-y-5">
          {/* Logo preview */}
          <Preview title="Logo · Primary">
            <div className="grid h-44 place-items-center rounded-xl bg-gradient-card text-5xl">
              <div className="flex items-center gap-2">
                <span
                  className="grid size-12 place-items-center rounded-2xl text-2xl text-white"
                  style={{ background: ws.color }}
                >
                  {ws.logo}
                </span>
                <span className="font-display text-2xl font-bold">{ws.name.split(" ")[0]}</span>
              </div>
            </div>
          </Preview>

          {/* Palette */}
          <Preview title="Color Palette">
            <div className="grid grid-cols-5 gap-2">
              {ws.palette.map((c) => (
                <div key={c}>
                  <div className="h-14 rounded-lg" style={{ background: c }} />
                  <div className="mt-1 text-[10px] font-mono text-muted-foreground">{c}</div>
                </div>
              ))}
            </div>
          </Preview>

          {/* Business card */}
          <Preview title="Business Card">
            <div className="rounded-xl p-4 text-white" style={{ background: ws.color }}>
              <div className="text-xs opacity-80">{ws.category}</div>
              <div className="mt-1 text-lg font-bold">{ws.name}</div>
              <div className="mt-6 text-[11px] opacity-90">{ws.slogan}</div>
            </div>
          </Preview>

          {/* Social post */}
          <Preview title="Social Post">
            <div className="aspect-square overflow-hidden rounded-xl bg-gradient-hero p-5 text-white">
              <div className="text-[11px] uppercase tracking-wider opacity-80">New launch</div>
              <div className="mt-2 font-display text-2xl font-bold leading-tight">{ws.slogan}</div>
              <div className="mt-10 text-xs opacity-80">@{ws.name.toLowerCase().replace(/\s/g, "")}</div>
            </div>
          </Preview>

          {/* Brand book */}
          <Preview title="Brand Book">
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4">
              <div>
                <div className="text-sm font-semibold">{ws.name} — Brand Guidelines.pdf</div>
                <div className="text-xs text-muted-foreground">28 pages · 6.4 MB</div>
              </div>
              <div className="flex gap-1.5">
                <button className="grid size-9 place-items-center rounded-lg border border-border hover:bg-muted">
                  <Eye className="size-4" />
                </button>
                <button className="grid size-9 place-items-center rounded-lg border border-border hover:bg-muted">
                  <Download className="size-4" />
                </button>
              </div>
            </div>
          </Preview>
        </div>
      </div>
    </PageContainer>
  );
}

function Preview({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      {children}
    </section>
  );
}
