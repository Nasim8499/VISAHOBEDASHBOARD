import { PageContainer } from "@/components/layout/Page";
import { businesses, brandBuilderSteps, deliverables, employees, activity } from "@/data/mock";
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ClientDetailSkeleton from "@/components/skeletons/ClientDetailSkeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  Calendar,
  DollarSign,
  ExternalLink,
  MessageSquare,
  Sparkles,
  User2,
} from "lucide-react";

const tabs = [
  "Overview",
  "Brand Builder",
  "Deliverables",
  "Tasks",
  "Files",
  "Chat",
  "Meetings",
  "Invoices",
  "Timeline",
  "Notes",
  "Approvals",
];

export default function WorkspaceDetail() {
  const { id } = useParams();
  const ws = businesses.find((b) => b.id === id) || businesses[0];
  const [tab, setTab] = useState("Overview");

  return (
    <PageContainer>
      {/* Header card */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-elegant">
        <div className="relative h-44 sm:h-56">
          <img src={ws.cover} alt={ws.name} className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/90 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end gap-4 p-5 text-white sm:p-6">
            <span
              className="grid size-14 place-items-center rounded-2xl text-2xl ring-2 ring-white/40"
              style={{ background: ws.color }}
            >
              {ws.logo}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold sm:text-3xl">{ws.name}</h1>
                <StatusBadge status={ws.status} className="bg-white/90 text-foreground" />
              </div>
              <div className="text-xs text-white/85">
                {ws.category} · {ws.city}, {ws.country}
              </div>
            </div>
            <Link
              to={`/portal/${ws.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold backdrop-blur hover:bg-white/25"
            >
              View Client Portal <ExternalLink className="size-3.5" />
            </Link>
          </div>
        </div>
        <div className="grid gap-4 border-t border-border p-5 sm:grid-cols-4">
          <Meta icon={User2} label="Project Manager" value={ws.manager} />
          <Meta icon={Calendar} label="Deadline" value={ws.deadline} />
          <Meta icon={DollarSign} label="Budget" value={ws.budget} />
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Overall Progress</div>
            <div className="mt-1 flex items-center gap-2">
              <ProgressBar value={ws.progress} className="flex-1" />
              <span className="text-sm font-semibold">{ws.progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 -mx-4 overflow-x-auto px-4">
        <div className="flex min-w-max gap-1 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition ${
                tab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {tab === "Overview" && (
            <>
              <Section title="Business Information">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Info label="Slogan" value={ws.slogan} />
                  <Info label="Category" value={ws.category} />
                  <Info label="Location" value={`${ws.city}, ${ws.country}`} />
                  <Info label="Service Package" value="Pro · Brand + Web + Marketing" />
                </div>
              </Section>

              <Section title="Brand Preview">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {ws.palette.map((c) => (
                    <div key={c} className="overflow-hidden rounded-xl border border-border">
                      <div className="h-16" style={{ background: c }} />
                      <div className="p-2 text-[11px] font-mono text-muted-foreground">{c}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Typography: <span className="font-semibold text-foreground">{ws.font}</span>
                </div>
              </Section>

              <Section title="Latest Activity">
                <ul className="space-y-3 text-sm">
                  {activity.slice(0, 4).map((a, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-1 size-2 rounded-full bg-accent" />
                      <span>
                        <span className="font-semibold">{a.who}</span>{" "}
                        <span className="text-muted-foreground">{a.action}</span>{" "}
                        <span className="font-medium">{a.target}</span>
                        <span className="ml-2 text-xs text-muted-foreground">· {a.time}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>
            </>
          )}

          {tab === "Brand Builder" && (
            <Section title="Brand Builder Steps">
              <div className="space-y-5">
                {brandBuilderSteps.map((s) => (
                  <div key={s.title}>
                    <h4 className="mb-2 text-sm font-semibold">{s.title}</h4>
                    <ul className="space-y-2">
                      {s.items.map((it) => (
                        <li
                          key={it.name}
                          className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-sm"
                        >
                          <span>{it.name}</span>
                          <StatusBadge status={it.status} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {tab === "Deliverables" && (
            <Section title="Deliverables">
              <div className="grid gap-3 sm:grid-cols-2">
                {deliverables.map((d) => (
                  <div key={d.key} className="rounded-2xl border border-border p-4">
                    <div className="flex items-start justify-between">
                      <div className="font-semibold">{d.title}</div>
                      <StatusBadge status={d.status} />
                    </div>
                    <ProgressBar value={d.progress} className="mt-3" />
                  </div>
                ))}
              </div>
            </Section>
          )}

          {!["Overview", "Brand Builder", "Deliverables"].includes(tab) && (
            <Section title={tab}>
              <EmptyTab tab={tab} />
            </Section>
          )}
        </div>

        <aside className="space-y-6">
          <Section title="Assigned Team">
            <ul className="space-y-3">
              {employees.slice(0, 4).map((e) => (
                <li key={e.name} className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-gradient-blue text-xs font-semibold text-white">
                    {e.initials}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{e.name}</div>
                    <div className="text-xs text-muted-foreground">{e.role}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Pending Approvals">
            <ul className="space-y-2 text-sm">
              {["Logo round 2", "Stationery set", "Social post pack"].map((x) => (
                <li
                  key={x}
                  className="flex items-center justify-between rounded-lg border border-border p-2.5"
                >
                  <span>{x}</span>
                  <StatusBadge status="Waiting Client Approval" />
                </li>
              ))}
            </ul>
          </Section>

          <Section title="AI Recommendations">
            <div className="rounded-2xl bg-gradient-hero p-4 text-white">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-90">
                <Sparkles className="size-3.5" /> Suggested next move
              </div>
              <p className="mt-2 text-sm">
                Push launch banner draft to {ws.name} client portal — they responded fastest to design
                approvals on Thursdays.
              </p>
              <button className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/25">
                <MessageSquare className="size-3.5" /> Generate message
              </button>
            </div>
          </Section>
        </aside>
      </div>
    </PageContainer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
function Meta({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 place-items-center rounded-xl bg-muted text-foreground">
        <Icon className="size-4" />
      </span>
      <div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}
function EmptyTab({ tab }: { tab: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-blue text-white">
        <Sparkles className="size-5" />
      </div>
      <h4 className="mt-3 font-semibold">{tab} workspace</h4>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        Content for {tab.toLowerCase()} will appear here once your team adds activity for this client.
      </p>
      <button className="mt-4 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
        Add {tab}
      </button>
    </div>
  );
}
