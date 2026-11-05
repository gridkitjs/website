import type { Element, ElementContent } from "hast";
import { codeToHtml, type BundledLanguage, type ShikiTransformer } from "shiki";
import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationHighlight,
} from "@shikijs/transformers";
import { CodeFrame } from "./CodeFrame";

/** Any language Shiki bundles, or `"text"` for unhighlighted plain text. */
export type CodeLanguage = BundledLanguage | "text";

interface CodeBlockProps {
  code: string;
  lang?: CodeLanguage;
  /** Shown in a bar above the code, e.g. a file name. */
  title?: string;
  /** 1-based line numbers to highlight. */
  highlightLines?: number[];
  showLineNumbers?: boolean;
  /** Start with long lines wrapped. */
  wrap?: boolean;
  className?: string;
}

/** Marks the given 1-based lines `highlighted`, as `// [!code highlight]` does. */
function highlightLinesTransformer(lines: number[]): ShikiTransformer {
  return {
    name: "highlight-lines",
    line(node, line) {
      if (lines.includes(line)) this.addClassToHast(node, "highlighted");
    },
  };
}

function textOf(node: ElementContent): string {
  if (node.type === "text") return node.value;
  if (node.type !== "element") return "";
  return node.children.map(textOf).join("");
}

// Shiki keeps a node's classes in `properties.class`, as a string or a list.
function hasClass(node: Element, name: string): boolean {
  const classes = node.properties.class;
  if (typeof classes === "string") return classes.split(/\s+/).includes(name);
  return Array.isArray(classes) && classes.includes(name);
}

/**
 * The code as the reader sees it, for the copy button: `[!code …]` notation
 * comments are gone, and so are the lines a diff removes. Read from Shiki's
 * own output, after its transformers ran, rather than re-parsed here.
 */
function copyTextTransformer(onText: (text: string) => void): ShikiTransformer {
  return {
    name: "copy-text",
    code(code) {
      const lines = code.children.filter(
        (node): node is Element => node.type === "element",
      );
      onText(
        lines
          .filter((line) => !hasClass(line, "remove"))
          .map((line) => textOf(line).trimEnd())
          .join("\n"),
      );
    },
  };
}

/** Highlights `code`, returning the HTML and the text the copy button copies. */
async function highlight(code: string, lang: CodeLanguage, lines: number[]) {
  let copyText = code;
  const html = await codeToHtml(code, {
    lang,
    // Colours come out as --shiki-light/--shiki-dark variables, which
    // globals.css picks between by theme.
    themes: { light: "github-light", dark: "github-dark-dimmed" },
    defaultColor: false,
    transformers: [
      transformerNotationHighlight(),
      transformerNotationDiff(),
      transformerNotationFocus(),
      highlightLinesTransformer(lines),
      // Last, so it reads the lines with every notation comment removed.
      copyTextTransformer((text) => {
        copyText = text;
      }),
    ],
  });
  return { html, copyText };
}

export async function CodeBlock({
  code,
  lang = "tsx",
  title,
  highlightLines = [],
  showLineNumbers = false,
  wrap = false,
  className,
}: CodeBlockProps) {
  const { html, copyText } = await highlight(code.trim(), lang, highlightLines);

  return (
    <CodeFrame
      code={copyText}
      title={title}
      wrap={wrap}
      showLineNumbers={showLineNumbers}
      className={className}
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </CodeFrame>
  );
}
