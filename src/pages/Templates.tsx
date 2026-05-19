import { PageContainer, PageHeader } from "@/components/layout/Page";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Download, Eye } from "lucide-react";

const templates = [
  "Restaurant Hero", "Travel Showcase", "Beauty Booking", "Fitness CTA",
  "Real Estate Grid", "Launch Banner", "Story Promo", "Event Flyer", "Coupon Card",
];

export default function Templates() {
  const { workspace } = useWorkspace();
  return (
    <PageContainer>
      <PageHeader title="Templates" subtitle="Premium templates ready to remix for any client workspace." />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {templates.map((t, i) => (
          <div key={t} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div
              className="grid aspect-[4/5] place-items-center text-white"
              style={{ background: `linear-gradient(${135 + i * 15}deg, ${workspace.color}, #003B73)` }}
            >
              <div className="px-4 text-center">
                <div className="text-[10px] uppercase tracking-wider opacity-80">Template</div>
                <div className="font-display text-lg font-bold leading-tight">{t}</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3">
              <div className="text-xs font-medium">{t}</div>
              <div className="flex gap-1">
                <button className="grid size-7 place-items-center rounded-md border border-border"><Eye className="size-3" /></button>
                <button className="grid size-7 place-items-center rounded-md border border-border"><Download className="size-3" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
