import "server-only";
import { cache } from "react";
import { fetchRawFile, isNotFound } from "@/lib/docs/github";
import { getDocsManifest } from "@/lib/docs/manifest";
import { PACKAGES } from "@/lib/packages";

export interface ChangelogVersion {
  version: string;
  /** Markdown body for just this version (the "## x.y.z" heading itself is stripped — it becomes the page title). */
  content: string;
}

export interface ChangelogSection {
  slug: string;
  title: string;
  /** Path within the gridkit repo, for the edit link. */
  repoPath: string;
  /** The file's last commit date, so the latest version's; `null` when it isn't known. */
  lastModified: Date | null;
  /** Every version, newest first — versions[0] is what /changelog/{slug} (no version segment) shows. */
  versions: ChangelogVersion[];
}

export interface ChangelogTree {
  sections: ChangelogSection[];
}

const VERSION_HEADING = /^##\s+(.+)$/gm;

/** Splits a CHANGELOG.md body into one entry per "## x.y.z" version heading. */
function parseVersions(content: string): ChangelogVersion[] {
  const matches = [...content.matchAll(VERSION_HEADING)];
  return matches.map((match, index) => {
    const version = match[1].trim();
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? content.length;
    return { version, content: content.slice(start, end).trim() };
  });
}

function npmName(slug: string): string {
  return `@gridkitjs/${slug}`;
}

/**
 * The fallback for when no manifest is published: one package's
 * `CHANGELOG.md` from raw.githubusercontent.com, or `null` for a package that
 * has never been released and so has none yet. Any other failure is rethrown
 * so a GitHub blip isn't cached as a missing changelog.
 */
async function fetchChangelogFile(repoPath: string): Promise<string | null> {
  try {
    return await fetchRawFile(repoPath);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

interface ChangelogFile {
  body: string;
  lastModified: Date | null;
}

/** A package's whole `CHANGELOG.md`, or `null` when it has none. */
async function readChangelog(
  slug: string,
  repoPath: string,
): Promise<ChangelogFile | null> {
  const manifest = await getDocsManifest();
  if (!manifest) {
    const body = await fetchChangelogFile(repoPath);
    // Only the manifest carries commit dates.
    return body === null ? null : { body, lastModified: null };
  }
  const changelog = manifest.packages[slug]?.changelog;
  if (!changelog) return null;
  return {
    body: changelog.body,
    lastModified: changelog.lastModified
      ? new Date(changelog.lastModified)
      : null,
  };
}

async function buildSection(
  pkg: (typeof PACKAGES)[number],
): Promise<ChangelogSection | undefined> {
  const repoPath = `packages/${pkg.slug}/CHANGELOG.md`;
  const changelog = await readChangelog(pkg.slug, repoPath);
  if (changelog === null) return undefined;

  const versions = parseVersions(changelog.body);
  if (versions.length === 0) return undefined;

  return {
    slug: pkg.slug,
    title: npmName(pkg.slug),
    repoPath,
    lastModified: changelog.lastModified,
    versions,
  };
}

async function loadChangelogTree(): Promise<ChangelogTree> {
  const sections = (
    await Promise.all(PACKAGES.map((pkg) => buildSection(pkg)))
  ).filter((section): section is ChangelogSection => section != null);

  return { sections };
}

/** The full changelog tree, memoized per-request with React's `cache()` — see `getDocsTree` for why. */
export const getChangelogTree = cache(loadChangelogTree);
