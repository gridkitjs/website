import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getDocsTree } from "@/lib/docs/source";
import { renderOgImage } from "@/lib/seo/og-image";

// A docs page's Open Graph image, at /<locale>/og/docs/<slug>. A route
// handler rather than an `opengraph-image.tsx` beside the page: Next can't
// put one under an optional catch-all. Prerendered and revalidated like the
// docs pages; segment config has to be a literal.
export const dynamic = "force-static";
export const revalidate = 3600;

export async function generateStaticParams() {
  const tree = await getDocsTree();
  const slugs = [[], ...tree.flat.map((page) => page.slug.split("/"))];
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; slug?: string[] }> },
) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "common.og" });
  const path = slug?.join("/") ?? "";

  if (!path) {
    return renderOgImage({
      section: t("docs"),
      title: t("docsIndexTitle"),
      path: "docs",
    });
  }

  const tree = await getDocsTree();
  const entry = tree.bySlug.get(path);
  if (!entry) return new Response(null, { status: 404 });

  return renderOgImage({
    section: t("docsSection", { section: entry.section.title }),
    title: entry.page.title,
    path: `docs/${path}`,
  });
}
