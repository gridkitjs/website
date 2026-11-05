"use client";

import type { ComponentProps } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/components/ui/cn";
import { Kbd } from "@/components/ui/Kbd";
import { SearchIcon } from "@/components/ui/icons";
import { useShortcutModifier } from "./shortcut";
import { openSearchDialog, useSearchDialogOpen } from "./useSearchDialog";
import { preloadSearchIndex } from "./useSearchIndex";

const VARIANT_CLASSES = {
  // An icon on phones; from `sm`, a field-like button with the shortcut.
  header:
    "text-site-ink hover:opacity-70 sm:border-site-line sm:bg-site-surface sm:text-site-ink-muted sm:hover:border-site-line-strong sm:hover:text-site-ink sm:rounded-site sm:h-8 sm:border sm:px-2.5 sm:hover:opacity-100",
  // Matches the docs bar's Menu button.
  bar: "text-site-ink hover:text-site-accent rounded-site -mr-2 px-2 py-1.5 font-medium",
} as const;

interface SearchTriggerProps extends ComponentProps<"button"> {
  variant?: keyof typeof VARIANT_CLASSES;
}

/** Opens the search dialog, and starts loading the index on hover or focus. */
export function SearchTrigger({
  variant = "header",
  className,
  ...props
}: SearchTriggerProps) {
  const t = useTranslations("search");
  const open = useSearchDialogOpen();
  const modifier = useShortcutModifier();
  const isHeader = variant === "header";

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-keyshortcuts={modifier === "cmd" ? "Meta+K /" : "Control+K /"}
      onClick={openSearchDialog}
      onPointerEnter={preloadSearchIndex}
      onFocus={preloadSearchIndex}
      className={cn(
        "inline-flex items-center gap-2 text-sm transition",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      <SearchIcon className={cn("size-5", isHeader && "sm:size-4")} />
      <span className={cn(isHeader && "sr-only sm:not-sr-only")}>
        {t("trigger")}
      </span>
      {isHeader && (
        // `aria-keyshortcuts` already announces the shortcut.
        <span aria-hidden="true" className="hidden gap-1 sm:inline-flex">
          <Kbd>{t(`keys.${modifier}`)}</Kbd>
          <Kbd>{t("keys.k")}</Kbd>
        </span>
      )}
    </button>
  );
}
