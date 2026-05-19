import { PageContainer, PageHeader } from "@/components/layout/Page";
import { useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Download, Share2, Sparkles } from "lucide-react";

const platforms = ["Instagram", "Facebook", "LinkedIn", "Story"] as const;

export default function PostDesigner() {
  const { workspace } = useWorkspace();
  const [platform, setPlatform] = useState<(typeof platforms)[number]>("Instagram");

  return (
    <PageContainer>
      <PageHeader
        title="Post Designer"
        subtitle={`Premium social media kit — ${workspace.name}`}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {platforms.map((p) => (
          <button
            key={p}
            onClick={() => setPlatform(p)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              platform === p ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => {
            const aspect = platform === "Story" ? "aspect-[9/16]" : "aspect-square";
            return (
              <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div
                  className={`${aspect} relative bg-gradient-hero p-5 text-white`}
                  style={{ background: `linear-gradient(135deg, ${workspace.color}, #003B73)` }}
                >
                  <div className="text-[11px] uppercase tracking-wider opacity-80">Post {i + 1}</div>
                  <div className="mt-3 font-display text-2xl font-bold leading-tight">
                    {workspace.slogan}
                  </div>
                  <div className="absolute inset-x-5 bottom-4 flex items-center justify-between text-xs opacity-90">
                    <span>@{workspace.name.toLowerCase().replace(/\s/g, "")}</span>
                    <span className="rounded-full bg-white/15 px-2 py-0.5 backdrop-blur">{platform}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3">
                  <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning">
                    Waiting Approval
                  </span>
                  <div className="flex gap-1.5">
                    <button className="grid size-8 place-items-center rounded-lg border border-border hover:bg-muted">
                      <Download className="size-3.5" />
                    </button>
                    <button className="grid size-8 place-items-center rounded-lg border border-border hover:bg-muted">
                      <Share2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Caption Generator
          </h3>
          <textarea
            rows={6}
            defaultValue={`✨ ${workspace.slogan}\n\nDiscover the new ${workspace.name} experience.`}
            className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-accent"
          />
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-blue px-4 py-2.5 text-sm font-semibold text-white">
            <Sparkles className="size-4" /> Generate captions
          </button>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customize</div>
            <div className="space-y-2">
              {["Primary color", "Accent color", "Heading font", "CTA text"].map((f) => (
                <div key={f} className="flex items-center justify-between rounded-lg border border-border p-2 text-sm">
                  <span>{f}</span>
                  <button className="rounded-md border border-border px-2 py-0.5 text-xs">Edit</button>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full rounded-xl bg-gradient-red px-4 py-2.5 text-sm font-semibold text-white">
            Save to Workspace
          </button>
        </aside>
      </div>
    </PageContainer>
  );
}
