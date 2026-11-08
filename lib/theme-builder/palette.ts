import { contrastRatio, formatOklch, parseOklch, type Oklch } from "./color.ts";
import {
  CONTRAST_LEVELS,
  CONTRAST_PAIRS,
  CONTRAST_TOKENS,
} from "./contrast.ts";
import {
  isColorToken,
  type ColorPair,
  type ColorSide,
  type Token,
} from "./manifest.ts";

/** The token the palette helper takes the accent from, and proposes. */
export const ACCENT = "--gridkit-accent";

/** The colours the palette helper derives from one accent. */
export const ACCENT_TOKENS = [
  ACCENT,
  "--gridkit-selected",
  "--gridkit-selected-strong",
  "--gridkit-hover-line",
] as const;

/** A colour token's default on each side, read as oklch, by token name. */
type Defaults = ReadonlyMap<string, Readonly<Record<ColorSide, Oklch>>>;

/**
 * The defaults of the accent colours and of every colour a contrast pair
 * reads, or `undefined` if one isn't a plain `oklch()` to derive from.
 */
function readDefaults(tokens: readonly Token[]): Defaults | undefined {
  const names = new Set<string>([...ACCENT_TOKENS, ...CONTRAST_TOKENS]);
  const defaults = new Map<string, Record<ColorSide, Oklch>>();
  for (const token of tokens) {
    if (!names.has(token.name) || !isColorToken(token)) continue;
    const light = parseOklch(token.default.light);
    const dark = parseOklch(token.default.dark);
    if (light === undefined || dark === undefined) return undefined;
    defaults.set(token.name, { light, dark });
  }
  return defaults.size === names.size ? defaults : undefined;
}

/**
 * Whether `color`, standing in for token `name` on `side`, keeps every
 * contrast pair it is part of at AA against the default of the pair's
 * other colour.
 */
function isReadable(
  name: string,
  color: Oklch,
  side: ColorSide,
  defaults: Defaults,
): boolean {
  const colorOf = (token: string) =>
    token === name ? color : defaults.get(token)?.[side];
  return CONTRAST_PAIRS.filter(
    ({ text, background }) => text === name || background === name,
  ).every(({ text, background }) => {
    const foreground = colorOf(text);
    const behind = colorOf(background);
    return (
      foreground !== undefined &&
      behind !== undefined &&
      contrastRatio(foreground, behind) >= CONTRAST_LEVELS.AA
    );
  });
}

/**
 * The accent colours for both sides, derived from one accent. Each keeps
 * its default lightness, so what sits on it stays as readable as the
 * defaults make it, and takes the accent's hue, with its default chroma
 * scaled by the accent's against the default accent's. A colour that would
 * still push a contrast pair under AA against the default palette loses
 * chroma until it passes. `undefined` when the defaults aren't plain
 * `oklch()` colours to derive from.
 */
export function proposePalette(
  accent: Oklch,
  tokens: readonly Token[],
): Record<string, ColorPair> | undefined {
  const defaults = readDefaults(tokens);
  const base = defaults?.get(ACCENT)?.light;
  if (defaults === undefined || base === undefined) return undefined;

  const scale = base.c > 0 ? accent.c / base.c : 0;
  const hue = Number(accent.h.toFixed(1));

  const propose = (name: string, side: ColorSide): string => {
    const { l, c } = defaults.get(name)?.[side] ?? base;
    // Thousandths, as the value is written, so what's checked is what ships.
    const color = {
      l,
      c: Math.floor(c * scale * 1000) / 1000,
      h: hue,
      alpha: 1,
    };
    while (color.c > 0 && !isReadable(name, color, side, defaults)) {
      color.c = Math.round(color.c * 1000 - 1) / 1000;
    }
    return formatOklch(color);
  };

  return Object.fromEntries(
    ACCENT_TOKENS.map((name) => [
      name,
      { light: propose(name, "light"), dark: propose(name, "dark") },
    ]),
  );
}
