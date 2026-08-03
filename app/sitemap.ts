import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getDocsTree } from "@/lib/docs/source";
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
  const tree = await getDocsTree();

  const staticEntries = ["", "docs"].map((path) => ({
    path,
    lastModified: undefined as Date | undefined,
  }));
  const docEntries = await Promise.all(
    tree.flat.map(async (page) => ({
      path: `docs/${page.slug}`,
      lastModified: (await fetchLastCommitDate(page.repoPath)) ?? undefined,
    })),
  );

  return [...staticEntries, ...docEntries].map(({ path, lastModified }) => ({
    url: urlFor(routing.defaultLocale, path),
    lastModified,
    alternates: {
      languages: languagesFor(path),
    },
  }));
}
