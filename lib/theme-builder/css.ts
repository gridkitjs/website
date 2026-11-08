import { themeToHash } from "./hash.ts";
import type { Token } from "./manifest.ts";
import {
  changedDeclarations,
  collapseWhitespace,
  themeFromDeclarations,
  type Declaration,
  type ParsedTheme,
  type Theme,
} from "./theme.ts";

interface CssBlock {
  /** The selector or at-rule before the `{`, or `""` for the stylesheet. */
  prelude: string;
  declarations: Declaration[];
  blocks: CssBlock[];
}

/** The name the builder downloads the theme file under. */
export const THEME_FILE_NAME = "gridkit-theme.css";

export interface ThemeFileOptions {
  /** The version of `@gridkitjs/theme-tailwind` whose tokens it sets. */
  version: string;
  /** The builder's own URL, which the file's link adds the theme to. */
  pageUrl: string;
}

function emptyBlock(prelude: string): CssBlock {
  return { prelude, declarations: [], blocks: [] };
}

/**
 * Adds the text since the last `;`, `{` or `}` to `block`, if it is a
 * declaration. A statement such as `@import` sets no token, so it is
 * skipped.
 */
function addDeclaration(block: CssBlock, text: string) {
  const declaration = collapseWhitespace(text);
  const colon = declaration.indexOf(":");
  if (declaration.startsWith("@") || colon === -1) {
    return;
  }
  block.declarations.push({
    property: declaration.slice(0, colon).trim(),
    value: declaration.slice(colon + 1).trim(),
  });
}

/**
 * Reads a stylesheet into blocks and declarations: enough to find what a
 * theme file declares, not a general CSS parser. Comments are dropped, and
 * a `;` or brace inside a string or parentheses doesn't end anything.
 */
function parseBlocks(css: string): CssBlock {
  const sheet = emptyBlock("");
  const open = [sheet];
  let text = "";
  let parens = 0;

  for (let i = 0; i < css.length; i++) {
    const char = css.charAt(i);
    const block = open[open.length - 1];

    if (char === "/" && css.charAt(i + 1) === "*") {
      const end = css.indexOf("*/", i + 2);
      if (end === -1) {
        throw new Error("Unclosed comment");
      }
      text += " ";
      i = end + 1;
    } else if (char === '"' || char === "'") {
      let end = i + 1;
      while (end < css.length && css.charAt(end) !== char) {
        end += css.charAt(end) === "\\" ? 2 : 1;
      }
      text += css.slice(i, end + 1);
      i = end;
    } else if (char === "(") {
      parens++;
      text += char;
    } else if (char === ")") {
      parens--;
      text += char;
    } else if (parens > 0) {
      text += char;
    } else if (char === "{") {
      const child = emptyBlock(collapseWhitespace(text));
      block.blocks.push(child);
      open.push(child);
      text = "";
    } else if (char === "}") {
      if (open.length === 1) {
        throw new Error("Unmatched }");
      }
      addDeclaration(block, text);
      open.pop();
      text = "";
    } else if (char === ";") {
      addDeclaration(block, text);
      text = "";
    } else {
      text += char;
    }
  }

  if (open.length !== 1) {
    throw new Error("Unclosed block");
  }
  addDeclaration(sheet, text);
  return sheet;
}

function allDeclarations(block: CssBlock): Declaration[] {
  return [...block.declarations, ...block.blocks.flatMap(allDeclarations)];
}

/**
 * The theme a theme file sets: a preset, a file the builder wrote, or one
 * pasted in. Only declarations directly inside a top-level `:root` block
 * count, as the theme's stylesheet reads tokens from `:root`; any other
 * declaration is listed as ignored. Throws if the text isn't a stylesheet
 * at all, such as one with an unclosed block.
 */
export function parseThemeCss(
  css: string,
  tokens: readonly Token[],
): ParsedTheme {
  const sheet = parseBlocks(css);
  const roots = sheet.blocks.filter((block) => block.prelude === ":root");
  const { theme, ignored } = themeFromDeclarations(
    roots.flatMap((root) => root.declarations),
    tokens,
  );
  const elsewhere = [
    ...sheet.declarations,
    ...sheet.blocks
      .filter((block) => !roots.includes(block))
      .flatMap(allDeclarations),
    ...roots.flatMap((root) => root.blocks.flatMap(allDeclarations)),
  ];
  return {
    theme,
    ignored: [...ignored, ...elsewhere.map(({ property }) => property)],
  };
}

/**
 * The theme file: one `:root` block declaring only the tokens `theme`
 * changes, colours through their raw `-light` and `-dark` names, grouped as
 * the manifest groups them. Its header names the package version and links
 * to the builder with the theme in the URL.
 */
export function themeToCss(
  theme: Theme,
  tokens: readonly Token[],
  { version, pageUrl }: ThemeFileOptions,
): string {
  const groups = new Map<string, string[]>();
  for (const token of tokens) {
    for (const { property, value } of changedDeclarations(theme, token)) {
      const lines = groups.get(token.group) ?? [];
      lines.push(`  ${property}: ${value};`);
      groups.set(token.group, lines);
    }
  }
  const body = [...groups.values()].map((lines) => lines.join("\n"));
  const hash = themeToHash(theme, tokens);

  return [
    "/*",
    " * GridKit theme, made with the theme builder from the tokens of",
    ` * @gridkitjs/theme-tailwind ${version}. Load it after the theme's`,
    " * stylesheet, from @gridkitjs/theme-tailwind or @gridkitjs/theme-css.",
    " *",
    " * Open it in the builder:",
    ` * ${hash === "" ? pageUrl : `${pageUrl}#${hash}`}`,
    " */",
    ":root {",
    ...(body.length > 0 ? [body.join("\n\n")] : []),
    "}",
    "",
  ].join("\n");
}
