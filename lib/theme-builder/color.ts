/** A colour in oklch: lightness from 0 to 1, chroma, hue in degrees, alpha. */
export interface Oklch {
  l: number;
  c: number;
  h: number;
  alpha: number;
}

type Rgb = readonly [number, number, number];

const NUMBER = String.raw`[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?`;

const OKLCH = new RegExp(
  String.raw`^oklch\(\s*(${NUMBER})(%?)\s+(${NUMBER}|none)\s+(${NUMBER}|none)(?:deg)?\s*(?:\/\s*(${NUMBER})(%?)\s*)?\)$`,
  "i",
);

function toNumber(text: string | undefined): number {
  return text === undefined || text.toLowerCase() === "none" ? 0 : Number(text);
}

/**
 * The colour an `oklch()` value names, or `undefined` for any other value.
 * A `none` channel, as browsers write a grey's hue, reads as 0.
 */
export function parseOklch(text: string): Oklch | undefined {
  const match = OKLCH.exec(text.trim());
  if (match === null) {
    return undefined;
  }
  const [, l, lPercent, c, h, alpha, alphaPercent] = match;
  return {
    l: toNumber(l) / (lPercent === "" ? 1 : 100),
    c: toNumber(c),
    h: toNumber(h),
    alpha:
      alpha === undefined
        ? 1
        : toNumber(alpha) / (alphaPercent === "" ? 1 : 100),
  };
}

function round(value: number, digits: number): string {
  return String(Number(value.toFixed(digits)));
}

/** The colour as an `oklch()` value, rounded to what the eye can tell apart. */
export function formatOklch({ l, c, h, alpha }: Oklch): string {
  const channels = `${round(l, 3)} ${round(c, 3)} ${round(h, 1)}`;
  return alpha < 1
    ? `oklch(${channels} / ${round(alpha, 2)})`
    : `oklch(${channels})`;
}

/** Linear sRGB, clipped to its gamut, through oklab. */
function linearRgb({ l, c, h }: Oklch): Rgb {
  const hue = (h * Math.PI) / 180;
  const a = c * Math.cos(hue);
  const b = c * Math.sin(hue);

  const long = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const medium = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const short = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const clip = (channel: number) => Math.min(Math.max(channel, 0), 1);
  return [
    clip(4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short),
    clip(-1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short),
    clip(-0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short),
  ];
}

function encode(channel: number): number {
  return channel <= 0.0031308
    ? 12.92 * channel
    : 1.055 * channel ** (1 / 2.4) - 0.055;
}

function decode(channel: number): number {
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

/** A translucent colour over an opaque one, blended as browsers paint it. */
function over(top: Rgb, alpha: number, bottom: Rgb): Rgb {
  const blend = (index: 0 | 1 | 2) =>
    decode(alpha * encode(top[index]) + (1 - alpha) * encode(bottom[index]));
  return [blend(0), blend(1), blend(2)];
}

function luminance([red, green, blue]: Rgb): number {
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/**
 * WCAG's contrast ratio of text on a background, from 1 to 21. Translucent
 * text is blended over the background first; the background's own alpha is
 * left out, as what shows through it depends on the page.
 */
export function contrastRatio(text: Oklch, background: Oklch): number {
  const below = linearRgb(background);
  const above =
    text.alpha < 1 ? over(linearRgb(text), text.alpha, below) : linearRgb(text);
  const [darker, lighter] = [luminance(above), luminance(below)].sort(
    (x, y) => x - y,
  );
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
}
