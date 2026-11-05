"use client";

import type { ColumnSortState } from "@gridkitjs/core";
import { DataGrid, type ColumnDefinition } from "@gridkitjs/react";
import { makeRows, type TicketRow } from "../fixtures";
import { EventLog, useEventLog } from "../EventLog";
import type { ExampleMeta } from "../meta";

export const meta: ExampleMeta = {
  id: "column-sorting",
  title: "Column sorting",
  description:
    "Click a header's sort toggle to sort by that column; Shift-click another to stack it as a tiebreaker.",
  minHeight: 553,
};

const rows = makeRows(9);

const columns: readonly ColumnDefinition<TicketRow>[] = [
  { field: "Id", type: "number", width: 80 },
  { field: "Name" },
  { field: "Region" },
  { field: "Status" },
  { field: "Amount", type: "currency" },
];

/** "Region asc, then Amount desc" — the stack in priority order. */
function describeSort(sort: ColumnSortState): string {
  if (sort.length === 0) return "unsorted";
  return sort
    .map((entry) => `${entry.columnId} ${entry.direction}`)
    .join(", then ");
}

export function ColumnSortingExample() {
  const { entries, record } = useEventLog();

  return (
    <div>
      <DataGrid
        columns={columns}
        dataSource={rows}
        getRowId={(row) => String(row.Id)}
        label="Tickets"
        borders="all"
        sortableColumns
        onColumnSortChange={({ sort }) => {
          record(`onColumnSortChange — ${describeSort(sort)}`);
        }}
      />
      <EventLog entries={entries} />
    </div>
  );
}
