import { PageContainer, PageHeader } from "@/components/layout/Page";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Download } from "lucide-react";

export default function BrandKit() {
  const { workspace } = useWorkspace();
  return (
    <PageContainer>
      <PageHeader title="Brand Kit" subtitle={`Approved brand assets for ${workspace.name}.`} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Logos">
          <div className="grid grid-cols-3 gap-2">
            {["Primary", "Secondary", "Icon"].map((v) => (
              <div key={v} className="grid aspect-square place-items-center rounded-xl bg-muted">
                <div className="grid size-12 place-items-center rounded-xl text-xl font-bold text-white" style={{ background: workspace.color }}>
                  {workspace.name[0]}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Color Palette">
          <div className="grid grid-cols-5 gap-2">
            {workspace.palette.map((c) => (
              <div key={c} className="overflow-hidden rounded-xl border border-border">
                <div className="h-14" style={{ background: c }} />
                <div className="p-1.5 text-[10px] font-mono text-muted-foreground">{c}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Typography">
          <div className="space-y-1 rounded-xl border border-border p-4">
            <div className="font-display text-3xl font-bold">Aa Bb Cc</div>
            <div className="text-sm text-muted-foreground">{workspace.font}</div>
          </div>
        </Card>
        <Card title="Downloads">
          <div className="space-y-2">
            {["Logo Pack (.zip)", "Brand Guidelines.pdf", "Color Palette.ase", "Social Templates"].map((f) => (
              <div key={f} className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
                <span>{f}</span>
                <button className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs"><Download className="size-3.5" /> Download</button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}
