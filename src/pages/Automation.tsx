import { PageContainer, PageHeader } from "@/components/layout/Page";
import { Plus, Zap, ArrowRight } from "lucide-react";

const rules = [
  { trigger: "Workspace created", action: "Send onboarding doc request to client", on: true },
  { trigger: "Deadline in 3 days", action: "Notify project manager + client", on: true },
  { trigger: "Deliverable status = Waiting Approval", action: "Email client portal link", on: true },
  { trigger: "Project marked Completed", action: "Generate final invoice", on: false },
  { trigger: "Weekly · Friday 5pm", action: "Send progress report to client", on: true },
];

export default function Automation() {
  return (
    <PageContainer>
      <PageHeader
        title="Automation"
        subtitle="Trigger-based workflows across every client business."
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-blue px-4 py-2.5 text-sm font-semibold text-white">
            <Plus className="size-4" /> New Workflow
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4">
        {rules.map((r, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-gradient-red text-white">
                <Zap className="size-4" />
              </span>
              <div className="rounded-xl bg-muted/60 px-4 py-2 text-sm">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">When</div>
                {r.trigger}
              </div>
              <ArrowRight className="hidden size-4 text-muted-foreground sm:block" />
              <div className="rounded-xl bg-muted/60 px-4 py-2 text-sm">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Then</div>
                {r.action}
              </div>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2">
              <span className="text-xs text-muted-foreground">Enabled</span>
              <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${r.on ? "bg-success" : "bg-muted"}`}>
                <span className={`absolute size-5 rounded-full bg-white shadow transition ${r.on ? "translate-x-5" : "translate-x-0.5"}`} />
              </span>
            </label>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
