import "server-only";
import { toString } from "mdast-util-to-string";
import type { Nodes } from "mdast";
import { getDocsTree, type DocPageNode } from "./source";
import { parseMarkdown, slugHeadings } from "./toc";

/**
 * One searchable unit: a whole page (`heading: null`) or one of its h2/h3
 * sections. Only a snippet of each section's prose ships, never the body;
 * the identifiers a reader is likely to type live in `terms`.
 */
export interface SearchRecord {
  /** `<slug>#<heading id>`, or the bare slug for the page itself. */
  id: string;
  /** Locale-less, e.g. "/docs/react/column-sorting#props". */
  url: string;
  section: string;
  group: string | null;
  page: string;
  heading: string | null;
  /** 1 for the page itself, else the heading's depth. */
  level: 1 | 2 | 3;
  snippet: string;
  /** Inline-code identifiers and first-column table cells. */
  terms: string[];
}

export interface SearchIndex {
  generatedAt: string;
  records: SearchRecord[];
}

const SNIPPET_LENGTH = 200;
/** Longer first-column cells are prose, not a name anyone types. */
const MAX_TERM_LENGTH = 60;
/** A name worth typing: `sortableColumns`, `column.sortable`, `@gridkitjs/react`. */
const IDENTIFIER = /^[@\w$][\w$.\-/]*$/;
/**
 * Inside longer code, only names that can't be plain words count: camelCase,
 * dotted paths and scoped packages, so `(event: ColumnSortEvent) => void`
 * gives `ColumnSortEvent` but not `event`.
 */
const CODE_SHAPED = /[a-z0-9][A-Z]|\w\.\w|^@/;
/** Inline-code values that are types or literals, which every props table repeats. */
const TYPE_KEYWORDS = new Set([
  "boolean",
  "string",
  "number",
  "object",
  "unknown",
  "void",
  "true",
  "false",
  "null",
  "undefined",
]);
/** Parents whose text runs on inline; every other parent ends a run of words. */
const INLINE_PARENTS = new Set(["emphasis", "strong", "delete", "link"]);

interface PageContext {
  page: DocPageNode;
  section: string;
  group: string | null;
}

/** A record being filled while walking the page's blocks. */
interface Draft {
  heading: string | null;
  headingId: string | null;
  level: SearchRecord["level"];
  text: string[];
  terms: Set<string>;
}

function newDraft(
  heading: string | null,
  headingId: string | null,
  level: Draft["level"],
): Draft {
  return { heading, headingId, level, text: [], terms: new Set() };
}

function addIdentifiers(terms: Set<string>, code: string) {
  // `"sort.ascending"` and `setColumnSort(sort)` are still one name.
  const name = code.replace(/^["'](.*)["']$/, "$1").replace(/\(.*\)$/, "");
  if (IDENTIFIER.test(name)) {
    if (!TYPE_KEYWORDS.has(name)) terms.add(name);
    return;
  }
  for (const piece of code.split(/[^\w$.@/-]+/)) {
    // A spread's dots, a sentence's full stop.
    const candidate = piece.replace(/^\.+|\.+$/g, "");
    if (IDENTIFIER.test(candidate) && CODE_SHAPED.test(candidate)) {
      terms.add(candidate);
    }
  }
}

/** `<Kbd>Shift</Kbd>` parses as two tags around a text node; a block of JSX as one node. */
function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/`/g, "");
}

/**
 * Plain text of `node` for a snippet, collecting identifiers into `terms`
 * on the way. JSX tags (parsed as `html`) give their inner text; code
 * fences give nothing, so example code never shows up as prose.
 */
function plainText(node: Nodes, terms: Set<string>): string {
  switch (node.type) {
    case "text":
      return node.value;
    case "inlineCode":
      addIdentifiers(terms, node.value);
      return node.value;
    case "html":
      return stripTags(node.value);
    case "code":
      return "";
    case "break":
      return " ";
    case "image":
      return node.alt ?? "";
    case "table": {
      // The header row ("Prop Type Default Description") says nothing.
      const rows = node.children.slice(1);
      for (const row of rows) {
        const firstCell = row.children[0];
        const name = firstCell ? toString(firstCell).trim() : "";
        if (name && name.length <= MAX_TERM_LENGTH) terms.add(name);
      }
      return rows.map((row) => plainText(row, terms)).join(" ");
    }
  }
  if (!("children" in node)) return "";
  const text = node.children.map((child) => plainText(child, terms)).join("");
  return INLINE_PARENTS.has(node.type) ? text : `${text} `;
}

/** The first `SNIPPET_LENGTH` characters of `text`, cut at a word boundary. */
function toSnippet(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= SNIPPET_LENGTH) return flat;
  const cut = flat.slice(0, SNIPPET_LENGTH);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : SNIPPET_LENGTH)}…`;
}

function toRecord(
  { page, section, group }: PageContext,
  draft: Draft,
): SearchRecord {
  const anchor = draft.headingId ? `#${draft.headingId}` : "";
  const prose = toSnippet(draft.text.join(" "));
  return {
    id: `${page.slug}${anchor}`,
    url: `/docs/${page.slug}${anchor}`,
    section,
    group,
    page: page.title,
    heading: draft.heading,
    level: draft.level,
    // The page record leads with the description the author wrote for it.
    snippet: draft.level === 1 ? page.description || prose : prose,
    terms: [...draft.terms],
  };
}

/** The page record, then one per h2/h3; deeper headings stay in their section. */
function pageRecords(context: PageContext): SearchRecord[] {
  const tree = parseMarkdown(context.page.content);
  const headingIds = slugHeadings(tree);
  let current = newDraft(null, null, 1);
  const drafts = [current];

  for (const node of tree.children) {
    if (node.type === "heading" && (node.depth === 2 || node.depth === 3)) {
      current = newDraft(
        toString(node),
        headingIds.get(node) ?? null,
        node.depth,
      );
      drafts.push(current);
      // The heading is already a field of its own; only harvest its terms.
      plainText(node, current.terms);
      continue;
    }
    current.text.push(plainText(node, current.terms));
  }

  return drafts.map((draft) => toRecord(context, draft));
}

/**
 * The search index for every docs page, built from the same cached docs tree
 * the pages render from, so whatever revalidates the docs revalidates this.
 */
export async function buildSearchIndex(): Promise<SearchIndex> {
  const tree = await getDocsTree();
  const records = tree.flat.flatMap((page) => {
    const placement = tree.bySlug.get(page.slug);
    return pageRecords({
      page,
      section: placement?.section.title ?? "",
      group: placement?.group?.title ?? null,
    });
  });
  return { generatedAt: new Date().toISOString(), records };
}
