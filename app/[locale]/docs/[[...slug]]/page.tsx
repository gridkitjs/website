import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DocPage } from "@/components/docs/DocPage";
import { OnThisPage, OnThisPageDisclosure } from "@/components/docs/OnThisPage";
import { DocContent } from "@/lib/docs/mdx";
import { extractToc } from "@/lib/docs/toc";
import { Link, redirect } from "@/i18n/navigation";
import {
  getDocsTree,
  type DocPageNode,
  type DocSectionNode,
  type DocsTree,
} from "@/lib/docs/source";
import type { PrevNextEntry } from "@/components/ui/PrevNextNav";
import { getEditUrl } from "@/lib/docs/github";
import { buildMetadata } from "@/lib/seo/metadata";
import { PACKAGES } from "@/lib/packages";
import { JsonLd, techArticleJsonLd } from "@/lib/json-ld";

/** A prev/next card, naming the page's section when it isn't `current`. */
function pageCard(
  tree: DocsTree,
  current: DocSectionNode,
  target: DocPageNode | undefined,
): PrevNextEntry | undefined {
  if (!target) return undefined;
  const section = tree.bySlug.get(target.slug)?.section;
  return {
    href: `/docs/${target.slug}`,
    title: target.title,
    section:
      section && section.slug !== current.slug ? section.title : undefined,
  };
}

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

  // A package overview is a hub page, with a search snippet written for it.
  const overview = PACKAGES.find((pkg) => pkg.slug === path);
  return buildMetadata({
    title: entry.page.title,
    description: overview?.description ?? entry.page.description,
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
        {/* A hairline lattice: the grid draws its top and left edges, each
            cell its right and bottom, so a short last row ends cleanly. */}
        <div className="border-site-line mt-10 grid border-t border-l sm:grid-cols-2 lg:grid-cols-3">
          {tree.sections.map((section) => (
            <Link
              key={section.slug}
              href={`/docs/${section.slug}`}
              className="border-site-line hover:bg-site-surface block border-r border-b p-6 transition-colors"
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
        <p className="mt-10 text-sm">
          <Link href="/changelog" className="text-site-accent">
            {t("changelogCta")}
          </Link>
        </p>
      </div>
    );
  }

  const entry = tree.bySlug.get(path);
  if (!entry) {
    // A package's overview.mdx is served at the section root, but docs link
    // to it by file name too, e.g. /docs/export-xlsx/overview.
    const overviewOf = /^([^/]+)\/overview$/.exec(path)?.[1];
    if (overviewOf && tree.bySlug.has(overviewOf)) {
      redirect({ href: `/docs/${overviewOf}`, locale });
    }
    notFound();
  }

  const { page, section, group } = entry;
  const index = tree.flat.findIndex((candidate) => candidate.slug === path);
  const prev = index > 0 ? tree.flat[index - 1] : undefined;
  const next =
    index >= 0 && index < tree.flat.length - 1
      ? tree.flat[index + 1]
      : undefined;
  const toc = extractToc(page.content);
  const t = await getTranslations("common");

  const crumbs = [
    { name: section.title, path: `docs/${section.slug}` },
    // A group is a folder, with no page of its own to link to.
    ...(group ? [{ name: group.title }] : []),
    ...(page.slug !== section.slug
      ? [{ name: page.title, path: `docs/${page.slug}` }]
      : []),
  ];

  return (
    <>
      <JsonLd
        data={techArticleJsonLd({
          locale,
          path: `docs/${path}`,
          title: page.title,
          description: page.description,
          dateModified: page.lastModified,
        })}
      />
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_200px] xl:items-start xl:gap-12">
        <DocPage
          crumbs={crumbs}
          title={page.title}
          description={page.description}
          lastUpdated={page.lastModified}
          editUrl={getEditUrl(page.repoPath)}
          prev={pageCard(tree, section, prev)}
          next={pageCard(tree, section, next)}
          toc={<OnThisPageDisclosure toc={toc} label={t("onThisPage")} />}
        >
          <DocContent source={page.content} />
        </DocPage>
        <OnThisPage toc={toc} label={t("onThisPage")} />
      </div>
    </>
  );
}
