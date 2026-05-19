import { PageContainer, PageHeader } from "@/components/layout/Page";
import { employees } from "@/data/mock";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Plus } from "lucide-react";

export default function Team() {
  return (
    <PageContainer>
      <PageHeader
        title="Team Management"
        subtitle="VisaHOBe employees, roles, workload and assigned client businesses."
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-blue px-4 py-2.5 text-sm font-semibold text-white">
            <Plus className="size-4" /> Add Employee
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {employees.map((e) => (
          <article key={e.name} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-gradient-blue text-sm font-semibold text-white">
                {e.initials}
              </span>
              <div>
                <div className="font-semibold">{e.name}</div>
                <div className="text-xs text-muted-foreground">{e.role}</div>
              </div>
              <span className="ml-auto rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                Available
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Stat label="Clients" value={e.clients} />
              <Stat label="Active tasks" value={e.load} />
            </div>
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Workload</span>
                <span>{Math.min(100, e.load * 12)}%</span>
              </div>
              <ProgressBar value={Math.min(100, e.load * 12)} tone={e.load > 7 ? "red" : "blue"} />
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">View profile</button>
              <button className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">Permissions</button>
            </div>
          </article>
        ))}
      </div>
    </PageContainer>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}
