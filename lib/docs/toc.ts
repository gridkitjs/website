import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import GithubSlugger from "github-slugger";
import type { Heading, Root } from "mdast";

export interface TocEntry {
  id: string;
  title: string;
  children: TocEntry[];
}

const markdownParser = unified().use(remarkParse).use(remarkGfm);

/**
 * Parses MDX source as plain Markdown with GFM. JSX isn't understood: a tag
 * like `<Kbd>` comes back as an `html` node, its children as siblings.
 * That's enough for reading headings and prose, and far cheaper than
 * compiling the MDX.
 */
export function parseMarkdown(markdown: string): Root {
  return markdownParser.parse(markdown);
}

/**
 * The id of every heading in `tree`, slugged the way `rehype-slug` does at
 * render time (both use `github-slugger`, over every heading level in
 * document order) so they match the ids on the rendered heading elements.
 */
export function slugHeadings(tree: Root): Map<Heading, string> {
  const slugger = new GithubSlugger();
  const ids = new Map<Heading, string>();
  visit(tree, "heading", (node: Heading) => {
    ids.set(node, slugger.slug(toString(node)));
  });
  return ids;
}

/** Extracts h2/h3 headings from MDX source into a nested list. */
export function extractToc(markdown: string): TocEntry[] {
  const tree = parseMarkdown(markdown);
  const ids = slugHeadings(tree);
  const entries: TocEntry[] = [];
  let currentH2: TocEntry | undefined;

  for (const [node, id] of ids) {
    if (node.depth !== 2 && node.depth !== 3) continue;

    const entry: TocEntry = { id, title: toString(node), children: [] };

    if (node.depth === 2) {
      currentH2 = entry;
      entries.push(entry);
    } else if (currentH2) {
      currentH2.children.push(entry);
    } else {
      entries.push(entry);
    }
  }

  return entries;
}
