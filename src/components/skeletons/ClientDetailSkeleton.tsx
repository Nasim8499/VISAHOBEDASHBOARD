import { PageContainer } from "@/components/layout/Page";
import { Shimmer } from "./Shimmer";

export default function ClientDetailSkeleton() {
  return (
    <PageContainer>
      <Shimmer className="h-48 w-full rounded-2xl" />
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <Shimmer className="h-6 w-1/2" />
          <Shimmer className="h-4 w-3/4" />
          <Shimmer className="h-64 w-full rounded-2xl" />
        </div>
        <div className="space-y-3">
          <Shimmer className="h-32 w-full rounded-2xl" />
          <Shimmer className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    </PageContainer>
  );
}

export function ChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <Shimmer className="mb-3 h-4 w-40" />
      <div className="flex items-end gap-2" style={{ height }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Shimmer
            key={i}
            className="flex-1 rounded-md"
            // varied bar heights
            // eslint-disable-next-line react/forbid-dom-props
          />
        ))}
      </div>
    </div>
  );
}
