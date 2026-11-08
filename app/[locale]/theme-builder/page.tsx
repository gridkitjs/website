import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ThemeBuilder } from "@/components/theme-builder/ThemeBuilder";
import { Container } from "@/components/ui/Container";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site-config";
import { readThemePackage } from "@/lib/theme-builder/package";

const THEME_PACKAGE_DIR = join(
  process.cwd(),
  "node_modules",
  "@gridkitjs",
  "theme-tailwind",
);

function readThemePackageFile(path: string) {
  return readFile(join(THEME_PACKAGE_DIR, path), "utf8");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "themeBuilder" });

  return buildMetadata({
    title: t("metaTitle"),
    description: t("description"),
    path: "theme-builder",
    locale,
    image: "og/theme-builder",
  });
}

/**
 * The theme builder, made at build time from the installed theme package's
 * token manifest and presets, so a new token or preset reaches it with the
 * package and no change here.
 */
export default async function ThemeBuilderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, data] = await Promise.all([
    getTranslations("themeBuilder"),
    readThemePackage(readThemePackageFile),
  ]);

  return (
    <Container className="max-w-screen-2xl py-8 lg:py-12">
      <h1 className="text-site-ink text-3xl font-semibold tracking-tight sm:text-4xl">
        {t("title")}
      </h1>
      <p className="text-site-ink-muted mt-3 max-w-3xl">{t("intro")}</p>
      <ThemeBuilder
        data={data}
        pageUrl={`${siteConfig.baseUrl}/${locale}/theme-builder`}
      />
    </Container>
  );
}
