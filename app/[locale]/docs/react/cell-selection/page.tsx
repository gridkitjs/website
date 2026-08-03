import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DocPage } from "@/components/docs/DocPage";
import { CodeBlock } from "@/components/code/CodeBlock";
import { LiveExampleFrame } from "@/components/docs/LiveExampleFrame";
import { PropsTable, type PropRow } from "@/components/docs/PropsTable";
import { CellSelectionExample } from "@/components/live-examples/CellSelectionExample";
import { buildMetadata } from "@/lib/seo/metadata";

const propRows: PropRow[] = [
  {
    name: "selectable.cells",
    type: 'false | "single"',
    default: "false",
    description:
      'How many cells the user may select at once — no "multiple": a cell addresses one value, so there is no range to take.',
  },
  {
    name: "defaultCellSelection",
    type: "CellSelectionState",
    description: "The cell selected to start with. Uncontrolled.",
  },
  {
    name: "onCellSelect / onCellDeselect",
    type: "(event: CellSelectEvent) => void",
    description: "Once for the cell selected, once for the cell deselected.",
  },
  {
    name: "onCellSelectionChange",
    type: "(event: CellSelectionChangeEvent) => void",
    description:
      "Once per change with what was selected and what was deselected — one interaction can fill both, since moving between cells deselects and selects at once.",
  },
];

const exampleSource = `<DataGridComponent
  columns={columns}
  dataSource={rows}
  getRowId={(row) => String(row.Id)}
  selectable={{ cells: "single" }}
  onCellSelect={({ cell }) => console.log(cell.value)}
/>;`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "docs.react.cellSelection",
  });

  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "docs/react/cell-selection",
    locale,
  });
}

export default async function CellSelectionDocPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("docs.react.cellSelection");

  return (
    <DocPage
      path="react/cell-selection"
      title={t("title")}
      description={t("description")}
    >
      <p>{t("intro")}</p>
      <h2>{t("exampleHeading")}</h2>
      <LiveExampleFrame title='selectable={{ cells: "single" }}'>
        <CellSelectionExample />
      </LiveExampleFrame>
      <CodeBlock code={exampleSource} className="mt-4" />
      <h2>{t("propsHeading")}</h2>
      <PropsTable rows={propRows} />
    </DocPage>
  );
}
