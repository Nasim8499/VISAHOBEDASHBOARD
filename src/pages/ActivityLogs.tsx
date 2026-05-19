import { PageContainer, PageHeader } from "@/components/layout/Page";
import { activity } from "@/data/mock";

export default function ActivityLogs() {
  return (
    <PageContainer>
      <PageHeader title="Activity Logs" subtitle="Every action across all workspaces, in one timeline." />
      <ol className="relative ml-3 space-y-5 border-l border-border pl-6">
        {[...activity, ...activity].map((a, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[34px] grid size-6 place-items-center rounded-full bg-gradient-blue text-[10px] font-bold text-white ring-4 ring-background">
              {a.who.split(" ").map((n) => n[0]).join("")}
            </span>
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="text-sm">
                <span className="font-semibold">{a.who}</span>{" "}
                <span className="text-muted-foreground">{a.action}</span>{" "}
                <span className="font-medium">{a.target}</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{a.time}</div>
            </div>
          </li>
        ))}
      </ol>
    </PageContainer>
  );
}
