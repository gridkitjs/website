/**
 * Reads the docs manifest the way `lib/docs/manifest.ts` does, for the
 * scripts that check the build against it: `DOCS_MANIFEST_FILE` when set,
 * else `docs-manifest.json` at `DOCS_MANIFEST_REF`, else at the `docs-meta`
 * commit pinned in `gridkit.json`. Importing it loads `.env.local` and
 * `.env`, as `next build` does, without overriding variables already set.
 */
import { readFile } from "node:fs/promises";

for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(new URL(`../../${file}`, import.meta.url));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

export const OWNER = process.env.DOCS_GITHUB_OWNER ?? "gridkitjs";
export const REPO = process.env.DOCS_GITHUB_REPO ?? "gridkitjs";

const PIN = new URL("../../gridkit.json", import.meta.url);

/** A git ref safe to pass to the GitHub API and to a workflow's env file. */
export const MANIFEST_REF = /^(?!.*\.\.)[A-Za-z0-9][A-Za-z0-9._/-]*$/;

/**
 * @typedef {object} ManifestDoc
 * @property {string} repoPath e.g. "packages/react/docs/columns/column-sorting.mdx".
 * @property {string} body The MDX with its frontmatter stripped.
 */

/**
 * @typedef {object} DocsManifest The part of the manifest these scripts read.
 * @property {ManifestDoc[]} docs
 */

/**
 * Where the build reads the manifest from, for messages: a file path, or
 * `<owner>/<repo>@<ref>`.
 *
 * @returns {Promise<{ file: string } | { ref: string }>}
 */
export async function manifestSource() {
  const file = process.env.DOCS_MANIFEST_FILE;
  if (file) return { file };
  const ref = process.env.DOCS_MANIFEST_REF;
  if (ref) return { ref };
  const pin = JSON.parse(await readFile(PIN, "utf8"));
  if (typeof pin.docsManifest !== "string") {
    throw new Error("gridkit.json has no docsManifest commit");
  }
  return { ref: pin.docsManifest };
}

/**
 * A GET against the docs repo's GitHub API, authenticated with
 * `GITHUB_TOKEN` when it's set.
 *
 * @param {string} path Relative to `repos/<owner>/<repo>/`.
 * @param {string} accept
 */
export function githubApi(path, accept) {
  /** @type {Record<string, string>} */
  const headers = { Accept: accept };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return fetch(`https://api.github.com/repos/${OWNER}/${REPO}/${path}`, {
    headers,
  });
}

/**
 * Whether a branch, tag or commit named `ref` exists in the docs repo. Throws
 * on any answer but found or not found.
 *
 * @param {string} ref
 * @returns {Promise<boolean>}
 */
export async function refExists(ref) {
  const path = ref.split("/").map(encodeURIComponent).join("/");
  const response = await githubApi(
    `commits/${path}`,
    "application/vnd.github.sha",
  );
  await response.body?.cancel();
  if (response.ok) return true;
  // 422 is GitHub's answer for a name that resolves to no commit.
  if (response.status === 404 || response.status === 422) return false;
  throw new Error(`GitHub returned ${response.status} for the ref ${ref}`);
}

/**
 * The manifest the build would render, or `null` when none is published at
 * the ref. Throws on any other failure.
 *
 * @returns {Promise<DocsManifest | null>}
 */
export async function readDocsManifest() {
  const source = await manifestSource();
  if ("file" in source) {
    return JSON.parse(await readFile(source.file, "utf8"));
  }
  const response = await githubApi(
    `contents/docs-manifest.json?ref=${encodeURIComponent(source.ref)}`,
    "application/vnd.github.raw+json",
  );
  if (response.ok) return response.json();
  // An unread body keeps the socket open past the end of the script.
  await response.body?.cancel();
  if (response.status === 404) return null;
  throw new Error(
    `GitHub returned ${response.status} for the manifest at ${source.ref}`,
  );
}
