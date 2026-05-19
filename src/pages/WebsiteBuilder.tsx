import { PageContainer, PageHeader } from "@/components/layout/Page";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Check, Globe2, Smartphone } from "lucide-react";

const templates = ["Restaurant Hero", "Travel Showcase", "Beauty Booking", "Fitness CTA", "Real Estate Grid"];

export default function WebsiteBuilder() {
  const { workspace } = useWorkspace();
  return (
    <PageContainer>
      <PageHeader
        title="Website Builder"
        subtitle={`Build, preview and publish the landing page for ${workspace.name}`}
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-blue px-4 py-2.5 text-sm font-semibold text-white">
            <Globe2 className="size-4" /> Publish
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_280px]">
        {/* Templates */}
        <aside className="space-y-2 rounded-2xl border border-border bg-card p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Templates</div>
          {templates.map((t, i) => (
            <button
              key={t}
              className={`w-full rounded-xl border px-3 py-3 text-left text-sm transition ${
                i === 0 ? "border-primary bg-primary/5 font-semibold text-primary" : "border-border hover:bg-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </aside>

        {/* Preview */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-elegant">
          <div className="flex items-center gap-1.5 border-b border-border bg-muted/60 p-3">
            <span className="size-2.5 rounded-full bg-destructive" />
            <span className="size-2.5 rounded-full bg-warning" />
            <span className="size-2.5 rounded-full bg-success" />
            <div className="mx-auto rounded-md bg-card px-3 py-1 text-xs text-muted-foreground">
              {workspace.name.toLowerCase().replace(/\s/g, "")}.com
            </div>
          </div>
          <div>
            {/* Hero */}
            <div className="relative h-60 overflow-hidden">
              <img src={workspace.cover} className="size-full object-cover" alt="" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B132B]/85 to-transparent" />
              <div className="absolute inset-y-0 left-0 flex w-1/2 flex-col justify-center p-6 text-white">
                <div className="text-xs uppercase tracking-wider opacity-80">{workspace.category}</div>
                <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">{workspace.slogan}</h2>
                <p className="mt-2 text-sm opacity-90">A premium {workspace.category.toLowerCase()} experience designed and built by VisaHOBe.</p>
                <button className="mt-4 w-fit rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary">Book now</button>
              </div>
            </div>
            {/* Sections */}
            <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
              {["Services", "About", "Gallery", "Contact"].map((s) => (
                <div key={s} className="rounded-xl border border-border p-3 text-center">
                  <div className="mx-auto mb-2 size-8 rounded-lg bg-gradient-blue" />
                  <div className="text-sm font-semibold">{s}</div>
                  <div className="text-[11px] text-muted-foreground">Section ready</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Settings */}
        <aside className="space-y-4 rounded-2xl border border-border bg-card p-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Smartphone className="size-3.5" /> Mobile Preview
            </div>
            <div className="mx-auto h-48 w-24 overflow-hidden rounded-2xl border border-border">
              <img src={workspace.cover} className="h-2/5 w-full object-cover" alt="" />
              <div className="space-y-1 p-2">
                <div className="h-1.5 rounded bg-muted" />
                <div className="h-1.5 w-2/3 rounded bg-muted" />
                <div className="mt-2 h-4 rounded bg-gradient-blue" />
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">SEO</div>
            <input className="mb-2 h-9 w-full rounded-lg border border-border bg-background px-3 text-xs" placeholder="Page title" defaultValue={`${workspace.name} — ${workspace.slogan}`} />
            <textarea rows={3} className="w-full rounded-lg border border-border bg-background p-2 text-xs" placeholder="Meta description" />
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Domain & Hosting</div>
            <ul className="space-y-1.5 text-xs">
              {["Domain connected", "SSL active", "CDN enabled", "Analytics installed"].map((x) => (
                <li key={x} className="flex items-center gap-2 rounded-lg border border-border p-2">
                  <Check className="size-3.5 text-success" /> {x}
                </li>
              ))}
            </ul>
          </div>

          <button className="w-full rounded-xl bg-gradient-red px-4 py-2.5 text-sm font-semibold text-white">
            Send for Client Approval
          </button>
        </aside>
      </div>
    </PageContainer>
  );
}
