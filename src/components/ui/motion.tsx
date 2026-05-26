import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared motion system. Mix with CSS `.tap` / `.lift` utilities for consistency.
 * - MotionButton: spring tap + hover for key CTAs
 * - MotionCard: lift + soft scale on hover
 * - FadeIn / StaggerList: entrance animations
 */

const spring = { type: "spring", stiffness: 380, damping: 26, mass: 0.6 } as const;

export const MotionButton = forwardRef<HTMLButtonElement, HTMLMotionProps<"button">>(
  ({ className, children, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={spring}
      className={cn("tap inline-flex items-center justify-center gap-2", className)}
      {...props}
    >
      {children}
    </motion.button>
  ),
);
MotionButton.displayName = "MotionButton";

export const MotionCard = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ className, children, ...props }, ref) => (
    <motion.div
      ref={ref}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className={cn("lift", className)}
      {...props}
    >
      {children}
    </motion.div>
  ),
);
MotionCard.displayName = "MotionCard";

const fadeVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 240, damping: 26 } },
};

export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="show"
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

export function StaggerList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show" className={className}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={fadeVariants} className={className}>
      {children}
    </motion.div>
  );
}
