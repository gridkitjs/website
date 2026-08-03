import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DocPage } from "@/components/docs/DocPage";
import { CodeBlock } from "@/components/code/CodeBlock";
import { LiveExampleFrame } from "@/components/docs/LiveExampleFrame";
import { PropsTable, type PropRow } from "@/components/docs/PropsTable";
import { CombinedSelectionExample } from "@/components/live-examples/CombinedSelectionExample";
import { buildMetadata } from "@/lib/seo/metadata";

const functionRows: PropRow[] = [
  {
    name: "toggleSelection(selection, id, mode)",
    type: "SelectionState",
    description:
      "Adds id if absent, removes it if present — a Ctrl-click, or Space on the focused member.",
  },
  {
    name: "selectOnly(selection, id, mode)",
    type: "SelectionState",
    description:
      "The selection reduced to id alone — a plain click. Never deselects, so clicking the one selected row leaves it selected.",
  },
  {
    name: "selectRange(selection, orderedIds, anchorId, focusId, mode)",
    type: "SelectionState",
    description:
      'Every id from anchorId to focusId inclusive, spanning orderedIds — a Shift-click. Degrades to selectOnly under "single".',
  },
  {
    name: "selectAll(selection, orderedIds, mode)",
    type: "SelectionState",
    description:
      'Every id in orderedIds, or selection untouched under any mode but "multiple".',
  },
  {
    name: "clearSelection(selection)",
    type: "SelectionState",
    description: "Empties the selection.",
  },
  {
    name: "diffSelection(previous, next)",
    type: "SelectionDiff",
    description:
      "What one transition added and removed — the one place a select and a deselect fired for the same interaction cannot disagree.",
  },
  {
    name: "selectCell(selection, cell, mode)",
    type: "CellSelectionState",
    description:
      "Moves the cell selection to cell — a plain click. Idempotent: clicking the selected cell again leaves it selected.",
  },
  {
    name: "toggleCellSelection(selection, cell, mode)",
    type: "CellSelectionState",
    description:
      "Moves to cell, or clears when it is already there — a Ctrl-click.",
  },
  {
    name: "isSameCell(a, b)",
    type: "boolean",
    description: "Whether two cell selections address the same row and column.",
  },
];

const exampleSource = `<DataGridComponent
  columns={columns}
  dataSource={rows}
  getRowId={(row) => String(row.Id)}
  selectable={{ rows: "multiple", columns: "multiple", cells: "single" }}
/>;`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "docs.core.selection" });

  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "docs/core/selection",
    locale,
  });
}

export default async function CoreSelectionDocPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("docs.core.selection");

  return (
    <DocPage
      path="core/selection"
      title={t("title")}
      description={t("description")}
    >
      <p>{t("intro")}</p>
      <h2>{t("functionsHeading")}</h2>
      <PropsTable rows={functionRows} />
      <h2>{t("exampleHeading")}</h2>
      <LiveExampleFrame title="selectable">
        <CombinedSelectionExample />
      </LiveExampleFrame>
      <CodeBlock code={exampleSource} className="mt-4" />
    </DocPage>
  );
}
