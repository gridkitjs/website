import "server-only";

/**
 * Docs content is authored in the `gridkit` monorepo (packages/*\/docs) and
 * fetched from GitHub rather than bundled into this site, so editors can
 * update docs without a website redeploy. Every request here goes through
 * Next's fetch cache — see `DOCS_CACHE_TAG` for the on-demand revalidation
 * hook and `DOCS_CACHE_SECONDS` for the time-based fallback, which a file
 * read at a commit SHA goes without because its content can never change.
 */

export const DOCS_CACHE_TAG = "docs-content";
const DOCS_CACHE_SECONDS = 60 * 60;

const OWNER = process.env.DOCS_GITHUB_OWNER ?? "gridkitjs";
const REPO = process.env.DOCS_GITHUB_REPO ?? "gridkitjs";
const BRANCH = process.env.DOCS_GITHUB_BRANCH ?? "main";

function githubHeaders(accept: string): HeadersInit {
  const headers: Record<string, string> = { Accept: accept };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

/**
 * A non-OK response from GitHub. Carries the status so callers can tell a
 * missing file (404) from a failure that must not be cached, such as a rate
 * limit (403/429) or an outage.
 */
export class GithubFetchError extends Error {
  readonly resource: string;
  readonly status: number;

  constructor(resource: string, status: number) {
    super(`GitHub request for ${resource} failed: ${status}`);
    this.name = "GithubFetchError";
    this.resource = resource;
    this.status = status;
  }
}

/** Whether `error` is GitHub reporting that the requested file or ref doesn't exist. */
export function isNotFound(error: unknown): boolean {
  return error instanceof GithubFetchError && error.status === 404;
}

export interface GithubFetchOptions {
  /**
   * The caller handles a 404 as an ordinary outcome, so it isn't logged as an
   * error here; the `GithubFetchError` is still thrown.
   */
  notFoundExpected?: boolean;
}

interface CacheOptions {
  /**
   * The response can never change, so it's cached without the time-based
   * fallback. Next caches only 200 responses, so a failure is still retried.
   */
  immutable?: boolean;
}

/** Whether `ref` is a full 40-character commit SHA rather than a branch or tag. */
function isCommitSha(ref: string): boolean {
  return /^[0-9a-f]{40}$/i.test(ref);
}

/**
 * A cached GET against GitHub; throws `GithubFetchError` on a non-OK response
 * so no failure is cached as content.
 */
async function fetchFromGithub(
  url: string,
  resource: string,
  accept: string,
  {
    notFoundExpected = false,
    immutable = false,
  }: GithubFetchOptions & CacheOptions = {},
): Promise<Response> {
  const res = await fetch(url, {
    headers: githubHeaders(accept),
    next: {
      revalidate: immutable ? false : DOCS_CACHE_SECONDS,
      tags: [DOCS_CACHE_TAG],
    },
  });
  if (res.status === 404 && notFoundExpected) {
    throw new GithubFetchError(resource, res.status);
  }
  if (!res.ok) {
    // raw.githubusercontent.com sends no rate-limit headers; the REST API does.
    const rateLimitRemaining =
      res.headers.get("x-ratelimit-remaining") ?? "n/a";
    console.error(
      `[github] ${res.status} for ${resource} (${url}), rate limit remaining: ${rateLimitRemaining}`,
    );
    throw new GithubFetchError(resource, res.status);
  }
  return res;
}

export interface GithubTreeEntry {
  path: string;
  type: "blob" | "tree";
}

/** The full recursive file tree of the docs repo, for building the docs source tree from. */
export async function fetchRepoTree(): Promise<GithubTreeEntry[]> {
  const res = await fetchFromGithub(
    `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=1`,
    `the ${OWNER}/${REPO}@${BRANCH} tree`,
    "application/vnd.github+json",
  );
  const data = (await res.json()) as { tree: GithubTreeEntry[] };
  return data.tree;
}

/** The raw text content of a single file at `repoPath` (e.g. "packages/core/docs/overview.mdx"). */
export async function fetchRawFile(repoPath: string): Promise<string> {
  const res = await fetchFromGithub(
    `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${repoPath}`,
    repoPath,
    "text/plain",
  );
  return res.text();
}

/**
 * The raw content of `repoPath` at `ref` through the contents API. Unlike
 * raw.githubusercontent.com, the API isn't behind a CDN, so it serves a push
 * the moment it lands; it costs one call against the rate limit. The raw
 * media type is what lets it return files over the JSON response's 1 MB cap.
 * At a commit SHA the file can't change, so it's cached without expiry; it
 * still carries `DOCS_CACHE_TAG`, like every other fetch here.
 */
export async function fetchFileFromApi(
  repoPath: string,
  ref: string,
  options?: GithubFetchOptions,
): Promise<string> {
  const res = await fetchFromGithub(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${repoPath}?ref=${encodeURIComponent(ref)}`,
    `${repoPath}@${ref}`,
    "application/vnd.github.raw+json",
    { ...options, immutable: isCommitSha(ref) },
  );
  return res.text();
}

/** The GitHub URL for editing `repoPath` directly, e.g. via github.dev's web editor. */
export function getEditUrl(repoPath: string): string {
  return `https://github.com/${OWNER}/${REPO}/edit/${BRANCH}/${repoPath}`;
}

/** The GitHub URL of a commit in the docs repo. */
export function getCommitUrl(sha: string): string {
  return `https://github.com/${OWNER}/${REPO}/commit/${sha}`;
}
