import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DocPage } from "@/components/docs/DocPage";
import { CodeBlock } from "@/components/code/CodeBlock";
import { LiveExampleFrame } from "@/components/docs/LiveExampleFrame";
import { PropsTable, type PropRow } from "@/components/docs/PropsTable";
import { ColumnResizingExample } from "@/components/live-examples/ColumnResizingExample";
import { buildMetadata } from "@/lib/seo/metadata";

const propRows: PropRow[] = [
  {
    name: "resizableColumns",
    type: "boolean",
    default: "false",
    description:
      "Whether columns can be dragged wider, unless a column says otherwise.",
  },
  {
    name: "resizeMode",
    type: '"fit" | "fixed"',
    default: '"fit"',
    description: "Whether columns fill the grid's width or sit at their own.",
  },
  {
    name: "columnSizeDefaults",
    type: "Partial<ColumnSizeDefaults>",
    description:
      "Width, minWidth, maxWidth applied to a column that sets none of its own.",
  },
  {
    name: "defaultColumnSizing",
    type: "ColumnSizingState",
    description:
      "Column widths to start from, keyed by column id. Uncontrolled.",
  },
  {
    name: "onColumnResize",
    type: "(event: ColumnResizeEvent) => void",
    description:
      'Called as the user resizes a column: continuously with phase "move", once with "end".',
  },
  {
    name: "column.resizable",
    type: "boolean",
    description:
      "Per-column override of resizableColumns — a column can opt out of an otherwise resizable grid, or in on one that is not.",
  },
  {
    name: "column.width / minWidth / maxWidth",
    type: "number",
    description: "This column's own starting width and resize bounds.",
  },
];

const exampleSource = `<DataGridComponent
  columns={columns}
  dataSource={rows}
  resizableColumns
  resizeMode="fit"
  onColumnResize={({ columnId, width, phase }) => {
    if (phase === "end") persist(columnId, width);
  }}
/>;`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "docs.react.columnResizing",
  });

  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "docs/react/column-resizing",
    locale,
  });
}

export default async function ColumnResizingDocPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("docs.react.columnResizing");

  return (
    <DocPage
      path="react/column-resizing"
      title={t("title")}
      description={t("description")}
    >
      <p>{t("intro")}</p>
      <h2>{t("exampleHeading")}</h2>
      <LiveExampleFrame title="resizableColumns">
        <ColumnResizingExample />
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
      </ul>
    </DocPage>
  );
}
