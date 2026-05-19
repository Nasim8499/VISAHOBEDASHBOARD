import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
  tone = "blue",
}: {
  value: number;
  className?: string;
  tone?: "blue" | "red" | "neutral";
}) {
  const bg =
    tone === "red"
      ? "bg-gradient-red"
      : tone === "neutral"
      ? "bg-muted-foreground/60"
      : "bg-gradient-blue";
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-700 ease-out", bg)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
