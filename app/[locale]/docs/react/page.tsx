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
  const t = await getTranslations({ locale, namespace: "docs.react.overview" });

  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "docs/react",
    locale,
  });
}

export default async function ReactOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("docs.react.overview");

  return (
    <DocPage path="react" title={t("title")} description={t("description")}>
      <p>{t("intro")}</p>
      <h2>{t("installHeading")}</h2>
      <CodeBlock
        lang="ts"
        code={`npm install @gridkitjs/react @gridkitjs/theme-tailwind`}
      />
      <p>
        See{" "}
        <Link href="/docs/react/data-grid" className="text-site-accent">
          DataGridComponent
        </Link>{" "}
        for the component itself,{" "}
        <Link href="/docs/react/column-templates" className="text-site-accent">
          column templates
        </Link>{" "}
        for custom header and cell rendering, or{" "}
        <Link href="/docs/theme-tailwind" className="text-site-accent">
          theming
        </Link>{" "}
        for palette tokens and dark mode.
      </p>
    </DocPage>
  );
}
