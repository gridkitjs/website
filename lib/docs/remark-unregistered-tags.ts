import type { Node } from "unist";
import { visit } from "unist-util-visit";

/**
 * The component an unregistered tag is renamed to. It is passed to MDX beside
 * `mdxComponents` rather than in it, so it isn't listed in `mdx-tags.json`.
 */
export const UNREGISTERED_TAG = "UnregisteredTag";

/** The part of an MDX JSX element node (`mdast-util-mdx-jsx`) this plugin rewrites. */
interface JsxElement extends Node {
  type: "mdxJsxFlowElement" | "mdxJsxTextElement";
  name: string | null;
  attributes: unknown[];
  children: unknown[];
}

function isJsxElement(node: Node): node is JsxElement {
  return node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement";
}

function attribute(name: string, value: string) {
  return { type: "mdxJsxAttribute", name, value };
}

/** Tags already warned about, so a build logs each one once per process. */
const warned = new Set<string>();

function warnOnce(tag: string): void {
  if (warned.has(tag)) return;
  warned.add(tag);
  console.warn(
    `[mdx] <${tag}> is not registered in the MDX component map; rendering a placeholder`,
  );
}

/**
 * Renames every PascalCase JSX element that isn't in `registered` to
 * `UNREGISTERED_TAG`, dropping its props and children and passing its name
 * as `tag` (and `inline="true"` inside a paragraph). MDX would otherwise
 * fail the whole page on a component it wasn't given, which happens when a
 * doc page names a live example this site doesn't have yet.
 */
export function remarkUnregisteredTags({
  registered,
}: {
  registered: ReadonlySet<string>;
}) {
  return (tree: Node) => {
    visit(tree, (node) => {
      if (!isJsxElement(node) || node.name === null) return;
      if (!/^[A-Z]/.test(node.name) || registered.has(node.name)) return;
      warnOnce(node.name);
      node.attributes = [
        attribute("tag", node.name),
        ...(node.type === "mdxJsxTextElement"
          ? [attribute("inline", "true")]
          : []),
      ];
      node.name = UNREGISTERED_TAG;
      node.children = [];
    });
  };
}
