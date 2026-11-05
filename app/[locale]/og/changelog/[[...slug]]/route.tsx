import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getChangelogTree } from "@/lib/changelog/source";
import { renderOgImage } from "@/lib/seo/og-image";

// A changelog page's Open Graph image, at /<locale>/og/changelog/<slug>; a
// route handler for the same reason as the docs one beside it.
export const dynamic = "force-static";
export const revalidate = 3600;

export async function generateStaticParams() {
  const tree = await getChangelogTree();
  const slugs = [
    [],
    ...tree.sections.flatMap((section) => [
      [section.slug],
      ...section.versions
        .slice(1)
        .map((version) => [section.slug, version.version]),
    ]),
  ];
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; slug?: string[] }> },
) {
  const { locale, slug = [] } = await params;
  const t = await getTranslations({ locale, namespace: "common.og" });
  const [pkgSlug, versionParam] = slug;

  if (!pkgSlug) {
    return renderOgImage({
      section: t("changelog"),
      title: t("changelogIndexTitle"),
      path: "changelog",
    });
  }

  const tree = await getChangelogTree();
  const section = tree.sections.find((candidate) => candidate.slug === pkgSlug);
  // The bare package path is its latest version.
  const version = versionParam ?? section?.versions[0]?.version;
  if (!section || !version) return new Response(null, { status: 404 });

  const page = await getTranslations({ locale, namespace: "changelog.page" });
  return renderOgImage({
    section: t("changelog"),
    title: page("title", { package: section.title, version }),
    path: `changelog/${slug.join("/")}`,
  });
}
