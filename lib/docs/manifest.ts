import "server-only";
import { readFile } from "node:fs/promises";
import { cache } from "react";
import pin from "@/gridkit.json";
import { fetchFileFromApi, isNotFound } from "./github";

/**
 * `docs-manifest.json`: every docs page, `_meta.json` and changelog in the
 * gridkit repo, with each file's last commit date, in one file. gridkit's
 * `scripts/build-docs-manifest.mjs` builds it on every push that touches docs,
 * a changelog or a package version, and its revalidate-docs workflow commits
 * it to the orphan `docs-meta` branch before calling the revalidation webhook.
 * These types are the part of that script's `DocsManifest` typedef this site
 * reads.
 */
export interface DocsManifest {
  /** Bumped when a field changes meaning or goes away. */
  schemaVersion: number;
  /** When the manifest was built (ISO 8601): the docs' sync time. */
  generatedAt: string;
  /** The gridkit commit the manifest was built from. */
  sha: string;
  /** Keyed by package slug, the folder name under `packages/`. */
  packages: Record<string, ManifestPackage>;
  docs: ManifestDoc[];
  /** Every parsed `_meta.json`, keyed by its folder's repo path, e.g. "packages/react/docs/columns". */
  meta: Record<string, ManifestMeta>;
}

export interface ManifestPackage {
  /** The whole `CHANGELOG.md`; `null` before the package's first release. */
  changelog: { body: string; lastModified: string | null } | null;
}

export interface ManifestDoc {
  /** e.g. "packages/react/docs/columns/column-sorting.mdx". */
  repoPath: string;
  title: string | null;
  description: string | null;
  /** The MDX with its frontmatter stripped. */
  body: string;
  /** Last commit date (ISO 8601 with a UTC offset), `null` for an uncommitted file. */
  lastModified: string | null;
}

export interface ManifestMeta {
  title?: string;
  order?: string[];
}

const MANIFEST_PATH = "docs-manifest.json";
const SCHEMA_VERSION = 1;
/**
 * The gridkit ref the manifest is read at: `DOCS_MANIFEST_REF` when set (the
 * next site and previews name a branch), else the `docs-meta` commit pinned
 * in `gridkit.json`, which production reads so its docs move only when that
 * file does.
 */
const MANIFEST_REF = process.env.DOCS_MANIFEST_REF || pin.docsManifest;
/** A manifest on disk to read instead, for previewing gridkit docs before they're pushed. */
const MANIFEST_FILE = process.env.DOCS_MANIFEST_FILE;

/**
 * Whether the manifest's source has been logged: once per server process, so
 * a build log says which docs it rendered.
 */
let loggedSource = false;

function logSourceOnce(): void {
  if (loggedSource) return;
  loggedSource = true;
  console.info(
    MANIFEST_FILE
      ? `[docs] Reading ${MANIFEST_PATH} from ${MANIFEST_FILE}`
      : `[docs] Reading ${MANIFEST_PATH} at ${MANIFEST_REF}`,
  );
}

/** The manifest's text, or `null` when none is published at `MANIFEST_REF`. */
async function readManifest(): Promise<string | null> {
  logSourceOnce();
  if (MANIFEST_FILE) return readFile(MANIFEST_FILE, "utf8");
  try {
    return await fetchFileFromApi(MANIFEST_PATH, MANIFEST_REF, {
      notFoundExpected: true,
    });
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

/**
 * Whether the missing-manifest warning has been logged. Every page reads the
 * manifest (the footer does), so until one is published the fallback is the
 * normal path and one warning per server process says so.
 */
let warnedMissingManifest = false;

function warnMissingManifestOnce(): void {
  if (warnedMissingManifest) return;
  warnedMissingManifest = true;
  console.warn(
    `[docs] No ${MANIFEST_PATH} on ${MANIFEST_REF}, falling back to per-file fetches`,
  );
}

async function loadDocsManifest(): Promise<DocsManifest | null> {
  const raw = await readManifest();
  if (raw === null) {
    warnMissingManifestOnce();
    return null;
  }
  const manifest = JSON.parse(raw) as DocsManifest;
  if (manifest.schemaVersion !== SCHEMA_VERSION) {
    console.error(
      `[docs] ${MANIFEST_PATH} has schema version ${manifest.schemaVersion}, this site reads ${SCHEMA_VERSION}; falling back to per-file fetches`,
    );
    return null;
  }
  return manifest;
}

export interface DocsSync {
  /** When the manifest was built. */
  syncedAt: Date;
  /** The gridkit commit it was built from. */
  sha: string;
}

/**
 * When the docs were last synced and from which gridkit commit, or `null`
 * without a manifest. It only decorates the footer of every page, so a failed
 * fetch is logged and leaves the line out rather than failing the page.
 */
export async function getDocsSync(): Promise<DocsSync | null> {
  try {
    const manifest = await getDocsManifest();
    return (
      manifest && {
        syncedAt: new Date(manifest.generatedAt),
        sha: manifest.sha,
      }
    );
  } catch (error) {
    console.error(`[docs] No sync time for the footer: ${String(error)}`);
    return null;
  }
}

/**
 * The published docs manifest, or `null` when there is none yet (or it's a
 * schema this site can't read), in which case callers fall back to fetching
 * files one by one. Memoized per request so the docs tree, the changelog and
 * the footer parse it once; across requests it's cached by `fetchFileFromApi`
 * under `DOCS_CACHE_TAG`, which the revalidation webhook busts.
 */
export const getDocsManifest = cache(loadDocsManifest);
