"use client";

import { useRef } from "react";
import {
  DataGrid,
  type ColumnDefinition,
  type DataGridApi,
} from "@gridkitjs/react";
import { makeRows, type TicketRow } from "../fixtures";
import { EventLog, useEventLog } from "../EventLog";
import type { ExampleMeta } from "../meta";

export const meta: ExampleMeta = {
  id: "column-chooser",
  title: "Column chooser",
  description:
    "Open the chooser from the toolbar, a header's context menu or the button below, and check the columns to show; Id can't be hidden.",
  minHeight: 523,
};

const rows = makeRows(6);

const columns: readonly ColumnDefinition<TicketRow>[] = [
  { field: "Id", type: "number", width: 80, hideable: false },
  { field: "Name" },
  { field: "Region" },
  { field: "Status" },
  { field: "Amount", type: "currency" },
  // Listed in the chooser, unchecked, until it's shown.
  { field: "Notes", width: 240, hidden: true },
];

export function ColumnChooserExample() {
  const gridRef = useRef<DataGridApi<TicketRow>>(null);
  const { entries, record } = useEventLog();

  return (
    <div>
      <DataGrid
        ref={gridRef}
        columns={columns}
        dataSource={rows}
        getRowId={(row) => String(row.Id)}
        label="Tickets"
        borders="all"
        toolbar={{ items: ["spacer", "column.choose"] }}
        contextMenu
        onColumnVisibilityChange={({ columnIds, visibility }) => {
          const changes = columnIds.map(
            (id) => `${id} ${visibility[id] === false ? "hidden" : "shown"}`,
          );
          record(`onColumnVisibilityChange — ${changes.join(", ")}`);
        }}
      />
      <div className="mt-4 text-sm">
        <button
          type="button"
          onClick={() => {
            gridRef.current?.openColumnChooser();
          }}
          className="border-site-line text-site-ink hover:bg-site-surface-raised rounded-site border px-3 py-1"
        >
          Columns…
        </button>
      </div>
      <EventLog entries={entries} />
    </div>
  );
}
