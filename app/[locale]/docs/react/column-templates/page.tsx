import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DocPage } from "@/components/docs/DocPage";
import { CodeBlock } from "@/components/code/CodeBlock";
import { LiveExampleFrame } from "@/components/docs/LiveExampleFrame";
import { ColumnTemplatesExample } from "@/components/live-examples/ColumnTemplatesExample";
import { buildMetadata } from "@/lib/seo/metadata";

const exampleSource = `import { defineColumnsFromRows } from "@gridkitjs/core";
import { DataGridComponent, type ColumnDefinition } from "@gridkitjs/react";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const columns: readonly ColumnDefinition<Row>[] = [
  ...defineColumnsFromRows(rows),
  {
    field: "Cost",
    id: "Cost.currency",
    type: "currency",
    headerTemplate: <span className="italic">Cost</span>,
    cellTemplate: ({ value, row }) => (
      <span className={row.Cost > 500 ? "font-semibold text-red-600" : ""}>
        {currency.format(Number(value))}
      </span>
    ),
  },
];

<DataGridComponent columns={columns} dataSource={rows} borders="horizontal" />;`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "docs.react.columnTemplates",
  });

  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "docs/react/column-templates",
    locale,
  });
}

export default async function ColumnTemplatesDocPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("docs.react.columnTemplates");

  return (
    <DocPage
      path="react/column-templates"
      title={t("title")}
      description={t("description")}
    >
      <p>{t("intro")}</p>
      <h2>{t("exampleHeading")}</h2>
      <LiveExampleFrame title="Column templates">
        <ColumnTemplatesExample />
      </LiveExampleFrame>
      <CodeBlock code={exampleSource} className="mt-4" />
    </DocPage>
  );
}
