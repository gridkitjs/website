"use client";

import { DataGrid, type ColumnDefinition } from "@gridkitjs/react";
import { makeRows, type TicketRow } from "../fixtures";
import { EventLog, useEventLog } from "../EventLog";
import type { ExampleMeta } from "../meta";

export const meta: ExampleMeta = {
  id: "column-selection",
  title: "Column selection",
  description:
    "Click a header to select its column, Ctrl+click to add or remove one and Shift+click to take every column in between.",
  minHeight: 430,
};

const rows = makeRows(6);

const columns: readonly ColumnDefinition<TicketRow>[] = [
  { field: "Id", type: "number", width: 80 },
  { field: "Name" },
  { field: "Region" },
  { field: "Status" },
  { field: "Amount", type: "currency" },
];

export function ColumnSelectionExample() {
  const { entries, record } = useEventLog();

  return (
    <div>
      <DataGrid
        columns={columns}
        dataSource={rows}
        getRowId={(row) => String(row.Id)}
        label="Tickets"
        borders="all"
        selectable={{ columns: "multiple" }}
        onColumnSelectionChange={({ selected }) => {
          const names = selected.map((column) => column.columnId);
          record(`onColumnSelectionChange — [${names.join(", ")}]`);
        }}
      />
      <EventLog entries={entries} />
    </div>
  );
}
