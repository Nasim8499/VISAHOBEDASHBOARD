import { PageContainer, PageHeader } from "@/components/layout/Page";
import { businesses } from "@/data/mock";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Link } from "react-router-dom";

export default function Projects() {
  return (
    <PageContainer>
      <PageHeader title="Projects" subtitle="All active and recent projects across client workspaces." />
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Business</th>
              <th className="px-4 py-3 text-left">Stage</th>
              <th className="px-4 py-3 text-left">PM</th>
              <th className="px-4 py-3 text-left">Deadline</th>
              <th className="px-4 py-3 text-left">Progress</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {businesses.map((b) => (
              <tr key={b.id} className="border-t border-border hover:bg-muted/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="grid size-9 place-items-center rounded-lg text-white" style={{ background: b.color }}>{b.logo}</span>
                    <div>
                      <div className="font-semibold">{b.name}</div>
                      <div className="text-xs text-muted-foreground">{b.category}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{b.stage}</td>
                <td className="px-4 py-3">{b.manager}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.deadline}</td>
                <td className="w-56 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ProgressBar value={b.progress} className="flex-1" />
                    <span className="text-xs font-semibold">{b.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                <td className="px-4 py-3">
                  <Link to={`/workspace/${b.id}`} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Open</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
