import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DocPage } from "@/components/docs/DocPage";
import { CodeBlock } from "@/components/code/CodeBlock";
import { LiveExampleFrame } from "@/components/docs/LiveExampleFrame";
import { PropsTable, type PropRow } from "@/components/docs/PropsTable";
import { ColumnResizingExample } from "@/components/live-examples/ColumnResizingExample";
import { buildMetadata } from "@/lib/seo/metadata";

const functionRows: PropRow[] = [
  {
    name: "resolveColumnWidths(columns, sizing, options)",
    type: "readonly ResolvedColumn<Row>[]",
    description:
      "Resolves each column's rendered width from its definition, the sizing state, and the grid's defaults.",
  },
  {
    name: "fitColumnsToWidth(columns, width, sizeDefaults)",
    type: "readonly ResolvedColumn<Row>[]",
    description: 'Redistributes width across columns under resizeMode="fit".',
  },
  {
    name: "clampColumnWidth(width, constraints)",
    type: "number",
    description: "Holds a width within a column's min/max bounds.",
  },
  {
    name: "resolveColumnConstraints(column, sizeDefaults)",
    type: "ColumnConstraints",
    description: "The min/max a column may be resized between.",
  },
  {
    name: "beginColumnResize(column, startWidth, startPosition, sizeDefaults)",
    type: "ColumnResizeSession",
    description:
      "Opens a resize: captures the column's constraints and starting point so applying a pointer position is arithmetic on numbers alone.",
  },
  {
    name: "applyColumnResize(session, position)",
    type: "number",
    description:
      "The width the dragged column takes with the pointer at position.",
  },
  {
    name: "sizeColumnToContent(measuredWidth, constraints)",
    type: "number",
    description:
      "The width a double-click auto-fit resolves to, clamped to the column's bounds.",
  },
  {
    name: "totalColumnWidth(resolved)",
    type: "number",
    description: "The sum of every resolved column's width.",
  },
];

const exampleSource = `<DataGridComponent
  columns={columns}
  dataSource={rows}
  resizableColumns
  resizeMode="fit"
/>;`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "docs.core.resizing" });

  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "docs/core/resizing",
    locale,
  });
}

export default async function CoreResizingDocPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("docs.core.resizing");

  return (
    <DocPage
      path="core/resizing"
      title={t("title")}
      description={t("description")}
    >
      <p>{t("intro")}</p>
      <h2>{t("functionsHeading")}</h2>
      <PropsTable rows={functionRows} />
      <h2>{t("exampleHeading")}</h2>
      <LiveExampleFrame title="resizableColumns">
        <ColumnResizingExample />
      </LiveExampleFrame>
      <CodeBlock code={exampleSource} className="mt-4" />
    </DocPage>
  );
}
