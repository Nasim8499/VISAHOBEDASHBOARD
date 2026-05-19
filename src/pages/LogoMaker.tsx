import { PageContainer, PageHeader } from "@/components/layout/Page";
import { useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Download, Heart, Wand2 } from "lucide-react";

const styles = ["Modern", "Minimal", "Luxury", "Creative", "Classic", "Corporate"];
const palettes = [
  ["#003B73", "#177BBB"],
  ["#E63946", "#F1573D"],
  ["#0B132B", "#16A34A"],
  ["#F59E0B", "#0B132B"],
  ["#177BBB", "#16A34A"],
  ["#E63946", "#003B73"],
];

export default function LogoMaker() {
  const { workspace } = useWorkspace();
  const [style, setStyle] = useState("Modern");
  const [palette, setPalette] = useState(0);
  const [selected, setSelected] = useState(0);
  const concepts = Array.from({ length: 6 });

  return (
    <PageContainer>
      <PageHeader
        title="Logo Maker"
        subtitle="Generate professional logo concepts for the active workspace."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <Field label="Business Name" value={workspace.name} />
          <Field label="Category" value={workspace.category} />
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Style</div>
            <div className="flex flex-wrap gap-2">
              {styles.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    style === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Palette</div>
            <div className="grid grid-cols-3 gap-2">
              {palettes.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPalette(i)}
                  className={`flex h-10 overflow-hidden rounded-lg ring-2 ${palette === i ? "ring-accent" : "ring-transparent"}`}
                >
                  {p.map((c) => <span key={c} className="flex-1" style={{ background: c }} />)}
                </button>
              ))}
            </div>
          </div>
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-blue px-4 py-2.5 text-sm font-semibold text-white">
            <Wand2 className="size-4" /> Generate Logos
          </button>
        </aside>

        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Concept Cards</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {concepts.map((_, i) => {
                const [c1, c2] = palettes[palette];
                const initial = workspace.name[0];
                return (
                  <button
                    key={i}
                    onClick={() => setSelected(i)}
                    className={`group relative grid aspect-square place-items-center rounded-2xl border-2 transition ${
                      selected === i ? "border-accent shadow-glow" : "border-border hover:border-accent/50"
                    }`}
                    style={{ background: `linear-gradient(135deg, ${c1}11, ${c2}11)` }}
                  >
                    <div
                      className="grid size-20 place-items-center rounded-2xl text-3xl font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                    >
                      {initial}
                    </div>
                    <span className="absolute right-2 top-2 rounded-full bg-card p-1 opacity-0 group-hover:opacity-100">
                      <Heart className="size-3.5" />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            {["Primary", "Secondary", "Icon"].map((variant) => {
              const [c1, c2] = palettes[palette];
              return (
                <div key={variant} className="rounded-2xl border border-border bg-card p-5 text-center">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{variant}</div>
                  <div className="my-5 grid h-28 place-items-center">
                    <div
                      className="grid size-16 place-items-center rounded-2xl text-2xl font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                    >
                      {workspace.name[0]}
                    </div>
                  </div>
                  <div className="flex justify-center gap-1.5">
                    {["SVG", "PNG", "PDF"].map((f) => (
                      <button key={f} className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-[11px] font-semibold hover:bg-muted">
                        <Download className="size-3" /> {f}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>

          <div className="flex flex-wrap gap-2">
            <button className="rounded-xl bg-gradient-blue px-4 py-2.5 text-sm font-semibold text-white">Save to Brand Kit</button>
            <button className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted">Request Revision</button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <input
        defaultValue={value}
        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-accent outline-none"
      />
    </div>
  );
}
