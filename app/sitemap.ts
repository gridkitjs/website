import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getDocsTree } from "@/lib/docs/source";
import { siteConfig } from "@/lib/seo/site-config";

function urlFor(locale: string, path: string): string {
  const suffix = path ? `/${path}` : "";
  return `${siteConfig.baseUrl}/${locale}${suffix}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tree = await getDocsTree();
  const routes = ["", "docs", ...tree.flat.map((page) => `docs/${page.slug}`)];

  return routes.map((path) => ({
    url: urlFor(routing.defaultLocale, path),
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [locale, urlFor(locale, path)]),
      ),
    },
  }));
}
