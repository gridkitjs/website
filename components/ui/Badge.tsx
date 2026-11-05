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
        "border-site-line text-site-ink-muted rounded-site-sm inline-flex items-center border px-2 py-0.5 text-xs font-medium tracking-wide uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}
