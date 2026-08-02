import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DocPage } from "@/components/docs/DocPage";
import { CodeBlock } from "@/components/code/CodeBlock";
import { LiveExampleFrame } from "@/components/docs/LiveExampleFrame";
import { PropsTable, type PropRow } from "@/components/docs/PropsTable";
import { DataGridBasicExample } from "@/components/live-examples/DataGridBasicExample";
import { buildMetadata } from "@/lib/seo/metadata";

const functionRows: PropRow[] = [
  {
    name: "defineColumnsFromRows(rows)",
    type: "readonly ColumnDefinition<Row>[]",
    description:
      "Infers a type and alignment per field, one level into nested objects.",
  },
  {
    name: "accessDotted(obj, path)",
    type: "unknown",
    description: 'Reads a value at a dotted path, e.g. "Application.Id".',
  },
  {
    name: "alignmentForType(type)",
    type: "ColumnAlignment",
    description: 'Alignment a column type defaults to — "right" for numbers.',
  },
  {
    name: "resolveColumnLabel(column)",
    type: "string",
    description:
      "The label a column's header falls back to when it sets no headerTemplate.",
  },
];

const exampleSource = `import { defineColumnsFromRows } from "@gridkitjs/core";
import { DataGridComponent } from "@gridkitjs/react";

const columns = defineColumnsFromRows(rows);

<DataGridComponent columns={columns} dataSource={rows} borders="horizontal" />;`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "docs.core.columnDefinitions",
  });

  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "docs/core/column-definitions",
    locale,
  });
}

export default async function ColumnDefinitionsDocPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("docs.core.columnDefinitions");

  return (
    <DocPage
      path="core/column-definitions"
      title={t("title")}
      description={t("description")}
    >
      <p>{t("intro")}</p>
      <h2>{t("exampleHeading")}</h2>
      <LiveExampleFrame title="defineColumnsFromRows">
        <DataGridBasicExample />
      </LiveExampleFrame>
      <CodeBlock code={exampleSource} className="mt-4" />
      <PropsTable rows={functionRows} />
    </DocPage>
  );
}
