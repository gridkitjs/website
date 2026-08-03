import type { ComponentProps, ReactElement } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { Link } from "@/i18n/navigation";
import { CodeBlock } from "@/components/code/CodeBlock";
import { LiveExampleFrame } from "@/components/docs/LiveExampleFrame";
import { Kbd, KbdGroup } from "@/components/ui/Kbd";
import { DataGridBasicExample } from "@/components/live-examples/DataGridBasicExample";
import { DataGridResizeReorderExample } from "@/components/live-examples/DataGridResizeReorderExample";
import { ColumnTemplatesExample } from "@/components/live-examples/ColumnTemplatesExample";
import { ColumnResizingExample } from "@/components/live-examples/ColumnResizingExample";
import { ColumnReorderingExample } from "@/components/live-examples/ColumnReorderingExample";
import { ColumnSelectionExample } from "@/components/live-examples/ColumnSelectionExample";
import { RowSelectionExample } from "@/components/live-examples/RowSelectionExample";
import { CellSelectionExample } from "@/components/live-examples/CellSelectionExample";
import { CombinedSelectionExample } from "@/components/live-examples/CombinedSelectionExample";
import { EventsShowcaseExample } from "@/components/live-examples/EventsShowcaseExample";

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
// every column but the last, which holds prose description text.
function Table(props: ComponentProps<"table">) {
  return (
    <div className="border-site-line mt-6 w-full overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  );
}

function Thead(props: ComponentProps<"thead">) {
  return <thead className="bg-site-surface" {...props} />;
}

function Th(props: ComponentProps<"th">) {
  return (
    <th
      className="border-site-line text-site-ink border-b px-4 py-3 text-left text-xs font-semibold first:rounded-tl-xl last:rounded-tr-xl"
      {...props}
    />
  );
}

function Td({ children, ...props }: ComponentProps<"td">) {
  return (
    <td
      className="border-site-line text-site-ink-muted border-b px-4 py-3 align-top text-xs not-last:font-mono last:text-sm"
      {...props}
    >
      {children === "" ? "—" : children}
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
  DataGridBasicExample,
  DataGridResizeReorderExample,
  ColumnTemplatesExample,
  ColumnResizingExample,
  ColumnReorderingExample,
  ColumnSelectionExample,
  RowSelectionExample,
  CellSelectionExample,
  CombinedSelectionExample,
  EventsShowcaseExample,
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
                properties: { className: ["anchor-link"], ariaLabel: "Link to this section" },
                content: { type: "text", value: "#" },
              },
            ],
          ],
        },
      }}
    />
  );
}
