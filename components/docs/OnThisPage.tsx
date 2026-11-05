import type { TocEntry } from "@/lib/docs/toc";
import { ChevronRightIcon } from "@/components/ui/icons";

interface OnThisPageProps {
  toc: TocEntry[];
  label: string;
}

function entryLink(entry: TocEntry) {
  return (
    <a
      href={`#${entry.id}`}
      className="text-site-ink-muted hover:text-site-ink block py-1 text-sm transition-colors"
    >
      {entry.title}
    </a>
  );
}

function TocList({ toc }: { toc: TocEntry[] }) {
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

/** The page's headings in a column beside the article, from `xl` up. */
export function OnThisPage({ toc, label }: OnThisPageProps) {
  if (toc.length === 0) return null;

  return (
    <aside className="hidden xl:sticky xl:top-24 xl:block xl:self-start">
      <nav aria-label={label}>
        <p className="text-site-ink-muted mb-3 text-xs font-semibold tracking-wide uppercase">
          {label}
        </p>
        <TocList toc={toc} />
      </nav>
    </aside>
  );
}

/** The same headings, collapsed at the top of the article below `xl`. */
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
