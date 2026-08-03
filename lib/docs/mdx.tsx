import type { ComponentProps, ReactElement } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Link } from "@/i18n/navigation";
import { CodeBlock } from "@/components/code/CodeBlock";
import { LiveExampleFrame } from "@/components/docs/LiveExampleFrame";
import { PropsTable } from "@/components/docs/PropsTable";
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

const mdxComponents = {
  pre: Pre,
  a: A,
  PropsTable,
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
  return <MDXRemote source={source} components={mdxComponents} />;
}
