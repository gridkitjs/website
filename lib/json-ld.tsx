import { siteConfig } from "./seo/site-config";

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.baseUrl,
    sameAs: [siteConfig.github],
  };
}

export function websiteJsonLd(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: `${siteConfig.baseUrl}/${locale}`,
    inLanguage: locale,
  };
}

interface BreadcrumbEntry {
  name: string;
  path: string;
}

export function breadcrumbListJsonLd(locale: string, items: BreadcrumbEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.baseUrl}/${locale}${item.path ? `/${item.path}` : ""}`,
    })),
  };
}

export function techArticleJsonLd({
  locale,
  path,
  title,
  description,
  dateModified,
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
  dateModified: Date | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description,
    url: `${siteConfig.baseUrl}/${locale}${path ? `/${path}` : ""}`,
    inLanguage: locale,
    ...(dateModified ? { dateModified: dateModified.toISOString() } : {}),
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.baseUrl,
    },
  };
}
