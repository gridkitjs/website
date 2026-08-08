import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import GithubSlugger from "github-slugger";
import type { Heading } from "mdast";

export interface TocEntry {
  id: string;
  title: string;
  children: TocEntry[];
}

const headingParser = unified().use(remarkParse).use(remarkGfm);

/**
 * Extracts h2/h3 headings from MDX source into a nested list, slugging
 * titles the same way `rehype-slug` does at render time (both use
 * `github-slugger`) so generated ids match the ones on the rendered
 * heading elements.
 */
export function extractToc(markdown: string): TocEntry[] {
  const tree = headingParser.parse(markdown);
  const slugger = new GithubSlugger();
  const entries: TocEntry[] = [];
  let currentH2: TocEntry | undefined;

  visit(tree, "heading", (node: Heading) => {
    if (node.depth !== 2 && node.depth !== 3) return;

    const title = toString(node);
    const entry: TocEntry = { id: slugger.slug(title), title, children: [] };

    if (node.depth === 2) {
      currentH2 = entry;
      entries.push(entry);
    } else if (currentH2) {
      currentH2.children.push(entry);
    } else {
      entries.push(entry);
    }
  });

  return entries;
}
