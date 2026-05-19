import { PageContainer, PageHeader } from "@/components/layout/Page";
import { deliverables } from "@/data/mock";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Check, RotateCcw, X } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

export default function Approvals() {
  const { workspace } = useWorkspace();
  return (
    <PageContainer>
      <PageHeader
        title="Approvals"
        subtitle={`Client approvals across deliverables for ${workspace.name}`}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {deliverables.map((d, i) => (
          <article key={d.key} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div
              className="grid h-40 place-items-center text-white"
              style={{ background: `linear-gradient(135deg, ${workspace.color}, #003B73)` }}
            >
              <div className="text-center">
                <div className="text-[11px] uppercase tracking-wider opacity-80">Preview</div>
                <div className="font-display text-xl font-bold">{d.title}</div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{d.title}</div>
                <StatusBadge status={d.status} />
              </div>
              <textarea
                rows={2}
                placeholder="Add a comment for the team…"
                className="mt-3 w-full resize-none rounded-lg border border-border bg-background p-2 text-xs"
              />
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                <button className="inline-flex items-center justify-center gap-1 rounded-lg bg-success px-2 py-2 text-xs font-semibold text-white">
                  <Check className="size-3.5" /> Approve
                </button>
                <button className="inline-flex items-center justify-center gap-1 rounded-lg bg-warning px-2 py-2 text-xs font-semibold text-white">
                  <RotateCcw className="size-3.5" /> Revise
                </button>
                <button className="inline-flex items-center justify-center gap-1 rounded-lg bg-destructive px-2 py-2 text-xs font-semibold text-white">
                  <X className="size-3.5" /> Reject
                </button>
              </div>
              <div className="mt-3 text-[11px] text-muted-foreground">
                Revision history · v{i + 1} · Last action 2h ago
              </div>
            </div>
          </article>
        ))}
      </div>
    </PageContainer>
  );
}
