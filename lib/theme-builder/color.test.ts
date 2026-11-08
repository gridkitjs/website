import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, test } from "node:test";
import { contrastRatio, formatOklch, parseOklch, type Oklch } from "./color.ts";
import { CONTRAST_LEVELS, contrastIssues } from "./contrast.ts";
import { parseThemeCss } from "./css.ts";
import { isColorToken } from "./manifest.ts";
import { readThemePackage } from "./package.ts";
import { resolvedColor } from "./resolve.ts";
import { defaultTheme } from "./theme.ts";

const PACKAGE_URL = new URL(
  "../../node_modules/@gridkitjs/theme-tailwind/",
  import.meta.url,
);

const { tokens, presets } = await readThemePackage((path) =>
  readFile(new URL(path, PACKAGE_URL), "utf8"),
);

const defaults = defaultTheme(tokens);

function oklch(text: string): Oklch {
  const color = parseOklch(text);
  assert.ok(color, `${text} is not oklch`);
  return color;
}

describe("parseOklch", () => {
  test("reads what stylesheets and browsers write", () => {
    assert.deepEqual(parseOklch("oklch(0.6 0.17 255)"), {
      l: 0.6,
      c: 0.17,
      h: 255,
      alpha: 1,
    });
    assert.deepEqual(parseOklch("oklch(60% 0.17 255deg / 50%)"), {
      l: 0.6,
      c: 0.17,
      h: 255,
      alpha: 0.5,
    });
    assert.deepEqual(parseOklch("oklch(0 0 none / 0.15)"), {
      l: 0,
      c: 0,
      h: 0,
      alpha: 0.15,
    });
    assert.equal(parseOklch("oklch(0.627966 1.2e-7 29.2346)")?.c, 1.2e-7);
  });

  test("refuses any other value", () => {
    for (const value of [
      "#336699",
      "rgb(51, 102, 153)",
      "var(--gridkit-accent-light)",
      "oklch(from red l c h)",
      "oklch(0.6 0.17)",
    ]) {
      assert.equal(parseOklch(value), undefined, value);
    }
  });
});

describe("formatOklch", () => {
  test("rounds and writes alpha only when translucent", () => {
    assert.equal(
      formatOklch({ l: 0.599991, c: 0.17004, h: 255.04, alpha: 1 }),
      "oklch(0.6 0.17 255)",
    );
    assert.equal(
      formatOklch({ l: 0, c: 0, h: 0, alpha: 0.15 }),
      "oklch(0 0 0 / 0.15)",
    );
  });
});

describe("contrastRatio", () => {
  test("runs from 1 for one colour to 21 for black on white", () => {
    const white = oklch("oklch(1 0 0)");
    assert.equal(contrastRatio(white, white), 1);
    assert.ok(
      Math.abs(contrastRatio(oklch("oklch(0 0 0)"), white) - 21) < 0.01,
    );
  });

  test("blends translucent text over its background", () => {
    const white = oklch("oklch(1 0 0)");
    const black = oklch("oklch(0 0 0)");
    assert.equal(contrastRatio({ ...black, alpha: 0 }, white), 1);
    const half = contrastRatio({ ...black, alpha: 0.5 }, white);
    assert.ok(half > 1 && half < 21);
  });
});

describe("resolvedColor", () => {
  test("writes out the colours a value reads, by raw or live name", () => {
    assert.equal(
      resolvedColor(defaults, tokens, "--gridkit-header-bg", "dark"),
      "oklch(0.21 0.01 250)",
    );
    const theme = {
      ...defaults,
      "--gridkit-row-stripe-bg": {
        light:
          "color-mix(in oklch, var(--gridkit-accent) 10%, var(--gridkit-surface-dark))",
        dark: "transparent",
      },
    };
    assert.equal(
      resolvedColor(theme, tokens, "--gridkit-row-stripe-bg", "light"),
      "color-mix(in oklch, oklch(0.6 0.17 255) 10%, oklch(0.21 0.01 250))",
    );
  });

  test("reads currentColor as the text colour", () => {
    assert.equal(
      resolvedColor(defaults, tokens, "--gridkit-header-fg", "light"),
      "oklch(0.21 0.01 250)",
    );
  });

  test("gives up on a colour that reads itself or isn't a colour", () => {
    const theme = {
      ...defaults,
      "--gridkit-fg": { light: "currentColor", dark: "oklch(1 0 0)" },
    };
    assert.equal(
      resolvedColor(theme, tokens, "--gridkit-fg", "light"),
      undefined,
    );
    assert.equal(
      resolvedColor(theme, tokens, "--gridkit-fg", "dark"),
      "oklch(1 0 0)",
    );
    assert.equal(
      resolvedColor(defaults, tokens, "--gridkit-radius", "light"),
      undefined,
    );
  });
});

describe("contrastIssues", () => {
  for (const preset of presets) {
    const minimum =
      preset.id === "high-contrast" ? CONTRAST_LEVELS.AAA : CONTRAST_LEVELS.AA;
    test(`passes ${preset.label} at ${minimum}:1, as the package does`, () => {
      const { theme } = parseThemeCss(preset.css, tokens);
      assert.deepEqual(contrastIssues(theme, tokens, minimum), []);
    });
  }

  test("flags secondary text set to the surface colour", () => {
    const fgMuted = tokens.find(({ name }) => name === "--gridkit-fg-muted");
    assert.ok(fgMuted && isColorToken(fgMuted));
    const theme = {
      ...defaults,
      "--gridkit-fg-muted": {
        ...fgMuted.default,
        dark: "var(--gridkit-surface-dark)",
      },
    };
    const issues = contrastIssues(theme, tokens, CONTRAST_LEVELS.AA);
    assert.ok(
      issues.every(
        ({ side, text }) => side === "dark" && text === "--gridkit-fg-muted",
      ),
    );
    const onSurface = issues.find(
      ({ background }) => background === "--gridkit-surface",
    );
    assert.equal(onSurface?.ratio, 1);
  });

  test("skips a pair with a colour it can't read", () => {
    const theme = {
      ...defaults,
      "--gridkit-fg": { light: "#000", dark: "#fff" },
    };
    assert.deepEqual(
      contrastIssues(theme, tokens, 21).filter(
        ({ text }) => text === "--gridkit-fg",
      ),
      [],
    );
  });
});
