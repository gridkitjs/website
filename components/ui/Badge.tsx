import type { ReactNode } from "react";
import { cn } from "./cn";

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "border-site-line text-site-ink-muted inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}
