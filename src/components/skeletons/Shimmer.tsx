import { cn } from "@/lib/utils";

/** Minimal shimmer placeholder using the existing pulse animation. */
export function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-gradient-to-r from-muted via-muted/60 to-muted",
        className,
      )}
    />
  );
}
