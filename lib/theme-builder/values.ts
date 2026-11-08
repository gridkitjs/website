/** A number and its unit, as `0.25rem` is written; `""` for no unit. */
export interface Dimension {
  amount: string;
  unit: string;
}

const DIMENSION = /^(-?(?:\d+\.?\d*|\.\d+))([a-z%]*)$/i;

/**
 * The number and unit a value is written as, or `undefined` for anything
 * else, such as `calc()` or `inherit`. The amount keeps its spelling.
 */
export function parseDimension(value: string): Dimension | undefined {
  const match = DIMENSION.exec(value.trim());
  if (match === null) {
    return undefined;
  }
  const [, amount = "", unit = ""] = match;
  return { amount, unit: unit.toLowerCase() };
}

/** The offsets, blur and spread of a shadow, in pixels. */
export interface ShadowGeometry {
  x: string;
  y: string;
  blur: string;
  spread: string;
}

export const SHADOW_PARTS = ["x", "y", "blur", "spread"] as const;

function pixels(dimension: Dimension | undefined): string | undefined {
  if (dimension === undefined) return undefined;
  const { amount, unit } = dimension;
  return unit === "px" || (unit === "" && Number(amount) === 0)
    ? amount
    : undefined;
}

/**
 * A shadow's geometry, as `--gridkit-overlay-shadow` takes it: two to four
 * lengths in pixels, with no colour. `undefined` for anything else.
 */
export function parseShadow(value: string): ShadowGeometry | undefined {
  const parts = value.trim().split(/\s+/).map(parseDimension).map(pixels);
  if (parts.length < 2 || parts.length > 4 || parts.includes(undefined)) {
    return undefined;
  }
  const [x = "0", y = "0", blur = "0", spread = "0"] = parts;
  return { x, y, blur, spread };
}

/** A shadow's geometry as a value, leaving out a spread of 0. */
export function formatShadow(shadow: ShadowGeometry): string {
  const lengths = SHADOW_PARTS.map((part) => shadow[part]).map((amount) =>
    Number(amount) === 0 ? "0" : `${amount}px`,
  );
  return (Number(shadow.spread) === 0 ? lengths.slice(0, 3) : lengths).join(
    " ",
  );
}
