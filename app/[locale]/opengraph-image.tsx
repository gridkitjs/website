import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import {
  ogImageContentType,
  ogImageSize,
  renderOgImage,
} from "@/lib/seo/og-image";

export const alt = "GridKit: a headless data grid for TypeScript and React";
export const size = ogImageSize;
export const contentType = ogImageContentType;

// Route handlers don't inherit the layout's params; list them to prerender.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** The site's image, for the home page and every page without its own. */
export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common.og" });
  const hero = await getTranslations({ locale, namespace: "home.hero" });

  return renderOgImage({
    section: t("home"),
    title: `${hero("titleLead")} ${hero("titleTail")}`,
    path: "",
  });
}
