"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/components/ui/cn";

const SECTIONS = [
  { href: "/docs", label: "docs" },
  { href: "/changelog", label: "changelog" },
] as const;

/** The header's section links, marking the one the current page belongs to. */
export function HeaderNav() {
  const t = useTranslations("common.nav");
  const pathname = usePathname();

  return SECTIONS.map(({ href, label }) => {
    const current = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        key={href}
        href={href}
        aria-current={current ? "page" : undefined}
        className={cn(
          "text-sm font-medium transition-opacity hover:opacity-70",
          current ? "text-site-accent" : "text-site-ink",
        )}
      >
        {t(label)}
      </Link>
    );
  });
}
