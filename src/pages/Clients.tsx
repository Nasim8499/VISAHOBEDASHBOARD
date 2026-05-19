import { PageContainer, PageHeader } from "@/components/layout/Page";
import { businesses } from "@/data/mock";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Link } from "react-router-dom";
import { Filter, Plus, Search } from "lucide-react";

export default function Clients() {
  return (
    <PageContainer>
      <PageHeader
        title="Client Businesses"
        subtitle="Every workspace VisaHOBe is building, branding and launching."
        actions={
          <>
            <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold hover:bg-muted">
              <Filter className="size-4" /> Filters
            </button>
            <Link
              to="/clients/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-blue px-4 py-2.5 text-sm font-semibold text-white shadow-elegant hover:shadow-glow"
            >
              <Plus className="size-4" /> Add Client Business
            </Link>
          </>
        }
      />

      {/* Filter bar */}
      <div className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-border bg-card p-3 sm:grid-cols-5">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search businesses"
            className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm outline-none focus:border-accent"
          />
        </div>
        {["Category", "Status", "Assignee"].map((p) => (
          <select
            key={p}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
          >
            <option>{p}: All</option>
          </select>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {businesses.map((b) => (
          <div
            key={b.id}
            className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-elegant"
          >
            <div className="relative h-36">
              <img src={b.cover} alt={b.name} className="size-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/80 to-transparent" />
              <span
                className="absolute left-3 top-3 grid size-10 place-items-center rounded-xl text-lg ring-2 ring-white/30"
                style={{ background: b.color }}
              >
                {b.logo}
              </span>
              <StatusBadge status={b.status} className="absolute right-3 top-3 bg-white/90 backdrop-blur" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                <div className="text-sm font-bold">{b.name}</div>
                <div className="text-[11px] opacity-80">
                  {b.category} · {b.city}
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">PM · {b.manager}</span>
                <span className="font-semibold">{b.progress}%</span>
              </div>
              <ProgressBar value={b.progress} className="mt-2" />
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{b.stage}</span>
                <span>{b.lastActivity}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  to={`/workspace/${b.id}`}
                  className="flex-1 rounded-lg bg-primary px-3 py-2 text-center text-xs font-semibold text-primary-foreground hover:opacity-90"
                >
                  Open Workspace
                </Link>
                <Link
                  to={`/portal/${b.id}`}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"
                >
                  Client View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
