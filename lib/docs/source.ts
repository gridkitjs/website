import "server-only";
import { cache } from "react";
import matter from "gray-matter";
import { fetchRawFile, fetchRepoTree, type GithubTreeEntry } from "./github";
import { PACKAGES as PACKAGE_REGISTRY } from "@/lib/packages";

export interface DocPageNode {
  /** Flat, locale-less path used in the site's URLs, e.g. "react/column-templates". */
  slug: string;
  title: string;
  description: string;
  /** Path within the gridkit repo, for last-updated lookups. */
  repoPath: string;
  /** MDX body with frontmatter already stripped. */
  content: string;
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
  docsPath: string;
}

const PACKAGES: PackageConfig[] = PACKAGE_REGISTRY.map(({ slug }) => ({
  slug,
  docsPath: `packages/${slug}/docs`,
}));

interface MetaJson {
  title?: string;
  order?: string[];
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

async function readMetaJson(
  entries: GithubTreeEntry[],
  dirPath: string,
): Promise<MetaJson | undefined> {
  const metaPath = `${dirPath}/_meta.json`;
  const exists = entries.some(
    (entry) => entry.path === metaPath && entry.type === "blob",
  );
  if (!exists) return undefined;
  return JSON.parse(await fetchRawFile(metaPath)) as MetaJson;
}

async function readDocPage(
  repoPath: string,
  slug: string,
): Promise<DocPageNode> {
  const { data, content } = matter(await fetchRawFile(repoPath));
  return {
    slug,
    title: typeof data.title === "string" ? data.title : slug,
    description: typeof data.description === "string" ? data.description : "",
    repoPath,
    content,
  };
}

async function buildSection(
  pkg: PackageConfig,
  entries: GithubTreeEntry[],
): Promise<DocSectionNode | undefined> {
  const prefix = `${pkg.docsPath}/`;
  const scoped = entries.filter((entry) => entry.path.startsWith(prefix));
  if (scoped.length === 0) return undefined;

  const rootMeta = await readMetaJson(entries, pkg.docsPath);

  const topLevelFiles = scoped.filter(
    (entry) =>
      entry.type === "blob" &&
      entry.path.endsWith(".mdx") &&
      !entry.path.slice(prefix.length).includes("/"),
  );
  const groupDirs = [
    ...new Set(
      scoped
        .filter(
          (entry) =>
            entry.type === "blob" &&
            entry.path.slice(prefix.length).includes("/"),
        )
        .map((entry) => entry.path.slice(prefix.length).split("/")[0]),
    ),
  ];

  const pageEntries = await Promise.all(
    topLevelFiles.map(async (entry) => {
      const fileName = entry.path.slice(prefix.length).replace(/\.mdx$/, "");
      // The package's overview page is the section's own root, e.g. /docs/core
      // rather than /docs/core/overview.
      const slug =
        fileName === "overview" ? pkg.slug : `${pkg.slug}/${fileName}`;
      return { key: fileName, page: await readDocPage(entry.path, slug) };
    }),
  );
  const pages = sortByMeta(pageEntries, rootMeta?.order).map(
    (entry) => entry.page,
  );

  const groupEntries = await Promise.all(
    groupDirs.map(async (dir) => {
      const groupPath = `${pkg.docsPath}/${dir}`;
      const groupMeta = await readMetaJson(entries, groupPath);
      const files = scoped.filter(
        (entry) =>
          entry.type === "blob" &&
          entry.path.startsWith(`${groupPath}/`) &&
          entry.path.endsWith(".mdx"),
      );
      const groupPageEntries = await Promise.all(
        files.map(async (entry) => {
          const fileName = entry.path
            .slice(groupPath.length + 1)
            .replace(/\.mdx$/, "");
          return {
            key: fileName,
            page: await readDocPage(entry.path, `${pkg.slug}/${fileName}`),
          };
        }),
      );
      const groupPages = sortByMeta(groupPageEntries, groupMeta?.order).map(
        (entry) => entry.page,
      );
      return {
        key: dir,
        title: groupMeta?.title ?? titleCase(dir),
        pages: groupPages,
      };
    }),
  );
  const groups = sortByMeta(groupEntries, rootMeta?.order);

  const overview = pages.find((page) => page.slug === pkg.slug);
  return {
    slug: pkg.slug,
    title: titleCase(pkg.slug),
    description: overview?.description ?? "",
    pages,
    groups,
  };
}

async function loadDocsTree(): Promise<DocsTree> {
  const entries = await fetchRepoTree();
  const sections = (
    await Promise.all(PACKAGES.map((pkg) => buildSection(pkg, entries)))
  ).filter((section): section is DocSectionNode => section != null);

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
 * sidebar, breadcrumbs, prev/next, and page body all share one fetch —
 * cross-request freshness is handled by `fetchRepoTree`/`fetchRawFile`'s own
 * Next `fetch` cache (`DOCS_CACHE_TAG`), not by this memoization.
 */
export const getDocsTree = cache(loadDocsTree);
