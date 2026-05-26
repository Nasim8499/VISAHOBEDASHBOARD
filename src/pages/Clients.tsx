import { useEffect, useState } from "react";
import { PageContainer, PageHeader } from "@/components/layout/Page";
import { businesses } from "@/data/mock";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "react-router-dom";
import { Filter, Plus, Search, ArrowRight, Users, Activity } from "lucide-react";
import ClientsListSkeleton from "@/components/skeletons/ClientsListSkeleton";
import { cn } from "@/lib/utils";

export default function Clients() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);
  if (loading) return <ClientsListSkeleton />;
  return (
    <PageContainer>
      <PageHeader
        title="Client Businesses"
        subtitle="Every workspace VisaHOBe is building, branding and launching."
        actions={
          <>
            <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground hover:bg-secondary">
              <Filter className="size-4" /> Filters
            </button>
            <Link
              to="/clients/new"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant hover:shadow-glow"
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

      {/* Apple-style photo cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3">
        {businesses.map((b) => (
          <Link
            key={b.id}
            to={`/workspace/${b.id}`}
            className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-elegant transition-all duration-300 hover:-translate-y-1 hover:shadow-premium"
          >
            {/* Photo face */}
            <div className="relative h-44 overflow-hidden">
              <img
                src={b.cover}
                alt={b.name}
                loading="lazy"
                className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-transparent mix-blend-overlay" />

              <span
                className="absolute left-4 top-4 grid size-11 place-items-center rounded-2xl text-lg shadow-md ring-1 ring-white/40 backdrop-blur"
                style={{ background: b.color, color: "white" }}
              >
                {b.logo}
              </span>
              <StatusBadge
                status={b.status}
                className="absolute right-4 top-4 border border-white/30 bg-white/85 text-primary backdrop-blur"
              />

              <div className="absolute inset-x-4 bottom-4 text-white">
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/85">
                  {b.category}
                </div>
                <div className="mt-1 font-display text-lg font-bold leading-tight tracking-tight">
                  {b.name}
                </div>
                <div className="mt-0.5 text-[11px] text-white/80">{b.city}</div>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-3.5" /> PM · {b.manager}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Activity className="size-3.5" /> {b.lastActivity}
                </span>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-muted-foreground">{b.stage}</span>
                  <span className="text-primary">{b.progress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width] duration-700",
                      b.progress === 100 ? "bg-success" : "bg-gradient-blue"
                    )}
                    style={{ width: `${b.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-[11px] font-semibold uppercase tracking-[0.18em]">
                <span className="text-muted-foreground">Open workspace</span>
                <span className="inline-flex items-center gap-1 text-primary transition group-hover:gap-2">
                  Enter <ArrowRight className="size-3.5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}

