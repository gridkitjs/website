import type { ComponentProps } from "react";
import { cn } from "@/components/ui/cn";
import { ArrowRightIcon } from "@/components/ui/icons";
import { DocLink } from "./DocLink";

/** A grid of `<LinkCard>`s, e.g. a page's "next steps". */
export function LinkCards({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("my-6 grid gap-4 sm:grid-cols-2", className)}
      {...props}
    />
  );
}

interface LinkCardProps extends Omit<ComponentProps<"a">, "title"> {
  href: string;
  title: string;
  description?: string;
}

export function LinkCard({
  title,
  description,
  className,
  ...props
}: LinkCardProps) {
  return (
    <DocLink
      className={cn(
        "group border-site-line bg-site-surface-raised hover:border-site-accent rounded-site block border p-4 transition-colors",
        className,
      )}
      {...props}
    >
      {/* Spans, not paragraphs: Prose restyles every p as body text. */}
      <span className="text-site-ink group-hover:text-site-accent flex items-center justify-between gap-2 font-medium transition-colors">
        {title}
        <ArrowRightIcon className="size-4 shrink-0" />
      </span>
      {description && (
        <span className="text-site-ink-muted mt-1 block text-sm leading-relaxed">
          {description}
        </span>
      )}
    </DocLink>
  );
}
