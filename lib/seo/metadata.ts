import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { ogImageSize } from "./og-image";
import { siteConfig } from "./site-config";

interface BuildMetadataOptions {
  title: string;
  description: string;
  /** Locale-less path, e.g. "" for the homepage or "docs/react/data-grid". */
  path: string;
  locale: string;
  /**
   * Locale-less path of the page's Open Graph image route, e.g.
   * "og/docs/react/data-grid". Defaults to the site image,
   * `app/[locale]/opengraph-image.tsx`.
   */
  image?: string;
}

function localizedUrl(locale: string, path: string): string {
  const suffix = path ? `/${path}` : "";
  return `${siteConfig.baseUrl}/${locale}${suffix}`;
}

export function buildMetadata({
  title,
  description,
  path,
  locale,
  image = "opengraph-image",
}: BuildMetadataOptions): Metadata {
  const url = localizedUrl(locale, path);
  const languages = Object.fromEntries([
    ...routing.locales.map((candidate) => [
      candidate,
      localizedUrl(candidate, path),
    ]),
    ["x-default", localizedUrl(routing.defaultLocale, path)],
  ]);

  // Set explicitly: a page's own `openGraph` replaces its layout's, file
  // based image included. Next copies the image to the Twitter card.
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale,
      type: "website",
      images: [{ url: `/${locale}/${image}`, ...ogImageSize, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
