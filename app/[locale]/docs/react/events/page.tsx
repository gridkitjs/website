import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DocPage } from "@/components/docs/DocPage";
import { LiveExampleFrame } from "@/components/docs/LiveExampleFrame";
import { PropsTable, type PropRow } from "@/components/docs/PropsTable";
import { EventsShowcaseExample } from "@/components/live-examples/EventsShowcaseExample";
import { buildMetadata } from "@/lib/seo/metadata";

const resizeReorderRows: PropRow[] = [
  {
    name: "onColumnResize",
    type: "(event: ColumnResizeEvent) => void",
    description:
      'Fires continuously with phase "move" while dragging, once with "end" on release — the one to persist. Auto-fit does not call it.',
  },
  {
    name: "onColumnOrderChange",
    type: "(event: ColumnOrderEvent) => void",
    description:
      "Fires once when the user drops a column somewhere new. A drop that leaves the order unchanged does not call it.",
  },
];

const selectionRows: PropRow[] = [
  {
    name: "onRowSelect / onRowsSelect",
    type: "(event) => void",
    description:
      "Once per row newly selected, and once per interaction with every row it selected — a range selects many rows but fires onRowsSelect once.",
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
      "Once per change with what it added, removed, and everything selected after.",
  },
  {
    name: "onColumnSelect / onColumnsSelect / onColumnDeselect / onColumnsDeselect / onColumnSelectionChange",
    type: "(event) => void",
    description: "The same five events, for column selection.",
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
      "Once per change with what was selected and deselected — one interaction can fill both, since moving between cells does so at once.",
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "docs.react.events" });

  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "docs/react/events",
    locale,
  });
}

export default async function EventsDocPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("docs.react.events");

  return (
    <DocPage
      path="react/events"
      title={t("title")}
      description={t("description")}
    >
      <p>{t("intro")}</p>
      <h2>{t("exampleHeading")}</h2>
      <LiveExampleFrame title="Every DataGridComponent callback">
        <EventsShowcaseExample />
      </LiveExampleFrame>
      <h2>{t("resizeReorderHeading")}</h2>
      <PropsTable rows={resizeReorderRows} />
      <h2>{t("selectionHeading")}</h2>
      <PropsTable rows={selectionRows} />
    </DocPage>
  );
}
