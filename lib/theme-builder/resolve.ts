import {
  COLOR_SIDES,
  isColorToken,
  type ColorSide,
  type ColorToken,
  type Token,
} from "./manifest.ts";
import { colorValue, type Theme } from "./theme.ts";

const REFERENCE = /var\(\s*(--gridkit-[\w-]+)\s*\)/g;

const CURRENT_COLOR = /\bcurrentcolor\b/gi;

/**
 * A colour token's value on one side of `theme` with every token it reads
 * written out, so it no longer depends on the page: `var()` of a colour, by
 * its raw name or its live one, becomes that colour's value, and
 * `currentColor` the text colour, `--gridkit-fg`, as the preview's frames
 * set it. `undefined` for a token that isn't a colour or that reads itself.
 */
export function resolvedColor(
  theme: Theme,
  tokens: readonly Token[],
  name: string,
  side: ColorSide,
): string | undefined {
  const colors = new Map<string, ColorToken>(
    tokens.filter(isColorToken).map((token) => [token.name, token]),
  );

  /** The colour a `var()` reads, and the side it reads. */
  function referenced(property: string, from: ColorSide) {
    const live = colors.get(property);
    if (live !== undefined) return { token: live, side: from };
    for (const rawSide of COLOR_SIDES) {
      const suffix = `-${rawSide}`;
      const token = property.endsWith(suffix)
        ? colors.get(property.slice(0, -suffix.length))
        : undefined;
      if (token !== undefined) return { token, side: rawSide };
    }
    return undefined;
  }

  function resolve(
    token: ColorToken,
    from: ColorSide,
    reading: ReadonlySet<string>,
  ): string | undefined {
    if (reading.has(token.name)) return undefined;
    const inner = new Set(reading).add(token.name);
    let complete = true;
    const own = colorValue(theme, token)[from];
    const value = own
      .replace(CURRENT_COLOR, "var(--gridkit-fg)")
      .replace(REFERENCE, (reference, property: string) => {
        const target = referenced(property, from);
        const written =
          target === undefined
            ? undefined
            : resolve(target.token, target.side, inner);
        complete &&= written !== undefined;
        return written ?? reference;
      });
    return complete ? value : undefined;
  }

  const token = colors.get(name);
  return token === undefined ? undefined : resolve(token, side, new Set());
}
