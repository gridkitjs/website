import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { CodeBlock } from "@/components/code/CodeBlock";

// Both compile against the installed packages, given a `./tickets` module
// exporting an array of rows; recheck them after `npm run update-gridkit`.
const CORE_CODE = `
import { createGridController } from "@gridkitjs/core";
import { tickets } from "./tickets";

const grid = createGridController({
  dataSource: tickets,
  getRowId: (ticket) => String(ticket.Id),
  defaultGroupBy: [{ columnId: "Region" }],
});

// Draw the view with anything. Here: a table in the console.
grid.subscribe(() => {
  console.table(grid.getView().rows.map((entry) => entry.row));
});

grid.toggleColumnSort("Amount");
`;

const REACT_CODE = `
import { DataGrid } from "@gridkitjs/react";
import { tickets } from "./tickets";

export function Tickets() {
  return (
    <DataGrid
      dataSource={tickets}
      getRowId={(ticket) => String(ticket.Id)}
      label="Tickets"
      sortableColumns
      groupableColumns
      defaultGroupBy={[{ columnId: "Region" }]}
    />
  );
}
`;

const panes = [
  { key: "core", code: CORE_CODE, lang: "ts", file: "grid.ts" },
  { key: "react", code: REACT_CODE, lang: "tsx", file: "Tickets.tsx" },
] as const;

/** The same grid twice: driven by the headless core, then drawn by React. */
export async function HeadlessSection() {
  const t = await getTranslations("home.headless");

  return (
    <Section variant="muted" className="border-site-line border-b">
      <Container className="py-20">
        <div className="max-w-2xl">
          <h2 className="text-site-ink text-3xl font-semibold tracking-tight">
            {t("title")}
          </h2>
          <p className="text-site-ink-muted mt-3 text-lg">{t("subtitle")}</p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {panes.map((pane) => (
            <div key={pane.key} className="flex min-w-0 flex-col">
              <p className="text-site-ink font-mono text-sm font-medium">
                {t(`${pane.key}.package`)}
              </p>
              <p className="text-site-ink-muted mt-1 mb-4 text-sm leading-relaxed">
                {t(`${pane.key}.description`)}
              </p>
              <CodeBlock
                code={pane.code}
                lang={pane.lang}
                title={pane.file}
                className="flex-1"
              />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
