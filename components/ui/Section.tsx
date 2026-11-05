import type { ComponentProps } from "react";
import { cn } from "./cn";

const variantClasses = {
  default: "bg-site-bg text-site-ink",
  muted: "bg-site-surface text-site-ink",
  inverted: "bg-site-bg-inverted text-site-ink-inverted",
} as const;

interface SectionProps extends ComponentProps<"section"> {
  variant?: keyof typeof variantClasses;
}

export function Section({
  variant = "default",
  className,
  ...props
}: SectionProps) {
  return (
    <section className={cn(variantClasses[variant], className)} {...props} />
  );
}
