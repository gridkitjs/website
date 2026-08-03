import "server-only";

/**
 * Docs content is authored in the `gridkit` monorepo (packages/*\/docs) and
 * fetched from GitHub rather than bundled into this site, so editors can
 * update docs without a website redeploy. Every request here goes through
 * Next's fetch cache — see `DOCS_CACHE_TAG` for the on-demand revalidation
 * hook and `DOCS_CACHE_SECONDS` for the time-based fallback.
 */

export const DOCS_CACHE_TAG = "docs-content";
const DOCS_CACHE_SECONDS = 60 * 60;

const OWNER = process.env.DOCS_GITHUB_OWNER ?? "blagojablazhevski";
const REPO = process.env.DOCS_GITHUB_REPO ?? "gridkit";
const BRANCH = process.env.DOCS_GITHUB_BRANCH ?? "main";

function githubHeaders(accept: string): HeadersInit {
  const headers: Record<string, string> = { Accept: accept };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

export interface GithubTreeEntry {
  path: string;
  type: "blob" | "tree";
}

/** The full recursive file tree of the docs repo, for building the docs source tree from. */
export async function fetchRepoTree(): Promise<GithubTreeEntry[]> {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=1`,
    {
      headers: githubHeaders("application/vnd.github+json"),
      next: { revalidate: DOCS_CACHE_SECONDS, tags: [DOCS_CACHE_TAG] },
    },
  );
  if (!res.ok) {
    throw new Error(`Failed to list ${OWNER}/${REPO}@${BRANCH}: ${res.status}`);
  }
  const data = (await res.json()) as { tree: GithubTreeEntry[] };
  return data.tree;
}

/** The raw text content of a single file at `repoPath` (e.g. "packages/core/docs/overview.mdx"). */
export async function fetchRawFile(repoPath: string): Promise<string> {
  const res = await fetch(
    `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${repoPath}`,
    {
      headers: githubHeaders("text/plain"),
      next: { revalidate: DOCS_CACHE_SECONDS, tags: [DOCS_CACHE_TAG] },
    },
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch ${repoPath}: ${res.status}`);
  }
  return res.text();
}

/** The GitHub URL for editing `repoPath` directly, e.g. via github.dev's web editor. */
export function getEditUrl(repoPath: string): string {
  return `https://github.com/${OWNER}/${REPO}/edit/${BRANCH}/${repoPath}`;
}

/** The commit date of the last change to `repoPath`, or `null` if it has no history (e.g. a new file not yet pushed). */
export async function fetchLastCommitDate(
  repoPath: string,
): Promise<Date | null> {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/commits?path=${encodeURIComponent(repoPath)}&sha=${BRANCH}&per_page=1`,
    {
      headers: githubHeaders("application/vnd.github+json"),
      next: { revalidate: DOCS_CACHE_SECONDS, tags: [DOCS_CACHE_TAG] },
    },
  );
  if (!res.ok) return null;
  const commits = (await res.json()) as Array<{
    commit: { committer: { date: string } | null };
  }>;
  const date = commits[0]?.commit.committer?.date;
  return date ? new Date(date) : null;
}
