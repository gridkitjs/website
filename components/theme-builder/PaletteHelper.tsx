"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { buttonClasses } from "@/components/ui/Button";
import { formatOklch, type Oklch } from "@/lib/theme-builder/color";
import type { ColorReader } from "@/lib/theme-builder/contrast";
import {
  COLOR_SIDES,
  tokenLabel,
  type Token,
} from "@/lib/theme-builder/manifest";
import {
  ACCENT,
  ACCENT_TOKENS,
  proposePalette,
} from "@/lib/theme-builder/palette";
import { resolvedColor } from "@/lib/theme-builder/resolve";
import { defaultTheme, type Theme } from "@/lib/theme-builder/theme";
import { OklchSliders } from "./fields/OklchSliders";
import { cssValue, TextField } from "./fields/TextField";

interface PaletteHelperProps {
  tokens: readonly Token[];
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  readColor: ColorReader;
}

/**
 * Proposes the accent colours of both palettes from one accent, for you to
 * apply or not. It starts from the theme's light accent; its hue and
 * chroma carry over, and each colour keeps its default lightness.
 */
export function PaletteHelper({
  tokens,
  theme,
  onThemeChange,
  readColor,
}: PaletteHelperProps) {
  const t = useTranslations("themeBuilder.controls");
  const accentId = useId();
  const [picked, setPicked] = useState<Oklch>();

  const read = (from: Theme) => {
    const value = resolvedColor(from, tokens, ACCENT, "light");
    return value === undefined ? undefined : readColor(value);
  };
  const accent = picked ?? read(theme) ?? read(defaultTheme(tokens));
  const proposal =
    accent === undefined ? undefined : proposePalette(accent, tokens);
  if (accent === undefined || proposal === undefined) {
    return null;
  }

  return (
    <section aria-labelledby="theme-palette">
      <h2
        id="theme-palette"
        className="text-site-ink text-lg font-semibold tracking-tight"
      >
        {t("palette.heading")}
      </h2>
      <p className="text-site-ink-muted mt-1 mb-3 text-xs">
        {t("palette.intro")}
      </p>
      <div className="border-site-line rounded-site space-y-3 border p-3">
        <div>
          <label htmlFor={accentId} className="text-site-ink-muted text-xs">
            {t("palette.accent")}
          </label>
          <div className="mt-1 flex gap-1.5">
            <span
              aria-hidden="true"
              className="border-site-line rounded-site size-8 shrink-0 border p-0.5"
            >
              <span
                className="rounded-site-sm block size-full"
                style={{ backgroundColor: formatOklch(accent) }}
              />
            </span>
            <TextField
              id={accentId}
              value={formatOklch(accent)}
              onCommit={(text) => {
                const value = cssValue(text, "color");
                const color =
                  value === undefined ? undefined : readColor(value);
                if (color !== undefined) setPicked({ ...color, alpha: 1 });
                return color !== undefined;
              }}
            />
          </div>
        </div>
        <OklchSliders
          color={accent}
          channels={["c", "h"]}
          onChange={setPicked}
        />
        <table className="w-full text-xs">
          <caption className="text-site-ink-muted mb-1 text-left">
            {t("palette.proposal")}
          </caption>
          <thead>
            <tr>
              <td />
              {COLOR_SIDES.map((side) => (
                <th
                  key={side}
                  scope="col"
                  className="text-site-ink-muted pb-1 font-normal"
                >
                  {t(`fields.${side}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ACCENT_TOKENS.map((name) => (
              <tr key={name}>
                <th
                  scope="row"
                  className="text-site-ink py-0.5 pr-2 text-left font-mono font-normal"
                >
                  {tokenLabel(name)}
                </th>
                {COLOR_SIDES.map((side) => (
                  <td key={side} className="px-0.5 py-0.5">
                    <span
                      title={proposal[name][side]}
                      className="border-site-line rounded-site-sm block h-5 border"
                      style={{ backgroundColor: proposal[name][side] }}
                    />
                    <span className="sr-only">{proposal[name][side]}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          onClick={() => {
            onThemeChange({ ...theme, ...proposal });
          }}
          className={buttonClasses("secondary", "w-full py-1.5 text-xs")}
        >
          {t("palette.apply")}
        </button>
      </div>
    </section>
  );
}
