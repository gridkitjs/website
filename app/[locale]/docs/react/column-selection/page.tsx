import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DocPage } from "@/components/docs/DocPage";
import { CodeBlock } from "@/components/code/CodeBlock";
import { LiveExampleFrame } from "@/components/docs/LiveExampleFrame";
import { PropsTable, type PropRow } from "@/components/docs/PropsTable";
import { ColumnSelectionExample } from "@/components/live-examples/ColumnSelectionExample";
import { buildMetadata } from "@/lib/seo/metadata";

const propRows: PropRow[] = [
  {
    name: "selectable.columns",
    type: 'false | "single" | "multiple"',
    default: "false",
    description: "How many columns the user may select at once.",
  },
  {
    name: "defaultColumnSelection",
    type: "SelectionState",
    description: "Column ids selected to start with. Uncontrolled.",
  },
  {
    name: "onColumnSelect / onColumnsSelect",
    type: "(event) => void",
    description:
      "Once per column newly selected, and once per interaction with every column it selected.",
  },
  {
    name: "onColumnDeselect / onColumnsDeselect",
    type: "(event) => void",
    description: "The deselecting counterpart of each, above.",
  },
  {
    name: "onColumnSelectionChange",
    type: "(event: ColumnSelectionChangeEvent) => void",
    description:
      "Once per change with what it added, what it removed, and everything selected after — the one to persist from.",
  },
];

const exampleSource = `<DataGridComponent
  columns={columns}
  dataSource={rows}
  selectable={{ columns: "multiple" }}
  onColumnSelectionChange={({ selected }) => persist(selected)}
/>;`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "docs.react.columnSelection",
  });

  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "docs/react/column-selection",
    locale,
  });
}

export default async function ColumnSelectionDocPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("docs.react.columnSelection");

  return (
    <DocPage
      path="react/column-selection"
      title={t("title")}
      description={t("description")}
    >
      <p>{t("intro")}</p>
      <h2>{t("exampleHeading")}</h2>
      <LiveExampleFrame title='selectable={{ columns: "multiple" }}'>
        <ColumnSelectionExample />
      </LiveExampleFrame>
      <CodeBlock code={exampleSource} className="mt-4" />
      <h2>{t("propsHeading")}</h2>
      <PropsTable rows={propRows} />
    </DocPage>
  );
}
