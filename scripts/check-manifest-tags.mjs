/**
 * Fails when a page in the docs manifest the build reads uses a JSX tag this
 * site doesn't register. The two repos couple by tag name only, and an
 * unregistered tag renders as a placeholder, so a release that pins docs
 * ahead of their live examples fails here until the examples land.
 *
 * The manifest is the one the build renders (`scripts/lib/docs-manifest.mjs`:
 * `DOCS_MANIFEST_FILE`, `DOCS_MANIFEST_REF` or the pin in `gridkit.json`).
 * The registered tags are `public/mdx-tags.json`, which `prebuild` writes, so
 * run this after a build or after `node scripts/export-mdx-tags.mjs`.
 *
 * Tags are found as gridkit's `scripts/check-mdx-tags.mjs` finds them: every
 * opening PascalCase tag outside fenced code, code spans and comments.
 *
 * Usage: node scripts/check-manifest-tags.mjs
 */
import { readFile } from "node:fs/promises";
import {
  OWNER,
  REPO,
  manifestSource,
  readDocsManifest,
} from "./lib/docs-manifest.mjs";

const TAGS_FILE = new URL("../public/mdx-tags.json", import.meta.url);

const IN_CI = process.env.GITHUB_ACTIONS === "true";

const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/;
const FENCE_OPEN = /^\s*(`{3,}|~{3,})/;
/** A code span: a run of backticks, its text, and a run of the same length. */
const CODE_SPAN = /(`+)(?!`)(?:(?!\n[ \t]*\n)[\s\S])*?[^`]\1(?!`)/g;
const HTML_COMMENT = /<!--[\s\S]*?-->/g;
const MDX_COMMENT = /\{\/\*[\s\S]*?\*\/\}/g;
/** An opening JSX tag whose name is PascalCase; lowercase ones are HTML. */
const COMPONENT_TAG = /<([A-Z]\w*(?:\.\w+)*)(?=[\s/>])/g;

/**
 * @typedef {object} TagUse
 * @property {string} tag
 * @property {string} repoPath
 * @property {number} line 1-based, in the page's body (frontmatter stripped).
 */

/**
 * Replaces every character but line breaks with a space, so text removed
 * from a page leaves every later line number where it was.
 *
 * @param {string} text
 */
function blank(text) {
  return text.replace(/[^\n]/g, " ");
}

/**
 * Blanks fenced code blocks, which may show a `<Tag>` as text. A fence
 * closes on a line holding only a run of its own character at least as
 * long as the one that opened it, or at the end of the page.
 *
 * @param {string} source
 */
function blankCodeFences(source) {
  /** @type {string | null} */
  let fence = null;
  return source
    .split("\n")
    .map((line) => {
      if (fence === null) {
        const open = FENCE_OPEN.exec(line);
        if (open) fence = open[1] ?? null;
        return open ? blank(line) : line;
      }
      const trimmed = line.trim();
      const char = fence.charAt(0);
      if (
        trimmed.length >= fence.length &&
        [...trimmed].every((c) => c === char)
      ) {
        fence = null;
      }
      return blank(line);
    })
    .join("\n");
}

/**
 * The page with everything that is not markup blanked out: frontmatter,
 * fenced code, code spans and comments.
 *
 * @param {string} source
 */
function markupOnly(source) {
  return blankCodeFences(source.replace(FRONTMATTER, blank))
    .replace(CODE_SPAN, blank)
    .replace(HTML_COMMENT, blank)
    .replace(MDX_COMMENT, blank);
}

/**
 * @param {string} source
 * @param {string} repoPath
 * @returns {TagUse[]}
 */
function findTagUses(source, repoPath) {
  const markup = markupOnly(source.replace(/\r\n/g, "\n"));
  return [...markup.matchAll(COMPONENT_TAG)].map((match) => ({
    tag: match[1] ?? "",
    repoPath,
    line: markup.slice(0, match.index).split("\n").length,
  }));
}

/** @returns {Promise<Set<string>>} */
async function loadRegisteredTags() {
  let text;
  try {
    text = await readFile(TAGS_FILE, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    throw new Error(
      "public/mdx-tags.json is missing: run `node scripts/export-mdx-tags.mjs` or `npm run build` first",
    );
  }
  const value = JSON.parse(text);
  if (
    !Array.isArray(value) ||
    !value.every((item) => typeof item === "string")
  ) {
    throw new Error("public/mdx-tags.json is not a JSON array of tag names");
  }
  return new Set(value);
}

/** @param {TagUse} use */
function reportUnregistered({ tag, repoPath, line }) {
  const message = `${repoPath} (body line ${line}): <${tag}> is not registered in the MDX component map`;
  console.error(IN_CI ? `::error title=Manifest tags::${message}` : message);
}

/** @returns {Promise<number>} The exit code. */
async function main() {
  const source = await manifestSource();
  const from =
    "file" in source ? source.file : `${OWNER}/${REPO}@${source.ref}`;
  const [registered, manifest] = await Promise.all([
    loadRegisteredTags(),
    readDocsManifest(),
  ]);
  if (manifest === null) {
    console.error(`No docs-manifest.json in ${from}.`);
    return 1;
  }

  const uses = manifest.docs.flatMap((doc) =>
    findTagUses(doc.body, doc.repoPath),
  );
  const unregistered = uses.filter(({ tag }) => !registered.has(tag));
  if (unregistered.length > 0) {
    unregistered.forEach(reportUnregistered);
    console.error(
      `${unregistered.length} unregistered tag use(s) in the manifest from ${from}. ` +
        "Add the live example or component to this site, or pin a manifest that doesn't use it.",
    );
    return 1;
  }

  const distinct = new Set(uses.map(({ tag }) => tag)).size;
  console.log(
    `${uses.length} tag uses in ${manifest.docs.length} pages of the manifest from ${from}, ` +
      `all registered (${distinct} distinct tags).`,
  );
  return 0;
}

// Sets the exit code rather than calling `process.exit()`, which can abort
// Node on Windows while `fetch`'s socket is still closing.
process.exitCode = await main();
