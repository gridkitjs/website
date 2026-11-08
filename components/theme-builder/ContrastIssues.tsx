"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/components/ui/cn";
import { WarningIcon } from "@/components/ui/icons";
import type { ContrastIssue } from "@/lib/theme-builder/contrast";
import { tokenLabel } from "@/lib/theme-builder/manifest";

interface ContrastIssuesProps {
  issues: readonly ContrastIssue[];
  /** The ratio they fall short of. */
  minimum: number;
  className?: string;
}

/** Contrast pairs that fall short, one line each with its ratio. */
export function ContrastIssues({
  issues,
  minimum,
  className,
}: ContrastIssuesProps) {
  const t = useTranslations("themeBuilder.controls");

  return (
    <ul className={cn("space-y-1", className)}>
      {issues.map(({ side, text, background, ratio }) => (
        <li
          key={`${side} ${text} ${background}`}
          className="text-site-warning flex gap-1.5 text-xs"
        >
          <WarningIcon className="mt-px size-3.5 shrink-0" />
          {t("contrast.issue", {
            side: t(`fields.${side}`),
            text: tokenLabel(text),
            background: tokenLabel(background),
            ratio: ratio.toFixed(2),
            minimum,
          })}
        </li>
      ))}
    </ul>
  );
}
