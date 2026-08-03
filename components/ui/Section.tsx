import type { ReactNode } from "react";
import { cn } from "./cn";

const variantClasses = {
  default: "bg-site-bg text-site-ink",
  muted: "bg-site-surface text-site-ink",
  inverted: "bg-site-bg-inverted text-site-ink-inverted",
  gradient:
    "bg-[radial-gradient(ellipse_120%_50%_at_50%_0%,color-mix(in_oklch,var(--site-accent)_18%,var(--site-bg-inverted))_0%,var(--site-bg-inverted)_70%)] sm:bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,color-mix(in_oklch,var(--site-accent)_18%,var(--site-bg-inverted))_0%,var(--site-bg-inverted)_70%)] text-site-ink-inverted",
} as const;

export function Section({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: keyof typeof variantClasses;
  className?: string;
}) {
  return (
    <section className={cn(variantClasses[variant], className)}>
      {children}
    </section>
  );
}
