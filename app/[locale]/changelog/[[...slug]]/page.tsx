import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChangelogPage } from "@/components/changelog/ChangelogPage";
import { DocContent } from "@/lib/docs/mdx";
import { Link } from "@/i18n/navigation";
import { getChangelogTree, type ChangelogSection } from "@/lib/changelog/source";
import { fetchLastCommitDate, getEditUrl } from "@/lib/docs/github";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd, techArticleJsonLd } from "@/lib/json-ld";

interface PageParams {
  locale: string;
  slug?: string[];
}

/** The latest version (index 0) lives at the bare package URL; older versions get their own version segment. */
function versionPath(section: ChangelogSection, index: number): string {
  return index === 0
    ? `changelog/${section.slug}`
    : `changelog/${section.slug}/${section.versions[index].version}`;
}

export async function generateStaticParams() {
  const tree = await getChangelogTree();
  const packageParams = tree.sections.map((section) => ({
    slug: [section.slug],
  }));
  const versionParams = tree.sections.flatMap((section) =>
    section.versions
      .slice(1)
      .map((version) => ({ slug: [section.slug, version.version] })),
  );
  return [{ slug: [] }, ...packageParams, ...versionParams];
}

function resolveVersion(tree: Awaited<ReturnType<typeof getChangelogTree>>, slug: string[]) {
  const [pkgSlug, versionParam] = slug;
  const section = tree.sections.find((candidate) => candidate.slug === pkgSlug);
  if (!section) return undefined;

  const index = versionParam
    ? section.versions.findIndex((v) => v.version === versionParam)
    : 0;
  // The latest version only has a canonical URL at the bare package path —
  // reaching it via an explicit version segment would be duplicate content.
  if (index === -1 || (versionParam && index === 0)) return undefined;

  return { section, index, version: section.versions[index] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const path = slug?.join("/") ?? "";

  if (!path) {
    const t = await getTranslations({ locale, namespace: "changelog.index" });
    return buildMetadata({
      title: t("title"),
      description: t("description"),
      path: "changelog",
      locale,
    });
  }

  const tree = await getChangelogTree();
  const resolved = resolveVersion(tree, slug ?? []);
  if (!resolved) return {};

  const t = await getTranslations({ locale, namespace: "changelog.page" });
  return buildMetadata({
    title: t("title", {
      package: resolved.section.title,
      version: resolved.version.version,
    }),
    description: t("description", {
      package: resolved.section.title,
      version: resolved.version.version,
    }),
    path,
    locale,
  });
}

export default async function ChangelogSlugPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const tree = await getChangelogTree();
  const path = slug?.join("/") ?? "";

  if (!path) {
    const t = await getTranslations("changelog.index");
    const tCommon = await getTranslations("common");
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
              href={`/changelog/${section.slug}`}
              className="border-site-line hover:border-site-accent block rounded-2xl border p-6 transition-colors"
            >
              <p className="text-site-ink font-mono text-sm font-medium">
                {section.title}
              </p>
              {section.versions[0] && (
                <p className="text-site-ink-muted mt-2 text-sm leading-relaxed">
                  v{section.versions[0].version}
                </p>
              )}
            </Link>
          ))}
        </div>
        <p className="text-site-ink-muted mt-10 text-sm">
          {t("backToDocs")}{" "}
          <Link href="/docs" className="text-site-accent">
            {tCommon("nav.docs")}
          </Link>
        </p>
      </div>
    );
  }

  const resolved = resolveVersion(tree, slug ?? []);
  if (!resolved) notFound();

  const { section, index, version } = resolved;
  const isLatest = index === 0;
  const prevVersion = index > 0 ? section.versions[index - 1] : undefined;
  const nextVersion =
    index < section.versions.length - 1 ? section.versions[index + 1] : undefined;
  const lastUpdated = isLatest ? await fetchLastCommitDate(section.repoPath) : null;

  const crumbs = [
    { name: section.title, path: `changelog/${section.slug}` },
    ...(isLatest
      ? []
      : [{ name: `v${version.version}`, path: `changelog/${section.slug}/${version.version}` }]),
  ];

  const t = await getTranslations("changelog.page");
  const title = t("title", { package: section.title, version: version.version });
  const description = t("description", {
    package: section.title,
    version: version.version,
  });

  return (
    <>
      <JsonLd
        data={techArticleJsonLd({
          locale,
          path,
          title,
          description,
          dateModified: lastUpdated,
        })}
      />
      <ChangelogPage
        crumbs={crumbs}
        packageTitle={section.title}
        version={version.version}
        lastUpdated={lastUpdated}
        editUrl={getEditUrl(section.repoPath)}
        docsHref={`/docs/${section.slug}`}
        prev={
          prevVersion
            ? {
                href: `/${versionPath(section, index - 1)}`,
                title: `v${prevVersion.version}`,
              }
            : undefined
        }
        next={
          nextVersion
            ? {
                href: `/${versionPath(section, index + 1)}`,
                title: `v${nextVersion.version}`,
              }
            : undefined
        }
      >
        <DocContent source={version.content} />
      </ChangelogPage>
    </>
  );
}
