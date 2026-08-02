import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { siteRoutes } from "@/lib/routes";
import { siteConfig } from "@/lib/seo/site-config";

function urlFor(locale: string, path: string): string {
  const suffix = path ? `/${path}` : "";
  return `${siteConfig.baseUrl}/${locale}${suffix}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return siteRoutes.map((path) => ({
    url: urlFor(routing.defaultLocale, path),
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [locale, urlFor(locale, path)]),
      ),
    },
  }));
}
