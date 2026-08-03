import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getDocsTree } from "@/lib/docs/source";
import { getChangelogTree } from "@/lib/changelog/source";
import { fetchLastCommitDate } from "@/lib/docs/github";
import { siteConfig } from "@/lib/seo/site-config";

function urlFor(locale: string, path: string): string {
  const suffix = path ? `/${path}` : "";
  return `${siteConfig.baseUrl}/${locale}${suffix}`;
}

function languagesFor(path: string) {
  return Object.fromEntries([
    ...routing.locales.map((locale) => [locale, urlFor(locale, path)]),
    ["x-default", urlFor(routing.defaultLocale, path)],
  ]);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [docsTree, changelogTree] = await Promise.all([
    getDocsTree(),
    getChangelogTree(),
  ]);

  const staticEntries = ["", "docs", "changelog"].map((path) => ({
    path,
    lastModified: undefined as Date | undefined,
  }));
  const docEntries = await Promise.all(
    docsTree.flat.map(async (page) => ({
      path: `docs/${page.slug}`,
      lastModified: (await fetchLastCommitDate(page.repoPath)) ?? undefined,
    })),
  );
  const changelogEntries = (
    await Promise.all(
      changelogTree.sections.map(async (section) => {
        // Only the latest version's URL (the bare package path) reflects the
        // file's last-commit date accurately — older versions keep the date
        // they actually shipped, which changesets doesn't record, so we
        // don't attach a misleading one.
        const latestLastModified =
          (await fetchLastCommitDate(section.repoPath)) ?? undefined;
        return section.versions.map((version, index) => ({
          path:
            index === 0
              ? `changelog/${section.slug}`
              : `changelog/${section.slug}/${version.version}`,
          lastModified: index === 0 ? latestLastModified : undefined,
        }));
      }),
    )
  ).flat();

  return [...staticEntries, ...docEntries, ...changelogEntries].map(
    ({ path, lastModified }) => ({
      url: urlFor(routing.defaultLocale, path),
      lastModified,
      alternates: {
        languages: languagesFor(path),
      },
    }),
  );
}
