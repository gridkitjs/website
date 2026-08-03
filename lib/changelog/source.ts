import "server-only";
import { cache } from "react";
import { fetchRawFile } from "@/lib/docs/github";
import { PACKAGES } from "@/lib/packages";

export interface ChangelogVersion {
  version: string;
  /** Markdown body for just this version (the "## x.y.z" heading itself is stripped — it becomes the page title). */
  content: string;
}

export interface ChangelogSection {
  slug: string;
  title: string;
  /** Path within the gridkit repo, for last-updated/edit-url lookups. */
  repoPath: string;
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

async function buildSection(
  pkg: (typeof PACKAGES)[number],
): Promise<ChangelogSection | undefined> {
  const repoPath = `packages/${pkg.slug}/CHANGELOG.md`;
  let content: string;
  try {
    content = await fetchRawFile(repoPath);
  } catch {
    return undefined;
  }

  const versions = parseVersions(content);
  if (versions.length === 0) return undefined;

  return { slug: pkg.slug, title: npmName(pkg.slug), repoPath, versions };
}

async function loadChangelogTree(): Promise<ChangelogTree> {
  const sections = (
    await Promise.all(PACKAGES.map((pkg) => buildSection(pkg)))
  ).filter((section): section is ChangelogSection => section != null);

  return { sections };
}

/** The full changelog tree, memoized per-request with React's `cache()` — see `getDocsTree` for why. */
export const getChangelogTree = cache(loadChangelogTree);
