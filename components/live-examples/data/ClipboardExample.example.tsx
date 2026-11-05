"use client";

import { useRef } from "react";
import {
  DataGrid,
  type ColumnDefinition,
  type DataGridApi,
} from "@gridkitjs/react";
import { makeRows, type TicketRow } from "../fixtures";
import type { ExampleMeta } from "../meta";

export const meta: ExampleMeta = {
  id: "clipboard",
  title: "Clipboard",
  description:
    "Select rows and press Ctrl+C, or right-click a cell for Copy cell, Copy row and Copy selection, then paste into the box below or a spreadsheet.",
  minHeight: 564,
};

const rows = makeRows(8);

const columns: readonly ColumnDefinition<TicketRow>[] = [
  { field: "Id", type: "number", width: 80 },
  { field: "Name" },
  { field: "Region" },
  { field: "Status" },
  { field: "Amount", type: "currency", format: { currency: "USD" } },
];

export function ClipboardExample() {
  const gridRef = useRef<DataGridApi<TicketRow>>(null);

  return (
    <div>
      <DataGrid
        ref={gridRef}
        columns={columns}
        dataSource={rows}
        getRowId={(row) => String(row.Id)}
        label="Tickets"
        borders="all"
        selectable={{ rows: "multiple" }}
        contextMenu
      />
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => {
            // The clipboard is only open during a user's gesture, as here.
            gridRef.current?.runCommand("copy.selection");
          }}
          className="border-site-line text-site-ink hover:bg-site-surface-raised rounded-site border px-3 py-1"
        >
          Copy selection
        </button>
      </div>
      <label className="text-site-ink-muted mt-4 block text-xs">
        Paste here
        <textarea
          rows={4}
          spellCheck={false}
          placeholder="Tab-separated text, one row per line"
          className="border-site-line bg-site-bg text-site-ink rounded-site mt-1 block w-full border p-2 font-mono text-xs"
        />
      </label>
    </div>
  );
}
