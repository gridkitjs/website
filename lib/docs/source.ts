import "server-only";
import { cache } from "react";
import matter from "gray-matter";
import { fetchRawFile, fetchRepoTree, isNotFound } from "./github";
import { getDocsManifest, type DocsManifest } from "./manifest";
import { PACKAGES as PACKAGE_REGISTRY } from "@/lib/packages";

export interface DocPageNode {
  /** Flat, locale-less path used in the site's URLs, e.g. "react/column-templates". */
  slug: string;
  title: string;
  description: string;
  /** Path within the gridkit repo, for the edit link. */
  repoPath: string;
  /** MDX body with frontmatter already stripped. */
  content: string;
  /** The file's last commit date; `null` when it isn't known. */
  lastModified: Date | null;
}

export interface DocGroupNode {
  key: string;
  title: string;
  pages: DocPageNode[];
}

export interface DocSectionNode {
  slug: string;
  title: string;
  description: string;
  pages: DocPageNode[];
  groups: DocGroupNode[];
}

export interface DocsTree {
  sections: DocSectionNode[];
  /** Every page across every section/group, in nav order — for prev/next. */
  flat: DocPageNode[];
  bySlug: Map<
    string,
    { page: DocPageNode; section: DocSectionNode; group?: DocGroupNode }
  >;
}

interface PackageConfig {
  slug: string;
  title: string;
  docsPath: string;
}

const PACKAGES: PackageConfig[] = PACKAGE_REGISTRY.map(({ slug, title }) => ({
  slug,
  title: title ?? titleCase(slug),
  docsPath: `packages/${slug}/docs`,
}));

interface MetaJson {
  title?: string;
  order?: string[];
}

/** One `.mdx` page as read from GitHub, before it has a place in the tree. */
interface DocsFile {
  repoPath: string;
  title: string | null;
  description: string | null;
  content: string;
  lastModified: Date | null;
}

/** What the tree is built from: every page, and every `_meta.json` keyed by its folder's repo path. */
interface DocsSource {
  files: DocsFile[];
  meta: Map<string, MetaJson>;
}

