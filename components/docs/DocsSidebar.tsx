"use client";

import { usePathname, Link } from "@/i18n/navigation";
import type { DocSectionNode } from "@/lib/docs/source";
import { cn } from "@/components/ui/cn";

export function DocsSidebar({ sections }: { sections: DocSectionNode[] }) {
  const pathname = usePathname();

  function pageLink(page: { slug: string; title: string }) {
    const href = `/docs/${page.slug}`;
    const active = pathname === href;
    return (
      <li key={page.slug}>
        <Link
          href={href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "block rounded-md px-3 py-1.5 text-sm transition-colors",
            active
              ? "bg-site-surface text-site-ink font-medium"
              : "text-site-ink-muted hover:text-site-ink",
          )}
        >
          {page.title}
        </Link>
      </li>
    );
  }

  return (
    <nav aria-label="Docs" className="space-y-8">
      {sections.map((section) => (
        <div key={section.slug}>
          <p className="text-site-ink-muted text-xs font-semibold tracking-wide uppercase">
            {section.title}
          </p>
          <ul className="mt-3 space-y-1">
            {section.pages.map((page) => pageLink(page))}
          </ul>
          {section.groups.map((group) => (
            <div key={group.key} className="mt-4 pl-3">
              <p className="text-site-ink-muted/80 text-xs font-medium">
                {group.title}
              </p>
              <ul className="mt-2 space-y-1">
                {group.pages.map((page) => pageLink(page))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </nav>
  );
}
