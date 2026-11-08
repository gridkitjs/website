import { useMemo } from "react";
import { parseThemeCss } from "@/lib/theme-builder/css";
import { themeToHash } from "@/lib/theme-builder/hash";
import type { Token } from "@/lib/theme-builder/manifest";
import type { Preset } from "@/lib/theme-builder/package";
import type { Theme } from "@/lib/theme-builder/theme";

export interface PresetChoice {
  preset: Preset;
  theme: Theme;
  /** The theme as `themeToHash` writes it, which two equal themes share. */
  hash: string;
}

/** The presets as themes, and the one `theme` matches, if any. */
export function usePresets(
  presets: readonly Preset[],
  tokens: readonly Token[],
  theme: Theme,
) {
  const choices = useMemo(
    () =>
      presets.map((preset): PresetChoice => {
        const presetTheme = parseThemeCss(preset.css, tokens).theme;
        return {
          preset,
          theme: presetTheme,
          hash: themeToHash(presetTheme, tokens),
        };
      }),
    [presets, tokens],
  );
  const hash = themeToHash(theme, tokens);
  const current = choices.find((choice) => choice.hash === hash);
  return { choices, current };
}

/**
 * Whether the theme may be replaced. While it matches a preset nothing is
 * lost, so it goes ahead; otherwise it holds changes kept nowhere but the
 * address bar, so it asks first, with `question`.
 */
export function confirmReplace(
  current: PresetChoice | undefined,
  question: string,
): boolean {
  return current !== undefined || window.confirm(question);
}