function titleCase(key: string): string {
  return key
    .split("-")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

/** Sorts by `_meta.json`'s `order` array when present, else alphabetically. Unlisted entries sort after listed ones. */
function sortByMeta<T extends { key: string }>(
  entries: T[],
  order: string[] | undefined,
): T[] {
  if (!order) {
    return [...entries].sort((a, b) => a.key.localeCompare(b.key));
  }
  const rank = new Map(order.map((key, index) => [key, index]));
  return [...entries].sort((a, b) => {
    const rankA = rank.get(a.key) ?? order.length;
    const rankB = rank.get(b.key) ?? order.length;
    return rankA - rankB || a.key.localeCompare(b.key);
  });
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

/**
 * Fetches and parses one docs file, or returns `undefined` when that file
 * alone is bad: missing from raw.githubusercontent.com (its CDN can lag the
 * tree) or unparseable. Those are logged and skipped so one broken file
 * doesn't take down every page. Any other fetch failure (rate limit, outage)
 * is rethrown, so ISR keeps serving the last good render instead of caching
 * a tree with pages missing.
 */
async function readDocsFile<T>(
  repoPath: string,
  parse: (raw: string) => T,
): Promise<T | undefined> {
  let raw: string;
  try {
    raw = await fetchRawFile(repoPath);
  } catch (error) {
    if (!isNotFound(error)) throw error;
    console.error(`[docs] Skipping ${repoPath}: not found`);
    return undefined;
  }
  try {
    return parse(raw);
  } catch (error) {
    console.error(`[docs] Skipping ${repoPath}: ${String(error)}`);
    return undefined;
  }
}

function parseDocsFile(repoPath: string, raw: string): DocsFile {
  const { data, content } = matter(raw);
  return {
    repoPath,
    title: typeof data.title === "string" ? data.title : null,
    description: typeof data.description === "string" ? data.description : null,
    content,
    // Only the manifest carries commit dates.
    lastModified: null,
  };
}

function folderOf(repoPath: string): string {
  return repoPath.slice(0, repoPath.lastIndexOf("/"));
}

/**
 * The fallback for when no manifest is published: the repo tree, then every
 * docs file one by one from raw.githubusercontent.com — ~57 requests, and its
 * CDN can serve a file from before the push that triggered the refetch.
 */
async function loadDocsSourceFileByFile(): Promise<DocsSource> {
  const entries = await fetchRepoTree();
  const docsPaths = entries
    .filter(
      (entry) =>
        entry.type === "blob" &&
        PACKAGES.some((pkg) => entry.path.startsWith(`${pkg.docsPath}/`)),
    )
    .map((entry) => entry.path);

  const [files, metaEntries] = await Promise.all([
    Promise.all(
      docsPaths
        .filter((path) => path.endsWith(".mdx"))
        .map((path) => readDocsFile(path, (raw) => parseDocsFile(path, raw))),
    ),
    Promise.all(
      docsPaths
        .filter((path) => path.endsWith("/_meta.json"))
        .map(async (path) => {
          const meta = await readDocsFile(
            path,
            (raw) => JSON.parse(raw) as MetaJson,
          );
          return meta && ([folderOf(path), meta] as const);
        }),
    ),
  ]);
  return {
    files: files.filter(isDefined),
    meta: new Map(metaEntries.filter(isDefined)),
  };
}

function docsSourceFromManifest(manifest: DocsManifest): DocsSource {
  return {
    files: manifest.docs.map((doc) => ({
      repoPath: doc.repoPath,
      title: doc.title,
      description: doc.description,
      content: doc.body,
      lastModified: doc.lastModified ? new Date(doc.lastModified) : null,
    })),
    meta: new Map(Object.entries(manifest.meta)),
  };
}

async function loadDocsSource(): Promise<DocsSource> {
  const manifest = await getDocsManifest();
  return manifest
    ? docsSourceFromManifest(manifest)
    : loadDocsSourceFileByFile();
}

function toPageNode(file: DocsFile, slug: string): DocPageNode {
  return {
    slug,
    title: file.title ?? slug,
    description: file.description ?? "",
    repoPath: file.repoPath,
    content: file.content,
    lastModified: file.lastModified,
  };
}

function buildSection(
  pkg: PackageConfig,
  { files, meta }: DocsSource,
): DocSectionNode | undefined {
  const prefix = `${pkg.docsPath}/`;
  const scoped = files.filter((file) => file.repoPath.startsWith(prefix));
  if (scoped.length === 0) return undefined;

  const relativePath = (file: DocsFile) => file.repoPath.slice(prefix.length);
  const rootOrder = meta.get(pkg.docsPath)?.order;

  const pages = sortByMeta(
    scoped
      .filter((file) => !relativePath(file).includes("/"))
      .map((file) => {
        const fileName = relativePath(file).replace(/\.mdx$/, "");
        const isOverview = fileName === "overview";
        // The package's overview page is the section's own root, e.g.
        // /docs/core rather than /docs/core/overview. Every package titles it
        // "Overview", so name the package to keep the overview pages' titles
        // distinct.
        const slug = isOverview ? pkg.slug : `${pkg.slug}/${fileName}`;
        const page = toPageNode(file, slug);
        return {
          key: fileName,
          page: isOverview ? { ...page, title: `${pkg.title} overview` } : page,
        };
      }),
    rootOrder,
  ).map((entry) => entry.page);

  const groupDirs = [
    ...new Set(
      scoped
        .map(relativePath)
        .filter((path) => path.includes("/"))
        .map((path) => path.split("/")[0]),
    ),
  ];
  const groups = sortByMeta(
    groupDirs.map((dir) => {
      const groupPath = `${pkg.docsPath}/${dir}`;
      const groupMeta = meta.get(groupPath);
      const groupPages = sortByMeta(
        scoped
          .filter((file) => file.repoPath.startsWith(`${groupPath}/`))
          .map((file) => {
            const fileName = file.repoPath
              .slice(groupPath.length + 1)
              .replace(/\.mdx$/, "");
            return {
              key: fileName,
              page: toPageNode(file, `${pkg.slug}/${fileName}`),
            };
          }),
        groupMeta?.order,
      ).map((entry) => entry.page);
      return {
        key: dir,
        title: groupMeta?.title ?? titleCase(dir),
        pages: groupPages,
      };
    }),
    rootOrder,
  );

  const overview = pages.find((page) => page.slug === pkg.slug);
  return {
    slug: pkg.slug,
    title: pkg.title,
    description: overview?.description ?? "",
    pages,
    groups,
  };
}

async function loadDocsTree(): Promise<DocsTree> {
  const source = await loadDocsSource();
  const sections = PACKAGES.map((pkg) => buildSection(pkg, source)).filter(
    isDefined,
  );

  const flat: DocPageNode[] = [];
  const bySlug: DocsTree["bySlug"] = new Map();
  for (const section of sections) {
    for (const page of section.pages) {
      flat.push(page);
      bySlug.set(page.slug, { page, section });
    }
    for (const group of section.groups) {
      for (const page of group.pages) {
        flat.push(page);
        bySlug.set(page.slug, { page, section, group });
      }
    }
  }

  return { sections, flat, bySlug };
}

/**
 * The full docs tree. Memoized per-request with React's `cache()` so the
 * sidebar, breadcrumbs, prev/next, and page body all share one build;
 * cross-request freshness is the Next `fetch` cache's job (see
 * `getDocsManifest`), not this memoization's.
 */
export const getDocsTree = cache(loadDocsTree);
