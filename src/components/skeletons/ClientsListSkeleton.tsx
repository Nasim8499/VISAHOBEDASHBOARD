import { PageContainer } from "@/components/layout/Page";
import { Shimmer } from "./Shimmer";

export default function ClientsListSkeleton() {
  return (
    <PageContainer>
      <div className="mb-6 flex items-end justify-between">
        <div className="space-y-2">
          <Shimmer className="h-4 w-40" />
          <Shimmer className="h-8 w-72" />
        </div>
        <Shimmer className="h-10 w-44 rounded-xl" />
      </div>
      <div className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-border bg-card p-3 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Shimmer key={i} className="h-10 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
            <Shimmer className="h-36 rounded-none" />
            <div className="space-y-3 p-4">
              <Shimmer className="h-4 w-2/3" />
              <Shimmer className="h-3 w-1/2" />
              <Shimmer className="h-2 w-full" />
              <div className="flex gap-2">
                <Shimmer className="h-9 flex-1 rounded-lg" />
                <Shimmer className="h-9 w-24 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
