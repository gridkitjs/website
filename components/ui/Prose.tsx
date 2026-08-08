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
        "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-3 [&_ul]:pl-6",
        "[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-3 [&_ol]:pl-6",
        "[&_li]:text-site-ink-muted [&_li]:leading-relaxed [&_li]:pl-1 [&_li_p]:inline [&_li::marker]:text-site-ink-muted",
        "[&_ul_ul]:mt-3 [&_ul_ul]:mb-1 [&_ol_ol]:mt-3 [&_ol_ol]:mb-1",
        "[&_code]:bg-site-surface [&_code]:text-site-ink [&_code]:rounded [&_code]:border [&_code]:border-site-line [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]",
        "[&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_strong]:text-site-ink [&_strong]:font-semibold",
        className,
      )}
    >
      {children}
    </div>
  );
}
