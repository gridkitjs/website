import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DocPage } from "@/components/docs/DocPage";
import { CodeBlock } from "@/components/code/CodeBlock";
import { Link } from "@/i18n/navigation";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "docs.core.overview" });

  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "docs/core",
    locale,
  });
}

export default async function CoreOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("docs.core.overview");

  return (
    <DocPage path="core" title={t("title")} description={t("description")}>
      <p>{t("intro")}</p>
      <h2>{t("installHeading")}</h2>
      <CodeBlock lang="ts" code={`npm install @gridkitjs/core`} />
      <p>
        See{" "}
        <Link href="/docs/core/column-definitions" className="text-site-accent">
          column definitions
        </Link>{" "}
        for column inference, or{" "}
        <Link
          href="/docs/core/sizing-and-ordering"
          className="text-site-accent"
        >
          sizing &amp; ordering
        </Link>{" "}
        for the resizing and reordering logic.
      </p>
    </DocPage>
  );
}
