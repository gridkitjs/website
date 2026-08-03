import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DocPage } from "@/components/docs/DocPage";
import { CodeBlock } from "@/components/code/CodeBlock";
import { LiveExampleFrame } from "@/components/docs/LiveExampleFrame";
import { PropsTable, type PropRow } from "@/components/docs/PropsTable";
import { ColumnReorderingExample } from "@/components/live-examples/ColumnReorderingExample";
import { buildMetadata } from "@/lib/seo/metadata";

const propRows: PropRow[] = [
  {
    name: "reorderableColumns",
    type: "boolean",
    default: "false",
    description: "Whether columns can be dragged into a new position.",
  },
  {
    name: "defaultColumnOrder",
    type: "readonly string[]",
    description:
      "Column ids in the order to start in. Uncontrolled, and partial — ids it omits keep their position among columns.",
  },
  {
    name: "onColumnOrderChange",
    type: "(event: ColumnOrderEvent) => void",
    description:
      "Called once when the user drops a column somewhere new. A drop that leaves the order unchanged does not call it.",
  },
  {
    name: "column.reorderable",
    type: "boolean",
    description:
      "Per-column override of reorderableColumns. A column that cannot move can still be moved past.",
  },
];

const exampleSource = `<DataGridComponent
  columns={columns}
  dataSource={rows}
  reorderableColumns
  onColumnOrderChange={({ columnId, order }) => persist(order)}
/>;`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "docs.react.columnReordering",
  });

  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "docs/react/column-reordering",
    locale,
  });
}

export default async function ColumnReorderingDocPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("docs.react.columnReordering");

  return (
    <DocPage
      path="react/column-reordering"
      title={t("title")}
      description={t("description")}
    >
      <p>{t("intro")}</p>
      <h2>{t("exampleHeading")}</h2>
      <LiveExampleFrame title="reorderableColumns">
        <ColumnReorderingExample />
      </LiveExampleFrame>
      <CodeBlock code={exampleSource} className="mt-4" />
      <h2>{t("propsHeading")}</h2>
      <PropsTable rows={propRows} />
      <h2>{t("interactionsHeading")}</h2>
      <ul className="text-site-ink-muted list-disc space-y-2 pl-5 leading-relaxed">
        <li>Drag a header to reorder columns.</li>
        <li>
          With a header focused, <code>Ctrl+ArrowLeft</code> /{" "}
          <code>Ctrl+ArrowRight</code> reorders it via keyboard; Escape cancels
          an in-progress drag.
        </li>
      </ul>
    </DocPage>
  );
}
