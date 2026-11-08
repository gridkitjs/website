import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, test } from "node:test";
import { parseThemeCss, themeToCss } from "./css.ts";
import { themeFromHash, themeToHash } from "./hash.ts";
import { readTokenManifest } from "./manifest.ts";
import { readThemePackage } from "./package.ts";
import { defaultTheme, isSafeValue } from "./theme.ts";

const PACKAGE_URL = new URL(
  "../../node_modules/@gridkitjs/theme-tailwind/",
  import.meta.url,
);

const { version, tokens, presets } = await readThemePackage((path) =>
  readFile(new URL(path, PACKAGE_URL), "utf8"),
);

const PAGE_URL = "https://gridkitjs.com/en/theme-builder";

const fileOptions = { version, pageUrl: PAGE_URL };

describe("the installed package", () => {
  test("has tokens and a Default preset first", () => {
    assert.ok(tokens.length > 0);
    assert.equal(presets[0]?.id, "default");
  });

  test("Default sets every token to its default", () => {
    const { theme, ignored } = parseThemeCss(presets[0]?.css ?? "", tokens);
    assert.deepEqual(ignored, []);
    assert.deepEqual(theme, defaultTheme(tokens));
  });
});

describe("a preset", () => {
  for (const preset of presets) {
    describe(preset.label, () => {
      const { theme, ignored } = parseThemeCss(preset.css, tokens);

      test("sets only tokens, with values the builder can write", () => {
        assert.deepEqual(ignored, []);
      });

      test("survives a round trip through the theme file", () => {
        const css = themeToCss(theme, tokens, fileOptions);
        const reparsed = parseThemeCss(css, tokens);
        assert.deepEqual(reparsed.ignored, []);
        assert.deepEqual(reparsed.theme, theme);
      });

      test("survives a round trip through the URL hash", () => {
        const hash = themeToHash(theme, tokens);
        const restored =
          hash === ""
            ? defaultTheme(tokens)
            : themeFromHash(`#${hash}`, tokens);
        assert.deepEqual(restored, theme);
      });
    });
  }
});

describe("the theme file", () => {
  test("declares nothing for the defaults", () => {
    const css = themeToCss(defaultTheme(tokens), tokens, fileOptions);
    assert.match(css, /:root \{\n\}\n$/);
    assert.ok(css.includes(`@gridkitjs/theme-tailwind ${version}`));
    assert.ok(css.includes(` * ${PAGE_URL}\n`));
  });

  test("declares only the changed side of a colour, by its raw name", () => {
    const { theme } = parseThemeCss(
      ":root { --gridkit-accent-dark: oklch(0.7 0.2 30); }",
      tokens,
    );
    const css = themeToCss(theme, tokens, fileOptions);
    assert.match(
      css,
      /:root \{\n {2}--gridkit-accent-dark: oklch\(0\.7 0\.2 30\);\n\}/,
    );
    assert.ok(!css.includes("--gridkit-accent-light"));
  });

  test("links to the builder with the theme in the hash", () => {
    const { theme } = parseThemeCss(":root { --gridkit-radius: 0; }", tokens);
    assert.ok(
      themeToCss(theme, tokens, fileOptions).includes(`${PAGE_URL}#radius=0\n`),
    );
  });
});

describe("parseThemeCss", () => {
  test("reads values wrapped over lines, between comments", () => {
    const { theme, ignored } = parseThemeCss(
      `/* A theme */
      :root {
        /* Rounder */
        --gridkit-radius:
          0.5rem;
        --gridkit-scrollbar-thumb-light: color-mix(
          in oklch,
          red 45%,
          transparent
        );
      }`,
      tokens,
    );
    assert.deepEqual(ignored, []);
    assert.equal(theme["--gridkit-radius"], "0.5rem");
    assert.deepEqual(theme["--gridkit-scrollbar-thumb"], {
      light: "color-mix(in oklch, red 45%, transparent)",
      dark: "color-mix(in oklch, var(--gridkit-fg-muted-dark) 45%, transparent)",
    });
  });

  test("ignores what doesn't set a token on :root", () => {
    const { theme, ignored } = parseThemeCss(
      `@import "@gridkitjs/theme-tailwind/styles.css";
      :root {
        --gridkit-accent: red;
        --gridkit-unknown: 1px;
        color-scheme: light;
        --gridkit-radius: url(https://example.com/x.png);
        @media (min-width: 40rem) { --gridkit-spacing: 1rem; }
      }
      .dark { --gridkit-fg-dark: white; }`,
      tokens,
    );
    assert.deepEqual(theme, defaultTheme(tokens));
    assert.deepEqual(ignored.sort(), [
      "--gridkit-accent",
      "--gridkit-fg-dark",
      "--gridkit-radius",
      "--gridkit-spacing",
      "--gridkit-unknown",
      "color-scheme",
    ]);
  });

  test("lets a later declaration win", () => {
    const { theme } = parseThemeCss(
      ":root { --gridkit-radius: 0; } :root { --gridkit-radius: 1rem; }",
      tokens,
    );
    assert.equal(theme["--gridkit-radius"], "1rem");
  });

  test("throws on text that isn't a stylesheet", () => {
    assert.throws(() => parseThemeCss(":root { --gridkit-radius: 0;", tokens));
    assert.throws(() => parseThemeCss("}", tokens));
    assert.throws(() => parseThemeCss("/* :root {}", tokens));
  });
});

describe("themeFromHash", () => {
  test("ignores a fragment that sets no token", () => {
    assert.equal(themeFromHash("#main", tokens), undefined);
    assert.equal(themeFromHash("", tokens), undefined);
  });

  test("reads a fragment with or without its #", () => {
    const theme = themeFromHash("radius=0&fg-light=oklch(0%200%200)", tokens);
    assert.equal(theme?.["--gridkit-radius"], "0");
    assert.deepEqual(
      themeFromHash("#radius=0&fg-light=oklch(0%200%200)", tokens),
      theme,
    );
  });
});

describe("isSafeValue", () => {
  test("accepts what tokens take", () => {
    for (const value of [
      "oklch(0.6 0.17 255)",
      "oklch(0 0 0 / 0.15)",
      "oklch(from var(--gridkit-accent-light) l c 25)",
      "calc(var(--gridkit-spacing) * 2)",
      '"Inter", system-ui, sans-serif',
      "0 4px 12px",
      "0.1s",
    ]) {
      assert.ok(isSafeValue(value), value);
    }
  });

  test("rejects what could escape its declaration or load a file", () => {
    for (const value of [
      "",
      "red; } body { display: none",
      "red !important",
      "url(https://example.com/x.png)",
      'image-set("https://example.com/x.png" 1x)',
      "calc(1px",
      "1px)",
      '"Inter',
      "red /* comment",
      "</style>",
    ]) {
      assert.ok(!isSafeValue(value), value);
    }
  });
});

describe("readTokenManifest", () => {
  test("refuses a schema version it doesn't know", () => {
    assert.throws(
      () => readTokenManifest({ schemaVersion: 2, tokens: [] }),
      /schemaVersion 1/,
    );
  });

  test("refuses a colour without a light and dark default", () => {
    assert.throws(() =>
      readTokenManifest({
        schemaVersion: 1,
        tokens: [
          {
            name: "--gridkit-surface",
            group: "colors",
            tier: "basic",
            type: "color",
            default: "white",
            description: "The background.",
          },
        ],
      }),
    );
  });
});
