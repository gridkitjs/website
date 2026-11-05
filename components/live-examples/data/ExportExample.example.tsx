"use client";

import { useRef, useState } from "react";
import { xlsxWriter } from "@gridkitjs/export-xlsx";
import {
  DataGrid,
  type ColumnDefinition,
  type DataGridApi,
} from "@gridkitjs/react";
import { makeRows, type TicketRow } from "../fixtures";
import type { ExampleMeta } from "../meta";

export const meta: ExampleMeta = {
  id: "export",
  title: "Export",
  description:
    "Download CSV, JSON or Excel from the Export dropdown, or preview a file below; sort, search or select rows first and the export follows.",
  minHeight: 650,
};

const rows = makeRows(20);

const columns: readonly ColumnDefinition<TicketRow>[] = [
  { field: "Id", type: "number", width: 80 },
  { field: "Name" },
  { field: "Region" },
  { field: "Status" },
  { field: "Amount", type: "currency", format: { currency: "USD" } },
];

// Registering the Excel writer adds "Export to Excel" to the dropdown.
const exportWriters = [xlsxWriter({ sheetName: "Tickets" })];

const previews = ["csv", "json"] as const;

export function ExportExample() {
  const gridRef = useRef<DataGridApi<TicketRow>>(null);
  const [preview, setPreview] = useState("");

  async function showPreview(format: (typeof previews)[number]) {
    // exportData builds the same file the dropdown downloads, as a Blob.
    const file = await gridRef.current?.exportData(format);
    if (file) setPreview(await file.text());
  }

  return (
    <div>
      <DataGrid
        ref={gridRef}
        columns={columns}
        dataSource={rows}
        getRowId={(row) => String(row.Id)}
        label="Tickets"
        borders="all"
        height={280}
        sortableColumns
        selectable={{ rows: "multiple" }}
        toolbar={{ items: ["search", "spacer", "export"] }}
        export={{ fileName: "tickets" }}
        exportWriters={exportWriters}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-site-ink-muted">Preview</span>
        {previews.map((format) => (
          <button
            key={format}
            type="button"
            onClick={() => {
              void showPreview(format);
            }}
            className="border-site-line text-site-ink hover:bg-site-surface-raised rounded-site border px-3 py-1 uppercase"
          >
            {format}
          </button>
        ))}
      </div>
      <pre className="border-site-code-border bg-site-code-bg text-site-ink rounded-site mt-3 h-48 overflow-auto border p-3 text-xs">
        <code>{preview || "Choose a format to see the file it exports."}</code>
      </pre>
    </div>
  );
}
