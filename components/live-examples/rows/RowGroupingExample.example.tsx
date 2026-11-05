"use client";

import { DataGrid, type ColumnDefinition } from "@gridkitjs/react";
import { makeRows, type TicketRow } from "../fixtures";
import { EventLog, useEventLog } from "../EventLog";
import type { ExampleMeta } from "../meta";

export const meta: ExampleMeta = {
  id: "row-grouping",
  title: "Row grouping",
  description:
    "Drag a header into the group-by bar or click its group icon, drag the chips to reorder the levels, and click a group row to collapse it.",
  minHeight: 590,
};

const rows = makeRows(40);

const columns: readonly ColumnDefinition<TicketRow>[] = [
  { field: "Id", type: "number", width: 80, groupable: false },
  { field: "Name" },
  { field: "Region" },
  { field: "Status" },
  { field: "Amount", type: "currency", groupable: false },
];

export function RowGroupingExample() {
  const { entries, record } = useEventLog();

  return (
    <div>
      <DataGrid
        columns={columns}
        dataSource={rows}
        getRowId={(row) => String(row.Id)}
        label="Tickets, grouped"
        borders="all"
        height={360}
        sortableColumns
        groupableColumns
        groupByDraggableColumns
        // Keeps the bar on screen as a drop target once every level is removed.
        groupByBarVisibility="always"
        defaultGroupBy={[{ columnId: "Region" }]}
        onGroupByChange={({ groupBy }) => {
          const levels = groupBy.map((level) => level.columnId);
          record(
            `onGroupByChange — ${levels.length > 0 ? levels.join(" → ") : "ungrouped"}`,
          );
        }}
        onGroupExpansionChange={({ expansion }) => {
          record(
            `onGroupExpansionChange — ${String(expansion.length)} collapsed`,
          );
        }}
      />
      <EventLog entries={entries} />
    </div>
  );
}
