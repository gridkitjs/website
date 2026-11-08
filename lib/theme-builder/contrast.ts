import { contrastRatio, parseOklch, type Oklch } from "./color.ts";
import { COLOR_SIDES, type ColorSide, type Token } from "./manifest.ts";
import { resolvedColor } from "./resolve.ts";
import type { Theme } from "./theme.ts";

/**
 * The text and background pairs a theme has to keep readable, the ones the
 * theme package holds its presets to: the menus' text on their background,
 * and secondary text on every background it sits on.
 */
export const CONTRAST_PAIRS = [
  { text: "--gridkit-fg", background: "--gridkit-surface" },
  { text: "--gridkit-fg-muted", background: "--gridkit-surface" },
  { text: "--gridkit-fg-muted", background: "--gridkit-surface-muted" },
  { text: "--gridkit-fg-muted", background: "--gridkit-selected" },
] as const;

/** Every token a pair reads. */
export const CONTRAST_TOKENS = [
  ...new Set(
    CONTRAST_PAIRS.flatMap(({ text, background }) => [text, background]),
  ),
];

/**
 * WCAG's minimum ratios for body text: AA, which the presets meet, and AAA,
 * which High contrast meets.
 */
export const CONTRAST_LEVELS = { AA: 4.5, AAA: 7 } as const;

export type ContrastLevel = keyof typeof CONTRAST_LEVELS;

/** Reads a colour value with no tokens left in it, if it can. */
export type ColorReader = (value: string) => Oklch | undefined;

export interface ContrastIssue {
  side: ColorSide;
  text: string;
  background: string;
  ratio: number;
}

/**
 * The pairs of `theme` below `minimum`, light side first. `readColor` reads
 * each colour once its tokens are written out; a pair with a colour it
 * can't read isn't checked. The default reads only `oklch()`, which needs
 * no browser.
 */
export function contrastIssues(
  theme: Theme,
  tokens: readonly Token[],
  minimum: number,
  readColor: ColorReader = parseOklch,
): ContrastIssue[] {
  return COLOR_SIDES.flatMap((side) => {
    const colorOf = (name: string) => {
      const value = resolvedColor(theme, tokens, name, side);
      return value === undefined ? undefined : readColor(value);
    };
    return CONTRAST_PAIRS.flatMap(({ text, background }) => {
      const foreground = colorOf(text);
      const behind = colorOf(background);
      if (foreground === undefined || behind === undefined) {
        return [];
      }
      const ratio = contrastRatio(foreground, behind);
      return ratio < minimum ? [{ side, text, background, ratio }] : [];
    });
  });
}
