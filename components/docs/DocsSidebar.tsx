"use client";

import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import { docsNav } from "@/lib/routes";
import { cn } from "@/components/ui/cn";

export function DocsSidebar() {
  const t = useTranslations("docs");
  const pathname = usePathname();

  function pageLink(page: { path: string; navLabelKey: string }) {
    const href = `/docs/${page.path}`;
    const active = pathname === href;
    return (
      <li key={page.path}>
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
          {t(page.navLabelKey)}
        </Link>
      </li>
    );
  }

  return (
    <nav aria-label="Docs" className="space-y-8">
      {docsNav.map((section) => (
        <div key={section.path}>
          <p className="text-site-ink-muted text-xs font-semibold tracking-wide uppercase">
            {t(section.navLabelKey)}
          </p>
          <ul className="mt-3 space-y-1">
            {section.pages.map((page) => pageLink(page))}
          </ul>
          {section.groups?.map((group) => (
            <div key={group.navLabelKey} className="mt-4 pl-3">
              <p className="text-site-ink-muted/80 text-xs font-medium">
                {t(group.navLabelKey)}
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
