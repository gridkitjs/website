import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DocPage } from "@/components/docs/DocPage";
import { CodeBlock } from "@/components/code/CodeBlock";
import { LiveExampleFrame } from "@/components/docs/LiveExampleFrame";
import { PropsTable, type PropRow } from "@/components/docs/PropsTable";
import { ColumnReorderingExample } from "@/components/live-examples/ColumnReorderingExample";
import { buildMetadata } from "@/lib/seo/metadata";

const functionRows: PropRow[] = [
  {
    name: "applyColumnOrder(columns, order)",
    type: "readonly ColumnDefinition<Row>[]",
    description:
      "Puts columns in the order order gives. Ids it omits keep their position among the definitions and follow those listed.",
  },
  {
    name: "moveColumnBefore(orderedIds, movedId, beforeId)",
    type: "ColumnOrderState",
    description:
      "Moves one column id to sit before another, or to the end when beforeId is null. Returns the same reference for a move that changes nothing.",
  },
  {
    name: "movesColumn(orderedIds, movedId, beforeId)",
    type: "boolean",
    description:
      "Whether moving movedId in front of beforeId would rearrange anything, for a drop indicator that promises only real moves.",
  },
  {
    name: "resolveDropBefore(orderedIds, targetId, side)",
    type: "string | null",
    description:
      '"After C" and "before D" name the same gap — this collapses either side of a drop to the one id it lands in front of.',
  },
];

const exampleSource = `<DataGridComponent
  columns={columns}
  dataSource={rows}
  reorderableColumns
/>;`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "docs.core.ordering" });

  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "docs/core/ordering",
    locale,
  });
}

export default async function CoreOrderingDocPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("docs.core.ordering");

  return (
    <DocPage
      path="core/ordering"
      title={t("title")}
      description={t("description")}
    >
      <p>{t("intro")}</p>
      <h2>{t("functionsHeading")}</h2>
      <PropsTable rows={functionRows} />
      <h2>{t("exampleHeading")}</h2>
      <LiveExampleFrame title="reorderableColumns">
        <ColumnReorderingExample />
      </LiveExampleFrame>
      <CodeBlock code={exampleSource} className="mt-4" />
    </DocPage>
  );
}
