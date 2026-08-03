"use client";

import { usePathname, Link } from "@/i18n/navigation";
import type { ChangelogSection } from "@/lib/changelog/source";
import { cn } from "@/components/ui/cn";

/** The latest version (index 0) lives at the bare package URL; older versions get their own version segment. */
function versionHref(section: ChangelogSection, index: number): string {
  return index === 0
    ? `/changelog/${section.slug}`
    : `/changelog/${section.slug}/${section.versions[index].version}`;
}

export function ChangelogSidebar({
  sections,
}: {
  sections: ChangelogSection[];
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Changelog" className="space-y-8">
      {sections.map((section) => (
        <div key={section.slug}>
          <p className="text-site-ink-muted text-xs font-semibold tracking-wide uppercase">
            {section.title}
          </p>
          <ul className="mt-3 space-y-1">
            {section.versions.map((version, index) => {
              const href = versionHref(section, index);
              const active = pathname === href;
              return (
                <li key={version.version}>
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
                    v{version.version}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
