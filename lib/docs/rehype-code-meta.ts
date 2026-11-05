import type { Root } from "hast";
import { visit } from "unist-util-visit";

/**
 * Copies a code fence's meta string (everything after the language, as in
 * ```` ```ts title="grid.ts" {2} ````) onto its `<pre>` as `data-meta`.
 * The markdown-to-HTML step keeps the meta only on the hast node's `data`,
 * which MDX never passes to components, so `Pre` would not see it otherwise.
 */
export function rehypeCodeMeta() {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "pre") return;
      const [code] = node.children;
      if (code?.type !== "element" || code.tagName !== "code") return;
      const meta = code.data?.meta;
      if (meta) node.properties.dataMeta = meta;
    });
  };
}
