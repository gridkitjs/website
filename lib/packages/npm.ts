import "server-only";
import { cache } from "react";
import { PACKAGES } from "@/lib/packages";

/**
 * Release info comes from the npm registry rather than the changelog: a
 * changelog entry lands in gridkit before `pnpm release` publishes it, and
 * npm is what a reader can actually install. The registry is public and
 * unmetered, so this costs no GitHub quota. Nothing calls `revalidateTag` for
 * this tag yet; the hourly fallback picks up a release.
 */
export const PACKAGE_FRESHNESS_TAG = "pkg-freshness";
const REGISTRY_CACHE_SECONDS = 60 * 60;

export interface PackageRelease {
  version: string;
  releasedAt: Date;
}

/** The parts of the registry's package document read here. */
interface Packument {
  "dist-tags": { latest?: string };
  /** Publish time of every version, keyed by version. */
  time: Record<string, string>;
}

export function npmPackageName(slug: string): string {
  return `@gridkitjs/${slug}`;
}

/** The package's page on npmjs.com, or one version's page when `version` is given. */
export function npmPackageUrl(slug: string, version?: string): string {
  const url = `https://www.npmjs.com/package/${npmPackageName(slug)}`;
  return version ? `${url}/v/${version}` : url;
}

/**
 * A package's registry document, or `null` when the registry can't supply
 * it (never published, outage, network error). Release info only decorates
 * a page, so a failure is logged and the page renders without it rather
 * than failing.
 */
const fetchPackument = cache(
  async (slug: string): Promise<Packument | null> => {
    const url = `https://registry.npmjs.org/${npmPackageName(slug)}`;
    try {
      const res = await fetch(url, {
        next: {
          revalidate: REGISTRY_CACHE_SECONDS,
          tags: [PACKAGE_FRESHNESS_TAG],
        },
      });
      if (!res.ok) {
        console.error(`[npm] ${res.status} for ${url}`);
        return null;
      }
      return (await res.json()) as Packument;
    } catch (error) {
      console.error(`[npm] Request for ${url} failed: ${String(error)}`);
      return null;
    }
  },
);

function releaseOf(
  packument: Packument,
  version: string,
): PackageRelease | null {
  const time = packument.time[version];
  return time ? { version, releasedAt: new Date(time) } : null;
}

/** The version npm installs by default (`dist-tags.latest`) and when it was published. */
export async function getLatestRelease(
  slug: string,
): Promise<PackageRelease | null> {
  const packument = await fetchPackument(slug);
  const latest = packument?.["dist-tags"].latest;
  return packument && latest ? releaseOf(packument, latest) : null;
}

/** When `version` was published to npm, or `null` if it hasn't been (yet). */
export async function getReleaseDate(
  slug: string,
  version: string,
): Promise<Date | null> {
  const packument = await fetchPackument(slug);
  return packument ? (releaseOf(packument, version)?.releasedAt ?? null) : null;
}

/** The latest release of every package in `PACKAGES`, keyed by slug; one npm can't supply is left out. */
export async function getLatestReleases(): Promise<
  Record<string, PackageRelease>
> {
  const releases = await Promise.all(
    PACKAGES.map(
      async ({ slug }) => [slug, await getLatestRelease(slug)] as const,
    ),
  );
  return Object.fromEntries(
    releases.filter(
      (entry): entry is readonly [string, PackageRelease] => entry[1] !== null,
    ),
  );
}
