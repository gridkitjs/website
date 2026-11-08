"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/components/ui/cn";
import { COLOR_SIDES, type ColorSide } from "@/lib/theme-builder/manifest";
import { PreviewGrid } from "./PreviewGrid";

const PALETTE_CLASSES = {
  light: "gridkit-light",
  dark: "gridkit-dark",
} as const satisfies Record<ColorSide, string>;

/**
 * The theme on two grids, one pinned to each palette with the grid's own
 * `.gridkit-light` and `.gridkit-dark`, so the site's theme toggle moves
 * neither; menus a grid opens carry its class too. Side by side once the
 * preview is wide enough for both, and one at a time, picked by a toggle,
 * below that. Each frame takes its palette's surface and text colour, as an
 * app's page would, since cells inherit the text colour.
 */
export function ThemePreview() {
  const t = useTranslations("themeBuilder.preview");
  const [shown, setShown] = useState<ColorSide>("light");

  return (
    <section aria-labelledby="theme-preview" className="@container">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2
          id="theme-preview"
          className="text-site-ink text-lg font-semibold tracking-tight"
        >
          {t("heading")}
        </h2>
        <div
          role="group"
          aria-label={t("mode")}
          className="border-site-line rounded-site inline-flex overflow-hidden border text-xs @4xl:hidden"
        >
          {COLOR_SIDES.map((side) => (
            <button
              key={side}
              type="button"
              aria-pressed={shown === side}
              onClick={() => {
                setShown(side);
              }}
              className={cn(
                "px-3 py-1.5 transition-colors",
                shown === side
                  ? "bg-site-accent text-site-accent-ink"
                  : "text-site-ink hover:bg-site-surface",
              )}
            >
              {t(side)}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 @4xl:grid-cols-2">
        {COLOR_SIDES.map((side) => (
          <figure
            key={side}
            className={cn(
              "border-site-line rounded-site overflow-hidden border",
              side !== shown && "hidden @4xl:block",
            )}
          >
            <figcaption className="text-site-ink-muted border-site-line bg-site-surface border-b px-3 py-1.5 text-xs font-medium">
              {t(side)}
            </figcaption>
            <div
              className={cn(
                PALETTE_CLASSES[side],
                "bg-gridkit-surface text-gridkit-fg p-3",
              )}
            >
              <PreviewGrid
                label={t(`gridLabel.${side}`)}
                toolbarLabel={t("toolbarLabel")}
              />
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}
