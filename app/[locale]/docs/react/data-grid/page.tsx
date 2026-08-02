import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DocPage } from "@/components/docs/DocPage";
import { CodeBlock } from "@/components/code/CodeBlock";
import { LiveExampleFrame } from "@/components/docs/LiveExampleFrame";
import { PropsTable, type PropRow } from "@/components/docs/PropsTable";
import { DataGridResizeReorderExample } from "@/components/live-examples/DataGridResizeReorderExample";
import { buildMetadata } from "@/lib/seo/metadata";

const propRows: PropRow[] = [
  {
    name: "columns",
    type: "readonly ColumnDefinition<Row>[]",
    description:
      "Columns to render. Falls back to defineColumnsFromRows(dataSource) when omitted.",
  },
  {
    name: "dataSource",
    type: "readonly Row[]",
    description: "The rows to render.",
  },
  {
    name: "borders",
    type: '"horizontal" | "vertical" | "all" | "none"',
    description: "Which cell borders to draw.",
  },
  {
    name: "hoverable",
    type: "{ rows?, columns?, cells? }",
    description: "Which hover highlighting to enable.",
  },
  {
    name: "resizableColumns",
    type: "boolean",
    default: "false",
    description:
      "Whether columns can be dragged wider, unless a column says otherwise.",
  },
  {
    name: "reorderableColumns",
    type: "boolean",
    default: "false",
    description: "Whether columns can be dragged into a new position.",
  },
  {
    name: "resizeMode",
    type: '"fit" | "fixed"',
    default: '"fit"',
    description: "Whether columns fill the grid's width or sit at their own.",
  },
  {
    name: "defaultColumnSizing",
    type: "ColumnSizingState",
    description:
      "Column widths to start from, keyed by column id. Uncontrolled.",
  },
  {
    name: "defaultColumnOrder",
    type: "readonly string[]",
    description: "Column ids in the order to start in. Uncontrolled.",
  },
  {
    name: "columnSizeDefaults",
    type: "Partial<ColumnSizeDefaults>",
    description: "Sizes applied to columns that do not set their own.",
  },
  {
    name: "onColumnResize",
    type: "(event: ColumnResizeEvent) => void",
    description:
      'Called as the user resizes a column: continuously with phase "move", once with "end".',
  },
  {
    name: "onColumnOrderChange",
    type: "(event: ColumnOrderEvent) => void",
    description: "Called once when the user drops a column somewhere new.",
  },
];

const exampleSource = `import { useState } from "react";
import { defineColumnsFromRows } from "@gridkitjs/core";
import {
  DataGridComponent,
  type ColumnDefinition,
  type ResizeMode,
} from "@gridkitjs/react";

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

const [resizeMode, setResizeMode] = useState<ResizeMode>("fit");

<DataGridComponent
  columns={columns}
  dataSource={rows}
  borders="all"
  resizableColumns
  reorderableColumns
  resizeMode={resizeMode}
/>;`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "docs.react.dataGrid" });

  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "docs/react/data-grid",
    locale,
  });
}

export default async function DataGridDocPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("docs.react.dataGrid");

  return (
    <DocPage
      path="react/data-grid"
      title={t("title")}
      description={t("description")}
    >
      <p>{t("intro")}</p>
      <h2>{t("exampleHeading")}</h2>
      <LiveExampleFrame title="DataGridComponent">
        <DataGridResizeReorderExample />
      </LiveExampleFrame>
      <CodeBlock code={exampleSource} className="mt-4" />
      <h2>{t("propsHeading")}</h2>
      <PropsTable rows={propRows} />
    </DocPage>
  );
}
