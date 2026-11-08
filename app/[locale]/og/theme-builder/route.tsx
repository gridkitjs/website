import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { renderOgImage } from "@/lib/seo/og-image";

// The theme builder's Open Graph image, at /<locale>/og/theme-builder. Its
// page changes only with a deploy, so it is prerendered once, with no
// revalidation.
export const dynamic = "force-static";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common.og" });

  return renderOgImage({
    section: t("themeBuilder"),
    title: t("themeBuilderTitle"),
    path: "theme-builder",
  });
}
