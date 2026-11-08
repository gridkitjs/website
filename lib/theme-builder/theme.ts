import {
  COLOR_SIDES,
  isColorToken,
  type ColorPair,
  type ColorSide,
  type ColorToken,
  type Token,
  type ValueToken,
} from "./manifest.ts";

/** A token's value; a colour's is a light and dark pair. */
export type TokenValue = string | ColorPair;

/**
 * A theme: every token's value, by token name. Values are kept as written,
 * with whitespace collapsed, so a theme equals the manifest's defaults
 * exactly where it leaves a token alone.
 */
export type Theme = Readonly<Record<string, TokenValue>>;

/** One custom property declaration of a theme file. */
export interface Declaration {
  property: string;
  value: string;
}

export interface ParsedTheme {
  theme: Theme;
  /**
   * The properties left out: not a token's raw name, or with a value that
   * can't be written into a stylesheet safely.
   */
  ignored: string[];
}

/** Where a declaration lands in a theme. */
type Target =
  | { token: ColorToken; side: ColorSide }
  | { token: ValueToken; side?: undefined };

/**
 * Functions a token's value may call. Anything else, `url()` and
 * `image-set()` above all, could load a file from a shared link.
 */
const SAFE_FUNCTIONS = new Set([
  "abs",
  "calc",
  "clamp",
  "color",
  "color-mix",
  "hsl",
  "hsla",
  "hwb",
  "lab",
  "lch",
  "light-dark",
  "max",
  "min",
  "mod",
  "oklab",
  "oklch",
  "rem",
  "rgb",
  "rgba",
  "round",
  "sign",
  "var",
]);

export function collapseWhitespace(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\( /g, "(")
    .replace(/ \)/g, ")")
    .trim();
}

/**
 * Whether a value can be written into a declaration as it is: it can't end
 * the declaration or its block, open a comment, raise its own priority or
 * load anything. Values reach the builder from shared links and pasted
 * files, and the preview writes them into the page's styles.
 */
export function isSafeValue(value: string): boolean {
  if (value === "" || /[;{}<>\\!]|\/\*|\*\//.test(value)) {
    return false;
  }
  for (const [, name] of value.matchAll(/([\w-]+)\(/g)) {
    if (!SAFE_FUNCTIONS.has(name.toLowerCase())) {
      return false;
    }
  }

  let depth = 0;
  let quote: string | undefined;
  for (const char of value) {
    if (quote !== undefined) {
      if (char === quote) quote = undefined;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === "(") {
      depth++;
    } else if (char === ")" && --depth < 0) {
      return false;
    }
  }
  return depth === 0 && quote === undefined;
}

export function defaultTheme(tokens: readonly Token[]): Theme {
  return Object.fromEntries(tokens.map((token) => [token.name, token.default]));
}

/** A colour token's pair in `theme`, or its default if the theme has none. */
export function colorValue(theme: Theme, token: ColorToken): ColorPair {
  const value = theme[token.name];
  return value === undefined || typeof value === "string"
    ? token.default
    : value;
}

/** Any other token's value in `theme`, or its default if the theme has none. */
export function tokenValue(theme: Theme, token: ValueToken): string {
  const value = theme[token.name];
  return typeof value === "string" ? value : token.default;
}

/**
 * The declarations that set a token to its value in `theme`, if that differs
 * from the default: the token itself, or for a colour each side that
 * differs, through its raw `-light` or `-dark` name.
 */
export function changedDeclarations(theme: Theme, token: Token): Declaration[] {
  if (isColorToken(token)) {
    const pair = colorValue(theme, token);
    return COLOR_SIDES.filter((side) => pair[side] !== token.default[side]).map(
      (side) => ({ property: `${token.name}-${side}`, value: pair[side] }),
    );
  }
  const value = tokenValue(theme, token);
  return value === token.default ? [] : [{ property: token.name, value }];
}

function targetsOf(tokens: readonly Token[]): Map<string, Target> {
  const targets = new Map<string, Target>();
  for (const token of tokens) {
    if (isColorToken(token)) {
      for (const side of COLOR_SIDES) {
        targets.set(`${token.name}-${side}`, { token, side });
      }
    } else {
      targets.set(token.name, { token });
    }
  }
  return targets;
}

/**
 * The theme a list of declarations sets, over the defaults. A later
 * declaration of the same property wins, as in a stylesheet.
 */
export function themeFromDeclarations(
  declarations: Iterable<Declaration>,
  tokens: readonly Token[],
): ParsedTheme {
  const targets = targetsOf(tokens);
  const theme: Record<string, TokenValue> = { ...defaultTheme(tokens) };
  const ignored: string[] = [];

  for (const declaration of declarations) {
    const target = targets.get(declaration.property);
    const value = collapseWhitespace(declaration.value);
    if (target === undefined || !isSafeValue(value)) {
      ignored.push(declaration.property);
    } else if (target.side === undefined) {
      theme[target.token.name] = value;
    } else {
      theme[target.token.name] = {
        ...colorValue(theme, target.token),
        [target.side]: value,
      };
    }
  }
  return { theme, ignored };
}
