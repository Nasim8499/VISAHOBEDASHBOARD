import { PageContainer, PageHeader } from "@/components/layout/Page";
import { businesses, deliverables } from "@/data/mock";
import { useParams, Link } from "react-router-dom";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Check, Download, MessageSquare, UploadCloud, Video } from "lucide-react";

export default function ClientPortal() {
  const { id } = useParams();
  const ws = businesses.find((b) => b.id === id) || businesses[0];
  return (
    <PageContainer>
      <div className="mb-6 rounded-2xl bg-gradient-hero p-6 text-white shadow-premium">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid size-14 place-items-center rounded-2xl text-2xl ring-2 ring-white/40" style={{ background: ws.color }}>{ws.logo}</span>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wider opacity-80">Client Portal</div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Welcome back, {ws.name} team</h1>
            <p className="mt-1 text-sm opacity-90">Track progress, approve deliverables and chat with VisaHOBe.</p>
          </div>
          <Link to="/" className="rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold backdrop-blur hover:bg-white/25">Back to admin</Link>
        </div>
      </div>

      <PageHeader title="Project Progress" subtitle="Your business is on track." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Overall completion</span>
            <span className="font-semibold">{ws.progress}%</span>
          </div>
          <ProgressBar value={ws.progress} />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {deliverables.map((d) => (
              <div key={d.key} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between">
                  <div className="text-sm font-semibold">{d.title}</div>
                  <StatusBadge status={d.status} />
                </div>
                <ProgressBar value={d.progress} className="mt-3" />
                <div className="mt-3 flex gap-1.5">
                  <button className="inline-flex items-center gap-1 rounded-lg bg-success px-2.5 py-1 text-[11px] font-semibold text-white">
                    <Check className="size-3" /> Approve
                  </button>
                  <button className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-[11px] font-semibold">
                    <Download className="size-3" /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <Quick title="Upload Required Files" icon={UploadCloud}>
            <div className="rounded-xl border-2 border-dashed border-border p-5 text-center text-xs text-muted-foreground">
              Drag files or <span className="font-semibold text-accent">browse</span>
            </div>
          </Quick>
          <Quick title="Chat with the team" icon={MessageSquare}>
            <Link to="/chat" className="block rounded-lg bg-primary px-3 py-2 text-center text-xs font-semibold text-primary-foreground">Open chat</Link>
          </Quick>
          <Quick title="Schedule a meeting" icon={Video}>
            <Link to="/meetings" className="block rounded-lg border border-border px-3 py-2 text-center text-xs font-semibold">Pick a time</Link>
          </Quick>
        </aside>
      </div>
    </PageContainer>
  );
}

function Quick({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <span className="grid size-8 place-items-center rounded-lg bg-gradient-blue text-white"><Icon className="size-4" /></span>
        {title}
      </div>
      {children}
    </section>
  );
}
