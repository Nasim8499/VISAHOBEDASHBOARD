import { PageContainer, PageHeader } from "@/components/layout/Page";
import { tasksByStatus } from "@/data/mock";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus } from "lucide-react";

const columns = [
  "Backlog",
  "To Do",
  "In Progress",
  "Waiting Client Approval",
  "Revision Requested",
  "Completed",
] as const;

const priorityTone: Record<string, string> = {
  High: "bg-destructive/10 text-destructive",
  Medium: "bg-warning/10 text-warning",
  Low: "bg-muted text-muted-foreground",
};

export default function Tasks() {
  return (
    <PageContainer>
      <PageHeader
        title="Tasks & Workflow"
        subtitle="Track every task across every client business workspace."
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-blue px-4 py-2.5 text-sm font-semibold text-white">
            <Plus className="size-4" /> New Task
          </button>
        }
      />

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const list = tasksByStatus[col] || [];
          return (
            <div key={col} className="w-72 shrink-0">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{col}</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                    {list.length}
                  </span>
                </div>
                <button className="rounded-md p-1 text-muted-foreground hover:bg-muted">
                  <Plus className="size-4" />
                </button>
              </div>
              <div className="space-y-2">
                {list.map((t) => (
                  <div
                    key={t.title}
                    className="cursor-grab rounded-xl border border-border bg-card p-3 shadow-sm transition hover:shadow-elegant"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-semibold">{t.title}</div>
                      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${priorityTone[t.priority]}`}>
                        {t.priority}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="grid size-7 place-items-center rounded-full bg-gradient-blue text-[10px] font-semibold text-white">
                        {t.assignee}
                      </span>
                      <span>Due {t.due}</span>
                    </div>
                  </div>
                ))}
                {list.length === 0 && (
                  <div className="rounded-xl border-2 border-dashed border-border p-5 text-center text-xs text-muted-foreground">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Legend</h3>
        <div className="flex flex-wrap gap-2">
          {columns.map((c) => <StatusBadge key={c} status={c} />)}
        </div>
      </div>
    </PageContainer>
  );
}
