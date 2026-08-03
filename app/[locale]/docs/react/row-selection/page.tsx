import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DocPage } from "@/components/docs/DocPage";
import { CodeBlock } from "@/components/code/CodeBlock";
import { LiveExampleFrame } from "@/components/docs/LiveExampleFrame";
import { PropsTable, type PropRow } from "@/components/docs/PropsTable";
import { RowSelectionExample } from "@/components/live-examples/RowSelectionExample";
import { buildMetadata } from "@/lib/seo/metadata";

const propRows: PropRow[] = [
  {
    name: "selectable.rows",
    type: 'false | "single" | "multiple"',
    default: "false",
    description: "How many rows the user may select at once.",
  },
  {
    name: "getRowId",
    type: "(row: Row, index: number) => string",
    default: "row position",
    description:
      "A row's stable identity. Give one for data that sorts, filters, or pages, or a selection follows the position rather than the row.",
  },
  {
    name: "defaultRowSelection",
    type: "SelectionState",
    description:
      "Row ids selected to start with, keyed as getRowId resolves them. Uncontrolled.",
  },
  {
    name: "onRowSelect / onRowsSelect",
    type: "(event) => void",
    description:
      "Once per row newly selected, and once per interaction with every row it selected.",
  },
  {
    name: "onRowDeselect / onRowsDeselect",
    type: "(event) => void",
    description: "The deselecting counterpart of each, above.",
  },
  {
    name: "onRowSelectionChange",
    type: "(event: RowSelectionChangeEvent) => void",
    description:
      "Once per change with what it added, what it removed, and everything selected after — the one to persist from.",
  },
];

const exampleSource = `<DataGridComponent
  columns={columns}
  dataSource={rows}
  getRowId={(row) => String(row.Id)}
  selectable={{ rows: "multiple" }}
  onRowSelectionChange={({ selected }) => persist(selected)}
/>;`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "docs.react.rowSelection",
  });

  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "docs/react/row-selection",
    locale,
  });
}

export default async function RowSelectionDocPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("docs.react.rowSelection");

  return (
    <DocPage
      path="react/row-selection"
      title={t("title")}
      description={t("description")}
    >
      <p>{t("intro")}</p>
      <h2>{t("exampleHeading")}</h2>
      <LiveExampleFrame title='selectable={{ rows: "multiple" }}'>
        <RowSelectionExample />
      </LiveExampleFrame>
      <CodeBlock code={exampleSource} className="mt-4" />
      <h2>{t("propsHeading")}</h2>
      <PropsTable rows={propRows} />
    </DocPage>
  );
}
