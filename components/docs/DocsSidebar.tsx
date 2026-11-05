"use client";

import { useEffect, useId, useMemo, useRef, type ComponentProps } from "react";
import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import {
  activeNavKeys,
  type DocsNavPage,
  type DocsNavSection,
} from "@/lib/docs/nav";
import { cn } from "@/components/ui/cn";
import { SidebarGroup, SidebarSection } from "./SidebarGroup";
import { revealInScrollParent } from "./revealInScrollParent";
import { DOCS_NAV_STORAGE_KEY, useOpenNavGroups } from "./useOpenNavGroups";

interface DocsSidebarProps extends ComponentProps<"nav"> {
  sections: DocsNavSection[];
  /** Each package's latest version on npm, keyed by section slug. */
  latestVersions: Record<string, string>;
}

export function DocsSidebar({
  sections,
  latestVersions,
  className,
  ...props
}: DocsSidebarProps) {
  const t = useTranslations("docs.nav");
  const pathname = usePathname();
  const activeKeys = useMemo(
    () => activeNavKeys(sections, pathname),
    [sections, pathname],
  );
  const { isOpen, toggle, restored } = useOpenNavGroups(
    DOCS_NAV_STORAGE_KEY,
    activeKeys,
  );
  // The drawer and the inline sidebar can both be on the page; their list
  // ids must not collide.
  const idPrefix = useId();
  const activeLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (restored && activeLinkRef.current) {
      revealInScrollParent(activeLinkRef.current);
    }
  }, [pathname, restored]);

  function pageLink(page: DocsNavPage, section: DocsNavSection) {
    const href = `/docs/${page.slug}`;
    const active = pathname === href;
    return (
      <li key={page.slug}>
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
          {/* The section label already names the package. */}
          {page.slug === section.slug ? t("overview") : page.title}
        </Link>
      </li>
    );
  }

  return (
    <nav
      aria-label={t("label")}
      className={cn("space-y-6", className)}
      {...props}
    >
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
              href={`/docs/${section.slug}`}
              className="text-site-ink hover:text-site-accent flex flex-1 items-baseline justify-between gap-2 text-xs font-semibold tracking-wide uppercase transition-colors"
            >
              {section.title}
              {latestVersions[section.slug] && (
                <span className="text-site-ink-muted font-mono font-normal tracking-normal normal-case">
                  v{latestVersions[section.slug]}
                </span>
              )}
            </Link>
          }
        >
          <ul className="space-y-1">
            {section.pages.map((page) => pageLink(page, section))}
          </ul>
          {section.groups.map((group) => (
            <SidebarGroup
              key={group.key}
              id={`${idPrefix}-${group.key}`}
              title={group.title}
              open={isOpen(group.key)}
              onToggle={() => {
                toggle(group.key);
              }}
            >
              {group.pages.map((page) => pageLink(page, section))}
            </SidebarGroup>
          ))}
        </SidebarSection>
      ))}
    </nav>
  );
}
