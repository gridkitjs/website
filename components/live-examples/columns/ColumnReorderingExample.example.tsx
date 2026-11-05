"use client";

import { DataGrid, type ColumnDefinition } from "@gridkitjs/react";
import { makeRows, type TicketRow } from "../fixtures";
import { EventLog, useEventLog } from "../EventLog";
import type { ExampleMeta } from "../meta";

export const meta: ExampleMeta = {
  id: "column-reordering",
  title: "Column reordering",
  description:
    "Drag a header to a new position, or focus one and press Ctrl+ArrowLeft or Ctrl+ArrowRight; Id stays put, but other columns can pass it.",
  minHeight: 430,
};

const rows = makeRows(6);

const columns: readonly ColumnDefinition<TicketRow>[] = [
  // Can't be picked up, though other columns can move past it.
  { field: "Id", type: "number", width: 80, reorderable: false },
  { field: "Name" },
  { field: "Region" },
  { field: "Status" },
  { field: "Amount", type: "currency" },
];

export function ColumnReorderingExample() {
  const { entries, record } = useEventLog();

  return (
    <div>
      <DataGrid
        columns={columns}
        dataSource={rows}
        getRowId={(row) => String(row.Id)}
        label="Tickets"
        borders="all"
        reorderableColumns
        onColumnOrderChange={({ columnId, order }) => {
          record(
            `onColumnOrderChange — moved ${columnId}: [${order.join(", ")}]`,
          );
        }}
      />
      <EventLog entries={entries} />
    </div>
  );
}
