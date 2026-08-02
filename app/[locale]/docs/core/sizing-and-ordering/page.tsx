import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DocPage } from "@/components/docs/DocPage";
import { LiveExampleFrame } from "@/components/docs/LiveExampleFrame";
import { PropsTable, type PropRow } from "@/components/docs/PropsTable";
import { DataGridResizeReorderExample } from "@/components/live-examples/DataGridResizeReorderExample";
import { buildMetadata } from "@/lib/seo/metadata";

const functionRows: PropRow[] = [
  {
    name: "resolveColumnWidths(columns, options)",
    type: "readonly ResolvedColumn<Row>[]",
    description:
      "Resolves each column's rendered width from its definition, sizing state, and grid defaults.",
  },
  {
    name: "fitColumnsToWidth(columns, width)",
    type: "readonly ResolvedColumn<Row>[]",
    description: 'Redistributes width across columns under resizeMode="fit".',
  },
  {
    name: "applyColumnOrder(order, event)",
    type: "ColumnOrderState",
    description:
      "Applies a column-order event to produce the next order state.",
  },
  {
    name: "moveColumnBefore(order, columnId, beforeId)",
    type: "ColumnOrderState",
    description: "Moves one column id to sit before another in the order.",
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "docs.core.sizingAndOrdering",
  });

  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "docs/core/sizing-and-ordering",
    locale,
  });
}

export default async function SizingAndOrderingDocPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("docs.core.sizingAndOrdering");

  return (
    <DocPage
      path="core/sizing-and-ordering"
      title={t("title")}
      description={t("description")}
    >
      <p>{t("intro")}</p>
      <PropsTable rows={functionRows} />
      <h2>{t("exampleHeading")}</h2>
      <LiveExampleFrame title="resizableColumns + reorderableColumns">
        <DataGridResizeReorderExample />
      </LiveExampleFrame>
    </DocPage>
  );
}
