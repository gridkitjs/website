import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { siteConfig } from "./site-config";

interface BuildMetadataOptions {
  title: string;
  description: string;
  /** Locale-less path, e.g. "" for the homepage or "docs/react/data-grid". */
  path: string;
  locale: string;
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
}: BuildMetadataOptions): Metadata {
  const url = localizedUrl(locale, path);
  const languages = Object.fromEntries(
    routing.locales.map((candidate) => [
      candidate,
      localizedUrl(candidate, path),
    ]),
  );
  const ogImage = {
    url: "/brand/repository-open-graph-template.png",
    width: 1280,
    height: 640,
    alt: siteConfig.name,
  };

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
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}
