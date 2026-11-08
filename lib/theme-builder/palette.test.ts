import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, test } from "node:test";
import { parseOklch, type Oklch } from "./color.ts";
import { CONTRAST_LEVELS, contrastIssues } from "./contrast.ts";
import { COLOR_SIDES, isColorToken } from "./manifest.ts";
import { readThemePackage } from "./package.ts";
import { ACCENT_TOKENS, proposePalette } from "./palette.ts";
import { defaultTheme } from "./theme.ts";

const PACKAGE_URL = new URL(
  "../../node_modules/@gridkitjs/theme-tailwind/",
  import.meta.url,
);

const { tokens } = await readThemePackage((path) =>
  readFile(new URL(path, PACKAGE_URL), "utf8"),
);

function defaultOf(name: string) {
  const token = tokens.find((candidate) => candidate.name === name);
  assert.ok(token && isColorToken(token), `${name} is not a colour token`);
  return token.default;
}

function oklch(text: string): Oklch {
  const color = parseOklch(text);
  assert.ok(color, `${text} is not oklch`);
  return color;
}

describe("proposePalette", () => {
  test("proposes the default palette for the default accent", () => {
    const accent = oklch(defaultOf("--gridkit-accent").light);
    assert.deepEqual(
      proposePalette(accent, tokens),
      Object.fromEntries(ACCENT_TOKENS.map((name) => [name, defaultOf(name)])),
    );
  });

  test("takes the accent's hue and keeps each default lightness", () => {
    const proposal = proposePalette(oklch("oklch(0.4 0.1 30)"), tokens);
    for (const name of ACCENT_TOKENS) {
      for (const side of COLOR_SIDES) {
        const proposed = oklch(proposal?.[name]?.[side] ?? "");
        assert.equal(proposed.h, 30, `${name} ${side}`);
        assert.equal(proposed.l, oklch(defaultOf(name)[side]).l);
      }
    }
  });

  test("keeps every contrast pair at AA on the default surfaces", () => {
    const problems: string[] = [];
    for (let chroma = 0; chroma <= 0.4; chroma += 0.05) {
      for (let hue = 0; hue < 360; hue += 5) {
        const proposal = proposePalette(
          { l: 0.6, c: chroma, h: hue, alpha: 1 },
          tokens,
        );
        assert.ok(proposal);
        const theme = { ...defaultTheme(tokens), ...proposal };
        problems.push(
          ...contrastIssues(theme, tokens, CONTRAST_LEVELS.AA).map(
            ({ side, text, background, ratio }) =>
              `c ${chroma.toFixed(2)} h ${hue} ${side}: ${text} on ${background} ${ratio.toFixed(2)}`,
          ),
        );
      }
    }
    assert.deepEqual(problems, []);
  });

  test("has nothing to propose without plain oklch defaults", () => {
    const tokensWithVar = tokens.map((token) =>
      token.name === "--gridkit-selected" && isColorToken(token)
        ? { ...token, default: { ...token.default, dark: "var(--x)" } }
        : token,
    );
    assert.equal(
      proposePalette(oklch("oklch(0.6 0.17 255)"), tokensWithVar),
      undefined,
    );
  });
});
