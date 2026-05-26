import { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Premium editorial photo card with gradient overlay.
 * Use across dashboards / workspace sections for consistent
 * typography, spacing and elevation.
 */
export interface PhotoCardProps {
  image?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: ReactNode;
  badge?: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
  aspect?: "video" | "square" | "portrait" | "wide";
  tone?: "navy" | "lavender" | "blush" | "sand";
  className?: string;
  children?: ReactNode;
}

const ASPECT: Record<NonNullable<PhotoCardProps["aspect"]>, string> = {
  video: "aspect-[16/10]",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  wide: "aspect-[21/9]",
};

const TONE: Record<NonNullable<PhotoCardProps["tone"]>, CSSProperties> = {
  navy: {
    background:
      "linear-gradient(135deg, hsl(230 55% 22%) 0%, hsl(235 65% 38%) 60%, hsl(245 70% 60%) 100%)",
  },
  lavender: {
    background:
      "linear-gradient(135deg, hsl(245 80% 88%) 0%, hsl(235 75% 78%) 60%, hsl(225 70% 70%) 100%)",
  },
  blush: {
    background:
      "linear-gradient(135deg, hsl(340 70% 88%) 0%, hsl(20 80% 84%) 60%, hsl(35 80% 80%) 100%)",
  },
  sand: {
    background:
      "linear-gradient(135deg, hsl(40 60% 92%) 0%, hsl(30 50% 84%) 60%, hsl(20 45% 78%) 100%)",
  },
};

export function PhotoCard({
  image,
  eyebrow,
  title,
  description,
  meta,
  badge,
  footer,
  onClick,
  aspect = "video",
  tone = "navy",
  className,
  children,
}: PhotoCardProps) {
  const interactive = !!onClick;
  return (
    <article
      onClick={onClick}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-border/60 bg-card shadow-elegant transition-all duration-500",
        interactive &&
          "cursor-pointer hover:-translate-y-1 hover:shadow-premium focus-within:-translate-y-1",
        className
      )}
    >
      {/* Image / gradient surface */}
      <div className={cn("relative overflow-hidden", ASPECT[aspect])}>
        <div
          className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          style={image ? { backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center" } : TONE[tone]}
        />
        {/* Editorial gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-transparent mix-blend-overlay" />

        {badge && (
          <div className="absolute right-4 top-4 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
            {badge}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-5 text-white">
          {eyebrow && (
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/80">
              {eyebrow}
            </div>
          )}
          <h3 className="font-display text-xl font-bold leading-tight tracking-tight sm:text-2xl">
            {title}
          </h3>
          {description && (
            <p className="line-clamp-2 text-[13px] leading-relaxed text-white/85">
              {description}
            </p>
          )}
        </div>
      </div>

      {(meta || children || footer) && (
        <div className="flex flex-1 flex-col gap-3 p-5">
          {meta && <div className="text-xs text-muted-foreground">{meta}</div>}
          {children}
          {footer && <div className="mt-auto pt-2">{footer}</div>}
        </div>
      )}
    </article>
  );
}
