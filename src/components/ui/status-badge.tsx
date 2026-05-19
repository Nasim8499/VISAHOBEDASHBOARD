import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-accent/10 text-accent border-accent/20",
  neutral: "bg-muted text-muted-foreground border-border",
  brand: "bg-primary/10 text-primary border-primary/20",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const map: Record<string, keyof typeof tones> = {
    Completed: "success",
    active: "success",
    "In Progress": "info",
    "Waiting Client Approval": "warning",
    paused: "warning",
    "Revision Requested": "danger",
    Rejected: "danger",
    "Not Started": "neutral",
    completed: "success",
    Pending: "warning",
    Verified: "info",
    Approved: "success",
  };
  const tone = tones[map[status] || "neutral"];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        tone,
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
