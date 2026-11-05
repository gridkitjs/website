import type { ComponentProps } from "react";
import { getTranslations } from "next-intl/server";
import { cn } from "@/components/ui/cn";

interface SinceProps extends ComponentProps<"span"> {
  /** The version that introduced the feature, e.g. `0.12.0`. */
  v: string;
  /** The package it shipped in, without the scope: `react`, `core`, … */
  pkg?: string;
}

/** An inline "since version" badge: `<Since v="0.12.0" pkg="react" />`. */
export async function Since({ v, pkg, className, ...props }: SinceProps) {
  const t = await getTranslations("docs.content");

  return (
    <span
      className={cn(
        "border-site-line text-site-ink-muted rounded-site-sm inline-flex items-center border px-1.5 align-middle font-mono text-xs leading-5 font-medium whitespace-nowrap tabular-nums",
        className,
      )}
      {...props}
    >
      {pkg
        ? t("sinceInPackage", { pkg, version: v })
        : t("since", { version: v })}
    </span>
  );
}
