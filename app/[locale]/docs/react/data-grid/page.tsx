import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DocPage } from "@/components/docs/DocPage";
import { CodeBlock } from "@/components/code/CodeBlock";
import { LiveExampleFrame } from "@/components/docs/LiveExampleFrame";
import { PropsTable, type PropRow } from "@/components/docs/PropsTable";
import { Link } from "@/i18n/navigation";
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
    name: "getRowId",
    type: "(row: Row, index: number) => string",
    default: "row position",
    description:
      "A row's stable identity, for state keyed by it. Give one for data that sorts, filters, or pages.",
  },
  {
    name: "label",
    type: "string",
    description:
      'The grid\'s accessible name, announced when it takes focus — without one a screen reader announces only "grid".',
  },
  {
    name: "labelledBy",
    type: "string",
    description:
      "The id of an element naming the grid, for a heading already on the page. Takes precedence over label.",
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
  {
    name: "selectable",
    type: "{ rows?, columns?, cells? }",
    default: "all off",
    description:
      "Which parts of the grid the user may select, and how many of each. Off by default: selection claims the click.",
  },
  {
    name: "defaultRowSelection / defaultColumnSelection",
    type: "SelectionState",
    description: "Row / column ids selected to start with. Uncontrolled.",
  },
  {
    name: "defaultCellSelection",
    type: "CellSelectionState",
    description: "The cell selected to start with. Uncontrolled.",
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
      <h2>{t("interactionsHeading")}</h2>
      <ul className="text-site-ink-muted list-disc space-y-2 pl-5 leading-relaxed">
        <li>
          Drag a header&apos;s trailing edge to resize; double-click it to size
          the column to its content.
        </li>
        <li>
          With the trailing edge focused, <code>Alt+ArrowLeft</code> /{" "}
          <code>Alt+ArrowRight</code> nudge the width; Escape cancels an
          in-progress resize.
        </li>
        <li>Drag a header to reorder columns.</li>
        <li>
          With a header focused, <code>Ctrl+ArrowLeft</code> /{" "}
          <code>Ctrl+ArrowRight</code> reorders it via keyboard; Escape cancels
          an in-progress drag.
        </li>
        <li>
          Click a row, column, or cell to select it; Ctrl+click toggles,
          Shift+click takes a range.
        </li>
        <li>
          <code>Ctrl+A</code> selects every row; Escape clears every selection.
        </li>
      </ul>
      <h2>{t("seeAlsoHeading")}</h2>
      <ul className="text-site-ink-muted list-disc space-y-2 pl-5 leading-relaxed">
        <li>
          <Link href="/docs/react/column-resizing" className="text-site-accent">
            Column resizing
          </Link>{" "}
          and{" "}
          <Link
            href="/docs/react/column-reordering"
            className="text-site-accent"
          >
            column reordering
          </Link>
          , in depth.
        </li>
        <li>
          <Link href="/docs/react/row-selection" className="text-site-accent">
            Row
          </Link>
          ,{" "}
          <Link
            href="/docs/react/column-selection"
            className="text-site-accent"
          >
            column
          </Link>
          , and{" "}
          <Link href="/docs/react/cell-selection" className="text-site-accent">
            cell
          </Link>{" "}
          selection, each on its own page.
        </li>
        <li>
          <Link href="/docs/react/events" className="text-site-accent">
            Events
          </Link>{" "}
          for every callback prop, firing live.
        </li>
      </ul>
    </DocPage>
  );
}
