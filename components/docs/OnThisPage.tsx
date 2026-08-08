import type { TocEntry } from "@/lib/docs/toc";

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

export function OnThisPage({ toc, label }: { toc: TocEntry[]; label: string }) {
  if (toc.length === 0) return null;

  return (
    <aside className="hidden xl:sticky xl:top-24 xl:block xl:self-start">
      <nav aria-label="On this page">
        <p className="text-site-ink-muted text-xs font-semibold tracking-wide uppercase">
          {label}
        </p>
        <ul className="border-site-line mt-3 space-y-1 border-l">
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
      </nav>
    </aside>
  );
}
