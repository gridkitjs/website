"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/components/ui/cn";

interface Section {
  href: string;
  /** Its key under `common.nav`. */
  label: string;
  className?: string;
}

const SECTIONS: readonly Section[] = [
  { href: "/docs", label: "docs" },
  { href: "/changelog", label: "changelog" },
  // Shown once there is room for it; phones reach it from the footer.
  {
    href: "/theme-builder",
    label: "themeBuilder",
    className: "hidden md:inline",
  },
];

/** The header's section links, marking the one the current page belongs to. */
export function HeaderNav() {
  const t = useTranslations("common.nav");
  const pathname = usePathname();

  return SECTIONS.map(({ href, label, className }) => {
    const current = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        key={href}
        href={href}
        aria-current={current ? "page" : undefined}
        className={cn(
          "text-sm font-medium transition-opacity hover:opacity-70",
          current ? "text-site-accent" : "text-site-ink",
          className,
        )}
      >
        {t(label)}
      </Link>
    );
  });
}
