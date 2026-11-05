import type { ReactNode } from "react";
import { cn } from "./cn";

const variantClasses = {
  default: "bg-site-bg text-site-ink",
  muted: "bg-site-surface text-site-ink",
  inverted: "bg-site-bg-inverted text-site-ink-inverted",
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
