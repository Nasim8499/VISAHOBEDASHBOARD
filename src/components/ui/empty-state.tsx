import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  icon?: LucideIcon;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
  children?: ReactNode;
}

/** Editorial empty state with optional primary + secondary action buttons. */
export function EmptyState({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
  secondaryAction,
  className,
  children,
}: EmptyStateProps) {
  const ActionTag = action?.href ? "a" : "button";
  const SecondaryTag = secondaryAction?.href ? "a" : "button";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className={cn(
        "mx-auto w-full max-w-xl rounded-3xl border border-border bg-card p-8 text-center shadow-elegant sm:p-10",
        className,
      )}
    >
      {Icon && (
        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-gradient-blue text-white shadow-glow">
          <Icon className="size-7" />
        </div>
      )}
      {eyebrow && (
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </div>
      )}
      <h2 className="mt-1 font-display text-xl font-bold sm:text-2xl">{title}</h2>
      {description && (
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {children && <div className="mt-5">{children}</div>}
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {action && (
            <ActionTag
              {...(action.href ? { href: action.href } : { onClick: action.onClick, type: "button" as const })}
              className="tap inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-blue px-5 py-3 text-sm font-semibold text-white shadow-elegant hover:shadow-glow"
            >
              {action.icon && <action.icon className="size-4" />}
              {action.label}
            </ActionTag>
          )}
          {secondaryAction && (
            <SecondaryTag
              {...(secondaryAction.href
                ? { href: secondaryAction.href }
                : { onClick: secondaryAction.onClick, type: "button" as const })}
              className="tap inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-muted"
            >
              {secondaryAction.label}
            </SecondaryTag>
          )}
        </div>
      )}
    </motion.div>
  );
}
