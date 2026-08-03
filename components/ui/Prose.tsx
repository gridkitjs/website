import type { ReactNode } from "react";
import { cn } from "./cn";

export function Prose({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-none",
        "[&_p]:text-site-ink-muted [&_p]:leading-relaxed [&_p+p]:mt-4",
        "[&_h2]:text-site-ink [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:scroll-mt-20 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight",
        "[&_h3]:text-site-ink [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:scroll-mt-20 [&_h3]:text-lg [&_h3]:font-semibold",
        "[&_.anchor-link]:text-site-ink-muted [&_.anchor-link]:ml-2 [&_.anchor-link]:no-underline [&_.anchor-link]:opacity-0 [&_h2:hover_.anchor-link]:opacity-100 [&_h3:hover_.anchor-link]:opacity-100",
        className,
      )}
    >
      {children}
    </div>
  );
}
