"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { TocEntry } from "@/lib/docs/toc";
import { cn } from "@/components/ui/cn";
import { ChevronRightIcon } from "@/components/ui/icons";
import { revealInScrollParent } from "./revealInScrollParent";
import { useActiveHeading } from "./useActiveHeading";

interface OnThisPageProps {
  toc: TocEntry[];
  label: string;
}

interface TocListProps {
  toc: TocEntry[];
  activeId?: string;
  activeLinkRef?: RefObject<HTMLAnchorElement | null>;
}

function TocList({ toc, activeId, activeLinkRef }: TocListProps) {
  function entryLink(entry: TocEntry) {
    const active = entry.id === activeId;
    return (
      <a
        ref={active ? activeLinkRef : undefined}
        href={`#${entry.id}`}
        aria-current={active ? "location" : undefined}
        className={cn(
          "block py-1 text-sm transition-colors",
          active
            ? "text-site-accent font-medium"
            : "text-site-ink-muted hover:text-site-ink",
        )}
      >
        {entry.title}
      </a>
    );
  }

  return (
    <ul className="border-site-line space-y-1 border-l">
      {toc.map((entry) => (
        <li key={entry.id} className="pl-3">
          {entryLink(entry)}
          {entry.children.length > 0 && (
            <ul className="space-y-1">
              {entry.children.map((child) => (
                <li key={child.id} className="pl-3">
                  {entryLink(child)}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

function headingIds(toc: TocEntry[]): string[] {
  return toc.flatMap((entry) => [entry.id, ...headingIds(entry.children)]);
}

/**
 * The page's headings in a column beside the article, from `xl` up, with
 * the one being read highlighted.
 */
export function OnThisPage({ toc, label }: OnThisPageProps) {
  const activeId = useActiveHeading(headingIds(toc));
  const activeLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (activeLinkRef.current) revealInScrollParent(activeLinkRef.current);
  }, [activeId]);

  if (toc.length === 0) return null;

  // Scrolls on its own once taller than the viewport below the header; the
  // negative margin keeps link focus rings clear of its clipping.
  return (
    <aside className="hidden xl:sticky xl:top-24 xl:-m-2 xl:block xl:max-h-[calc(100vh-7.5rem)] xl:self-start xl:overflow-y-auto xl:p-2">
      <nav aria-label={label}>
        <p className="text-site-ink-muted mb-3 text-xs font-semibold tracking-wide uppercase">
          {label}
        </p>
        <TocList toc={toc} activeId={activeId} activeLinkRef={activeLinkRef} />
      </nav>
    </aside>
  );
}

/**
 * The same headings, collapsed at the top of the article below `xl`. No
 * highlight: it sits above the content, out of view while reading.
 */
export function OnThisPageDisclosure({ toc, label }: OnThisPageProps) {
  if (toc.length === 0) return null;

  return (
    <details className="group border-site-line rounded-site mt-6 border xl:hidden">
      <summary className="text-site-ink flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
        {label}
        <ChevronRightIcon className="text-site-ink-muted size-4 transition-transform group-open:rotate-90" />
      </summary>
      <nav aria-label={label} className="px-4 pb-3">
        <TocList toc={toc} />
      </nav>
    </details>
  );
}
