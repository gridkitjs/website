import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DocPage } from "@/components/docs/DocPage";
import { DocContent } from "@/lib/docs/mdx";
import { Link } from "@/i18n/navigation";
import { getDocsTree } from "@/lib/docs/source";
import { fetchLastCommitDate } from "@/lib/docs/github";
import { buildMetadata } from "@/lib/seo/metadata";

interface PageParams {
  locale: string;
  slug?: string[];
}

export async function generateStaticParams() {
  const tree = await getDocsTree();
  return [
    { slug: [] },
    ...tree.flat.map((page) => ({ slug: page.slug.split("/") })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const path = slug?.join("/") ?? "";

  if (!path) {
    const t = await getTranslations({ locale, namespace: "docs.index" });
    return buildMetadata({
      title: t("title"),
      description: t("description"),
      path: "docs",
      locale,
    });
  }

  const tree = await getDocsTree();
  const entry = tree.bySlug.get(path);
  if (!entry) return {};

  return buildMetadata({
    title: entry.page.title,
    description: entry.page.description,
    path: `docs/${path}`,
    locale,
  });
}

export default async function DocsSlugPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const tree = await getDocsTree();
  const path = slug?.join("/") ?? "";

  if (!path) {
    const t = await getTranslations("docs.index");
    return (
      <div>
        <h1 className="text-site-ink text-3xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-site-ink-muted mt-3 max-w-2xl text-lg">
          {t("intro")}
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tree.sections.map((section) => (
            <Link
              key={section.slug}
              href={`/docs/${section.slug}`}
              className="border-site-line hover:border-site-accent block rounded-2xl border p-6 transition-colors"
            >
              <p className="text-site-ink font-mono text-sm font-medium">
                {section.title}
              </p>
              <p className="text-site-ink-muted mt-2 text-sm leading-relaxed">
                {section.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const entry = tree.bySlug.get(path);
  if (!entry) notFound();

  const { page, section } = entry;
  const index = tree.flat.findIndex((candidate) => candidate.slug === path);
  const prev = index > 0 ? tree.flat[index - 1] : undefined;
  const next =
    index >= 0 && index < tree.flat.length - 1
      ? tree.flat[index + 1]
      : undefined;
  const lastUpdated = await fetchLastCommitDate(page.repoPath);

  const crumbs = [
    { name: section.title, path: `docs/${section.slug}` },
    ...(page.slug !== section.slug
      ? [{ name: page.title, path: `docs/${page.slug}` }]
      : []),
  ];

  return (
    <DocPage
      crumbs={crumbs}
      title={page.title}
      description={page.description}
      lastUpdated={lastUpdated}
      prev={prev ? { slug: prev.slug, title: prev.title } : undefined}
      next={next ? { slug: next.slug, title: next.title } : undefined}
    >
      <DocContent source={page.content} />
    </DocPage>
  );
}
