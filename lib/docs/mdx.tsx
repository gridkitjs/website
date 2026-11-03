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
import { Link } from "@/i18n/navigation";
import { CodeBlock } from "@/components/code/CodeBlock";
import { LiveExampleFrame } from "@/components/docs/LiveExampleFrame";
import { Kbd, KbdGroup } from "@/components/ui/Kbd";
import { DataGridBasicExample } from "@/components/live-examples/DataGridBasicExample";
import { StackblitzExample } from "@/components/live-examples/StackblitzExample";
import { DataGridResizeReorderExample } from "@/components/live-examples/DataGridResizeReorderExample";
import { ColumnTemplatesExample } from "@/components/live-examples/ColumnTemplatesExample";
import { ColumnResizingExample } from "@/components/live-examples/ColumnResizingExample";
import { EventsShowcaseExample } from "@/components/live-examples/EventsShowcaseExample";
import { DarkModeExample } from "@/components/live-examples/DarkModeExample";
import { CombinedSelectionExample } from "@/components/live-examples/CombinedSelectionExample";

type CodeLang = "tsx" | "ts" | "css";

// MDX compiles fenced code blocks to <pre><code className="language-x">...</code></pre>;
// route that through the site's Shiki-highlighted, copy-button CodeBlock instead.
async function Pre({
  children,
}: {
  children: ReactElement<{ className?: string; children?: unknown }>;
}) {
  const lang = (/language-(\w+)/.exec(children.props.className ?? "")?.[1] ??
    "ts") as CodeLang;
  const code = String(children.props.children).replace(/\n$/, "");
  return <CodeBlock code={code} lang={lang} className="mt-4" />;
}

// Internal links (docs content links to other /docs/... pages) go through
// next-intl's Link so they pick up the current locale prefix.
function A({ href = "", ...props }: ComponentProps<"a">) {
  if (href.startsWith("/")) {
    return <Link href={href} className="text-site-accent" {...props} />;
  }
  return <a href={href} target="_blank" rel="noreferrer noopener" {...props} />;
}

// GFM tables (e.g. props reference tables) styled to match the site's
// rounded, bordered look: a tinted header row and code-styled cells for
// every column but the last, which holds prose description text. Narrower
// than min-w-160 the table scrolls inside its wrapper.
function Table(props: ComponentProps<"table">) {
  return (
    <div className="border-site-line my-6 w-full overflow-x-auto rounded-xl border">
      <table className="w-full min-w-160 border-collapse text-sm" {...props} />
    </div>
  );
}

function Thead(props: ComponentProps<"thead">) {
  return <thead className="bg-site-surface" {...props} />;
}

function Th(props: ComponentProps<"th">) {
  return (
    <th
      className="border-site-line text-site-ink border-b px-3 py-3 text-left text-xs font-semibold first:rounded-tl-xl last:rounded-tr-xl"
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

function Td({ children, ...props }: ComponentProps<"td">) {
  return (
    <td
      className="border-site-line text-site-ink-muted border-b px-3 py-3 align-top text-xs not-last:font-mono last:text-sm"
      {...props}
    >
      {children === "" ? "—" : breakCellText(children)}
    </td>
  );
}

function Tr(props: ComponentProps<"tr">) {
  return <tr className="last:[&>td]:border-b-0" {...props} />;
}

const mdxComponents = {
  pre: Pre,
  a: A,
  table: Table,
  thead: Thead,
  th: Th,
  td: Td,
  tr: Tr,
  Kbd,
  KbdGroup,
  LiveExampleFrame,
  StackblitzExample,
  DataGridBasicExample,
  DataGridResizeReorderExample,
  ColumnTemplatesExample,
  ColumnResizingExample,
  EventsShowcaseExample,
  DarkModeExample,
  CombinedSelectionExample,
};

/** Renders a doc page's MDX body (frontmatter already stripped by `gray-matter` in `lib/docs/source.ts`). */
export function DocContent({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [
              rehypeAutolinkHeadings,
              {
                behavior: "append",
                properties: {
                  className: ["anchor-link"],
                  ariaLabel: "Link to this section",
                },
                content: { type: "text", value: "#" },
              },
            ],
          ],
        },
      }}
    />
  );
}
