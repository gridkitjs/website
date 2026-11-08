"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/components/ui/cn";
import { formatOklch, parseOklch, type Oklch } from "@/lib/theme-builder/color";
import type { ColorReader, ContrastIssue } from "@/lib/theme-builder/contrast";
import {
  COLOR_SIDES,
  tokenLabel,
  type ColorPair,
  type ColorSide,
  type ColorToken,
  type Token,
} from "@/lib/theme-builder/manifest";
import { resolvedColor } from "@/lib/theme-builder/resolve";
import { colorValue, type Theme } from "@/lib/theme-builder/theme";
import { ContrastIssues } from "./ContrastIssues";
import { OklchSliders } from "./fields/OklchSliders";
import { cssValue, TextField } from "./fields/TextField";
import { PALETTE_CLASSES } from "./ThemePreview";

const BLACK: Oklch = { l: 0, c: 0, h: 0, alpha: 1 };

interface ColorControlProps {
  token: ColorToken;
  tokens: readonly Token[];
  theme: Theme;
  onChange: (value: ColorPair) => void;
  readColor: ColorReader;
  /** The contrast pairs this colour is part of that fall short. */
  issues: readonly ContrastIssue[];
  /** The ratio the pairs fall short of. */
  minimum: number;
  /** The ids of what labels and describes the token. */
  labelledBy: string;
  describedBy: string;
}

/**
 * A colour token's value in each palette: a swatch, which opens oklch
 * sliders, and a text field that takes any CSS colour. The swatch shows
 * the token as the pinned palette resolves it, so a value that reads
 * another token shows the colour it ends up as.
 */
export function ColorControl({
  token,
  tokens,
  theme,
  onChange,
  readColor,
  issues,
  minimum,
  labelledBy,
  describedBy,
}: ColorControlProps) {
  const t = useTranslations("themeBuilder.controls");
  const sliderId = useId();
  const sideIds = { light: useId(), dark: useId() };
  const [adjusting, setAdjusting] = useState<ColorSide>();
  const pair = colorValue(theme, token);
  const label = tokenLabel(token.name);

  function setSide(side: ColorSide, value: string) {
    onChange({ ...pair, [side]: value });
  }

  /** Where the sliders start: the value, or what it resolves to. */
  function sliderColor(side: ColorSide): Oklch {
    const resolved = resolvedColor(theme, tokens, token.name, side);
    return (
      parseOklch(pair[side]) ??
      (resolved === undefined ? undefined : readColor(resolved)) ??
      BLACK
    );
  }

  return (
    <div>
      <div className="space-y-1.5">
        {COLOR_SIDES.map((side) => (
          <div key={side} className="flex items-center gap-1.5">
            <span
              id={sideIds[side]}
              className="text-site-ink-muted w-9 shrink-0 text-xs"
            >
              {t(`fields.${side}`)}
            </span>
            <button
              type="button"
              aria-expanded={adjusting === side}
              aria-controls={sliderId}
              aria-label={t("fields.adjust", {
                token: label,
                side: t(`fields.${side}`),
              })}
              onClick={() => {
                setAdjusting(adjusting === side ? undefined : side);
              }}
              className={cn(
                "border-site-line rounded-site size-8 shrink-0 border p-0.5",
                adjusting === side && "border-site-accent",
              )}
            >
              <span
                className={cn(
                  PALETTE_CLASSES[side],
                  "rounded-site-sm block size-full",
                )}
                style={{
                  color: "var(--gridkit-fg)",
                  backgroundColor: `var(${token.name})`,
                }}
              />
            </button>
            <TextField
              value={pair[side]}
              onCommit={(text) => {
                const value = cssValue(text, "color");
                if (value !== undefined) setSide(side, value);
                return value !== undefined;
              }}
              aria-labelledby={`${labelledBy} ${sideIds[side]}`}
              aria-describedby={describedBy}
            />
          </div>
        ))}
      </div>
      {adjusting !== undefined && (
        <div
          id={sliderId}
          role="group"
          aria-label={t("fields.adjust", {
            token: label,
            side: t(`fields.${adjusting}`),
          })}
          className="border-site-line bg-site-surface rounded-site mt-2 border p-2"
        >
          <OklchSliders
            color={sliderColor(adjusting)}
            onChange={(color) => {
              setSide(adjusting, formatOklch(color));
            }}
          />
        </div>
      )}
      {issues.length > 0 && (
        <ContrastIssues issues={issues} minimum={minimum} className="mt-2" />
      )}
    </div>
  );
}
