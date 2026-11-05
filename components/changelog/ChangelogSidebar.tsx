"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import type { ChangelogSection } from "@/lib/changelog/source";
import { cn } from "@/components/ui/cn";
import { SidebarSection } from "@/components/docs/SidebarGroup";
import { revealInScrollParent } from "@/components/docs/revealInScrollParent";
import { useOpenNavGroups } from "@/components/docs/useOpenNavGroups";

/** The `sessionStorage` key holding which changelog packages are open. */
export const CHANGELOG_NAV_STORAGE_KEY = "gk-changelog-nav";

/** The latest version (index 0) lives at the bare package URL; older versions get their own version segment. */
function versionHref(section: ChangelogSection, index: number): string {
  return index === 0
    ? `/changelog/${section.slug}`
    : `/changelog/${section.slug}/${section.versions[index].version}`;
}

/** The open-state key of the package whose page is at `pathname`; empty on the index. */
function activeSectionKeys(
  sections: ChangelogSection[],
  pathname: string,
): string[] {
  const section = sections.find(
    (candidate) =>
      pathname === `/changelog/${candidate.slug}` ||
      pathname.startsWith(`/changelog/${candidate.slug}/`),
  );
  return section ? [section.slug] : [];
}

export function ChangelogSidebar({
  sections,
}: {
  sections: ChangelogSection[];
}) {
  const t = useTranslations("changelog.nav");
  const pathname = usePathname();
  const activeKeys = useMemo(
    () => activeSectionKeys(sections, pathname),
    [sections, pathname],
  );
  const { isOpen, toggle, restored } = useOpenNavGroups(
    CHANGELOG_NAV_STORAGE_KEY,
    activeKeys,
  );
  const idPrefix = useId();
  const activeLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (restored && activeLinkRef.current) {
      revealInScrollParent(activeLinkRef.current);
    }
  }, [pathname, restored]);

  return (
    <nav aria-label={t("label")} className="space-y-6">
      {sections.map((section) => (
        <SidebarSection
          key={section.slug}
          id={`${idPrefix}-${section.slug}`}
          open={isOpen(section.slug)}
          onToggle={() => {
            toggle(section.slug);
          }}
          toggleLabel={t("toggle", { title: section.title })}
          heading={
            <Link
              href={`/changelog/${section.slug}`}
              className="text-site-ink hover:text-site-accent flex flex-1 items-baseline justify-between gap-2 text-xs font-semibold tracking-wide uppercase transition-colors"
            >
              {section.title}
              {section.versions[0] && (
                <span className="text-site-ink-muted font-mono font-normal tracking-normal normal-case">
                  v{section.versions[0].version}
                </span>
              )}
            </Link>
          }
        >
          <ul className="space-y-1">
            {section.versions.map((version, index) => {
              const href = versionHref(section, index);
              const active = pathname === href;
              return (
                <li key={version.version}>
                  <Link
                    ref={active ? activeLinkRef : undefined}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-site block px-3 py-1.5 text-sm transition-colors",
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
        </SidebarSection>
      ))}
    </nav>
  );
}
