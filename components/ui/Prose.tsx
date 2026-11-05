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
        "[&_p]:text-site-ink [&_p]:leading-relaxed [&_p+p]:mt-4",
        // A hairline above each h2 marks a new section, so h2 and h3 differ by
        // more than size.
        "[&_h2]:text-site-ink [&_h2]:border-site-line [&_h2]:mt-14 [&_h2]:mb-4 [&_h2]:scroll-mt-20 [&_h2]:border-t [&_h2]:pt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight",
        "[&_h3]:text-site-ink [&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:scroll-mt-20 [&_h3]:text-lg [&_h3]:font-semibold",
        "[&_h4]:text-site-ink [&_h4]:mt-8 [&_h4]:mb-2 [&_h4]:scroll-mt-20 [&_h4]:text-base [&_h4]:font-semibold",
        // Anchors show on hover and keyboard focus; touch screens get no
        // hover, so there they stay faintly visible.
        "[&_.anchor-link]:text-site-ink-muted [&_.anchor-link]:ml-2 [&_.anchor-link]:no-underline [&_.anchor-link]:opacity-0 [&_.anchor-link]:transition-opacity",
        "[&_h2:focus-within_.anchor-link]:opacity-100 [&_h2:hover_.anchor-link]:opacity-100 [&_h3:focus-within_.anchor-link]:opacity-100 [&_h3:hover_.anchor-link]:opacity-100 [&_h4:focus-within_.anchor-link]:opacity-100 [&_h4:hover_.anchor-link]:opacity-100 [@media(hover:none)]:[&_.anchor-link]:opacity-50",
        "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-3 [&_ul]:pl-6",
        "[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-3 [&_ol]:pl-6",
        "[&_li]:text-site-ink [&_li::marker]:text-site-ink-muted [&_li]:pl-1 [&_li]:leading-relaxed [&_li_p]:inline",
        "[&_ol_ol]:mt-3 [&_ol_ol]:mb-1 [&_ul_ul]:mt-3 [&_ul_ul]:mb-1",
        "[&_code]:bg-site-surface [&_code]:text-site-ink [&_code]:border-site-line [&_code]:rounded-site-sm [&_code]:border [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]",
        "[&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_strong]:text-site-ink [&_strong]:font-semibold",
        "[&_blockquote]:border-site-line-strong [&_blockquote_li]:text-site-ink-muted [&_blockquote_p]:text-site-ink-muted [&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:pl-4",
        "[&_hr]:border-site-line [&_hr]:my-10",
        "[&_details]:border-site-line [&_details]:rounded-site [&_details]:my-6 [&_details]:border [&_details]:px-4 [&_details]:py-3 [&_summary+*]:mt-3",
        "[&_summary]:text-site-ink [&_summary]:cursor-pointer [&_summary]:font-medium",
        "[&_img]:border-site-line [&_img]:rounded-site [&_img]:my-6 [&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_img]:border",
        className,
      )}
    >
      {children}
    </div>
  );
}
