"use client";

import { useState } from "react";
import type { AggregateState, GroupAggregateDisplay } from "@gridkitjs/core";
import { DataGrid, type ColumnDefinition } from "@gridkitjs/react";
import { makeRows, type TicketRow } from "../fixtures";
import type { ExampleMeta } from "../meta";

export const meta: ExampleMeta = {
  id: "aggregate-functions",
  title: "Aggregate functions",
  description:
    "Each region shows its own count, total and average, the footer totals every row, and the radio buttons move the subtotals into rows of their own.",
  minHeight: 579,
};

const rows = makeRows(30);

const columns: readonly ColumnDefinition<TicketRow>[] = [
  { field: "Id", type: "number", width: 80 },
  { field: "Name" },
  { field: "Region" },
  { field: "Status" },
  // With a currency to show, the column's sum and average read as currency too.
  { field: "Amount", type: "currency", format: { currency: "USD" } },
];

const aggregates: AggregateState<TicketRow> = [
  { columnId: "Id", fn: "count", id: "Tickets" },
  { columnId: "Status", fn: "countDistinct", id: "Statuses" },
  { columnId: "Amount", fn: "sum", id: "Total" },
  // A second spec on the same column needs an id of its own.
  { columnId: "Amount", fn: "avg", id: "Average" },
];

const displays: readonly { value: GroupAggregateDisplay; label: string }[] = [
  { value: "inline", label: "inline — in the group row" },
  { value: "row", label: "row — a summary row per group" },
];

export function AggregatesExample() {
  const [display, setDisplay] = useState<GroupAggregateDisplay>("inline");

  return (
    <div>
      <fieldset className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <legend className="sr-only">Group subtotal display</legend>
        {displays.map((option) => (
          <label
            key={option.value}
            className="text-site-ink-muted flex items-center gap-1.5"
          >
            <input
              type="radio"
              name="aggregate-functions-display"
              checked={display === option.value}
              onChange={() => {
                setDisplay(option.value);
              }}
            />
            {option.label}
          </label>
        ))}
      </fieldset>
      <div className="mt-4">
        <DataGrid
          columns={columns}
          dataSource={rows}
          getRowId={(row) => String(row.Id)}
          label="Tickets, with subtotals per region"
          borders="all"
          height={360}
          sortableColumns
          groupableColumns
          defaultGroupBy={[{ columnId: "Region" }]}
          aggregates={aggregates}
          groupAggregateDisplay={display}
        />
      </div>
    </div>
  );
}
