import {
  Children,
  cloneElement,
  isValidElement,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { examples, type GeneratedExample } from "./examples";
import { rehypeCodeMeta } from "./rehype-code-meta";
import {
  remarkUnregisteredTags,
  UNREGISTERED_TAG,
} from "./remark-unregistered-tags";
import { bundledLanguages, type BundledLanguage } from "shiki";
import { parseMetaHighlightString } from "@shikijs/transformers";
import { CodeBlock, type CodeLanguage } from "@/components/code/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { DocLink } from "@/components/docs/DocLink";
import { LinkCard, LinkCards } from "@/components/docs/LinkCards";
import { LiveExampleFrame } from "@/components/docs/LiveExampleFrame";
import { PackageInstall } from "@/components/docs/PackageInstall";
import { PendingExample } from "@/components/docs/PendingExample";
import { Since } from "@/components/docs/Since";
import { cn } from "@/components/ui/cn";
import { Kbd, KbdGroup } from "@/components/ui/Kbd";
import { StackblitzExample } from "@/components/live-examples/StackblitzExample";

function isBundledLanguage(lang: string): lang is BundledLanguage {
  return Object.hasOwn(bundledLanguages, lang);
}

// Many `ts` fences in the gridkit docs hold JSX, which Shiki's `ts` grammar
// mis-highlights; `tsx` is a superset, so plain TypeScript loses nothing.
// A fence naming a language Shiki doesn't bundle renders as plain text.
function fenceLanguage(className = ""): CodeLanguage {
  const lang = /language-([\w-]+)/.exec(className)?.[1] ?? "tsx";
  if (lang === "ts") return "tsx";
  return isBundledLanguage(lang) ? lang : "text";
}

/**
 * Reads a fence's meta string, ```` ```tsx title="App.tsx" {1,3-5} showLineNumbers wrap ````:
 * a title bar, lines to highlight, line numbers, and lines wrapped from the start.
 */
function parseFenceMeta(meta = "") {
  return {
    title: /\btitle=(["'])(.*?)\1/.exec(meta)?.[2],
    highlightLines: parseMetaHighlightString(meta) ?? [],
    showLineNumbers: /(?:^|\s)showLineNumbers(?:\s|$)/.test(meta),
    wrap: /(?:^|\s)wrap(?:\s|$)/.test(meta),
  };
}

// MDX compiles fenced code blocks to <pre><code className="language-x">...</code></pre>;
// route that through the site's Shiki-highlighted, copy-button CodeBlock instead.
// `data-meta` is the fence's meta string, put there by rehypeCodeMeta.
async function Pre({
  children,
  "data-meta": meta,
}: {
  children: ReactElement<{ className?: string; children?: unknown }>;
  "data-meta"?: string;
}) {
  const code = String(children.props.children).replace(/\n$/, "");
  return (
    <CodeBlock
      code={code}
      lang={fenceLanguage(children.props.className)}
      {...parseFenceMeta(meta)}
      className="my-4"
    />
  );
}

const LINK_CLASS =
  "text-site-ink decoration-site-accent hover:text-site-accent underline underline-offset-4 transition-colors";

function A({ className, ...props }: ComponentProps<"a">) {
  return <DocLink className={cn(LINK_CLASS, className)} {...props} />;
}

// Header names of the columns whose cells hold identifiers (prop names,
// types, keys), which are set in monospace; every other column is prose.
const IDENTIFIER_HEADERS = new Set([
  "Prop",
  "Field",
  "Function",
  "Option",
  "Type",
  "Default",
  "Key",
  "Class",
  "Member",
  "Method",
]);

// Elements only: drops the newline text MDX leaves between table rows.
function elementsIn<P>(node: ReactNode): ReactElement<P>[] {
  return Children.toArray(node).filter(isValidElement<P>);
}

function textContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  return elementsIn<{ children?: ReactNode }>(node)
    .map((element) => textContent(element.props.children))
    .join("");
}

type Section = ReactElement<{ children?: ReactNode }>;

/** Which columns are identifier columns, read from the header row. */
function monoColumnsOf(head: Section | undefined): boolean[] {
  const [headerRow] = elementsIn<{ children?: ReactNode }>(
    head?.props.children,
  );
  return elementsIn<{ children?: ReactNode }>(headerRow?.props.children).map(
    (cell) => IDENTIFIER_HEADERS.has(textContent(cell.props.children).trim()),
  );
}

function withMonoCells(body: Section, monoColumns: boolean[]): Section {
  const rows = elementsIn<{ children?: ReactNode }>(body.props.children).map(
    (row) =>
      cloneElement(
        row,
        undefined,
        elementsIn<TdProps>(row.props.children).map((cell, column) =>
          cloneElement(cell, { mono: monoColumns[column] ?? false }),
        ),
      ),
  );
  return cloneElement(body, undefined, rows);
}

// GFM tables (e.g. props reference tables) styled to match the site's
// rounded, bordered look: a tinted header row, and monospace cells in the
// columns whose header names an identifier. Narrower than min-w-160 the
// table scrolls inside its wrapper.
function Table({ children, ...props }: ComponentProps<"table">) {
  const sections = elementsIn<{ children?: ReactNode }>(children);
  const head = sections.find((section) => section.type === Thead);
  const monoColumns = monoColumnsOf(head);
  return (
    <div className="border-site-line rounded-site my-6 w-full overflow-x-auto border">
      <table className="w-full min-w-160 border-collapse text-sm" {...props}>
        {sections.map((section) =>
          section === head ? section : withMonoCells(section, monoColumns),
        )}
      </table>
    </div>
  );
}

function Thead(props: ComponentProps<"thead">) {
  return <thead className="bg-site-surface" {...props} />;
}

function Th(props: ComponentProps<"th">) {
  return (
    <th
      className="border-site-line text-site-ink first:rounded-tl-site last:rounded-tr-site border-b px-3 py-3 text-left text-xs font-semibold"
      {...props}
    />
  );
}

// Split points for type signatures: after `|`, `,` and `(`, before a run of
// `)`, and around a generic's `<…>` (only after an identifier, so a tag like
// `<table>` stays whole and `=>` is never split), so a long type wraps at its
// punctuation instead of mid-identifier.
const TYPE_BREAK = /(?<=[|,(])|(?<=\w<)|(?<![>)])(?=\))|(?<=\w<[^<>]*\w)(?=>)/;
// In prose, only call-like tokens such as `defineColumnsFromRows(dataSource)`
// get a break, right after the opening parenthesis.
const CALL_BREAK = /(?<=\w\()/;

// Code also splits after whitespace and before a `.` in a selector or member
// chain, so each segment can be kept whole: a hyphenated class name such as
// `.gridkit-data-grid-viewport` must not break at its hyphens.
const CODE_BREAK = new RegExp(
  `${TYPE_BREAK.source}|(?<=\\s)|(?<=\\w)(?=\\.\\w)`,
);

function withBreaks(text: string, at: RegExp): ReactNode {
  const parts = text.split(at);
  return parts.length === 1
    ? text
    : parts.flatMap((part, i) => (i === 0 ? [part] : [<wbr key={i} />, part]));
}

function withCodeBreaks(text: string): ReactNode {
  if (!text.includes("-")) return withBreaks(text, TYPE_BREAK);
  return text.split(CODE_BREAK).flatMap((part, i) => {
    const segment = part.includes("-") ? (
      <span key={i} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    );
    return i === 0 ? [segment] : [<wbr key={`wbr-${i}`} />, segment];
  });
}

// Table cells get <wbr> break opportunities so long types and calls wrap at
// their punctuation instead of widening the table or splitting an identifier.
// <wbr> adds no characters, so the copied/textContent value is unchanged.
function breakCellText(node: ReactNode): ReactNode {
  return Children.map(node, (child) => {
    if (typeof child === "string") return withBreaks(child, CALL_BREAK);
    if (!isValidElement<{ children?: ReactNode }>(child)) return child;
    const inner = child.props.children;
    if (child.type === "code" && typeof inner === "string") {
      return cloneElement(child, undefined, withCodeBreaks(inner));
    }
    return inner === undefined
      ? child
      : cloneElement(child, undefined, breakCellText(inner));
  });
}

interface TdProps extends ComponentProps<"td"> {
  /** Set by `Table` on cells of an identifier column. */
  mono?: boolean;
}

function Td({ mono = false, children, className, ...props }: TdProps) {
  return (
    <td
      className={cn(
        "border-site-line text-site-ink-muted border-b px-3 py-3 align-top",
        mono ? "font-mono text-xs" : "text-sm",
        className,
      )}
      {...props}
    >
      {children === "" ? "—" : breakCellText(children)}
    </td>
  );
}

function Tr(props: ComponentProps<"tr">) {
  return <tr className="last:[&>td]:border-b-0" {...props} />;
}

function framedExample({ Component, ...example }: GeneratedExample) {
  function FramedExample({ title = example.meta.title }: { title?: string }) {
    return (
      <LiveExampleFrame title={title} example={example}>
        <Component />
      </LiveExampleFrame>
    );
  }
  return FramedExample;
}

/** One tag per registered example, each rendering inside its own frame. */
const exampleTags = Object.fromEntries(
  Object.entries(examples).map(([tag, example]) => [
    tag,
    framedExample(example),
  ]),
);

const framedTags = new Set<unknown>(Object.values(exampleTags));

/**
 * The `<LiveExampleFrame title="…">` doc pages write around an example. A
 * registered example frames itself, so wrapping one passes the title on
 * instead of framing it twice; anything else, such as a
 * `<StackblitzExample>`, gets a plain frame.
 */
function MdxLiveExampleFrame({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const elements = elementsIn<{ title?: string }>(children);
  const [only] = elements;
  if (elements.length === 1 && only && framedTags.has(only.type)) {
    return cloneElement(only, { title });
  }
  return <LiveExampleFrame title={title}>{children}</LiveExampleFrame>;
}

const mdxComponents = {
  pre: Pre,
  a: A,
  table: Table,
  thead: Thead,
  th: Th,
  td: Td,
  tr: Tr,
  Callout,
  Kbd,
  KbdGroup,
  LinkCard,
  LinkCards,
  LiveExampleFrame: MdxLiveExampleFrame,
  PackageInstall,
  Since,
  StackblitzExample,
  ...exampleTags,
};

const registeredTags = new Set(Object.keys(mdxComponents));

/** `mdxComponents` plus the placeholder unregistered tags are renamed to. */
const renderComponents = {
  ...mdxComponents,
  [UNREGISTERED_TAG]: PendingExample,
};

/** Renders a doc page's MDX body (frontmatter already stripped by `gray-matter` in `lib/docs/source.ts`). */
export function DocContent({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={renderComponents}
      options={{
        mdxOptions: {
          remarkPlugins: [
            remarkGfm,
            [remarkUnregisteredTags, { registered: registeredTags }],
          ],
          rehypePlugins: [
            rehypeCodeMeta,
            rehypeSlug,
            [
              rehypeAutolinkHeadings,
              {
                behavior: "append",
                properties: {
                  className: ["anchor-link"],
                  ariaLabel: "Link to this section",
                },
                // The link's label names it; the glyph is decoration.
                content: {
                  type: "element",
                  tagName: "span",
                  properties: { ariaHidden: "true" },
                  children: [{ type: "text", value: "#" }],
                },
              },
            ],
          ],
        },
      }}
    />
  );
}
