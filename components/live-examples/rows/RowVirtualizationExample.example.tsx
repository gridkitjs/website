"use client";

import { useRef, useState } from "react";
import {
  DataGrid,
  type ColumnDefinition,
  type DataGridApi,
} from "@gridkitjs/react";
import { makeRows, type TicketRow } from "../fixtures";
import type { ExampleMeta } from "../meta";

export const meta: ExampleMeta = {
  id: "row-virtualization",
  title: "5,000 virtualized rows",
  description:
    "Only the rows near the scroll position are mounted; scroll, or jump to any row, even one never rendered.",
  minHeight: 519,
};

const rows = makeRows(5000);

const columns: readonly ColumnDefinition<TicketRow>[] = [
  { field: "Id", type: "number", width: 80 },
  { field: "Name", width: 120 },
  { field: "Region", width: 110 },
  { field: "Status", width: 110 },
  { field: "Amount", type: "currency", width: 120 },
  // Wrapped notes give rows different heights, which the grid measures.
  { field: "Notes", width: 320, wrap: { cells: true } },
];

export function RowVirtualizationExample() {
  const gridRef = useRef<DataGridApi<TicketRow>>(null);
  const [target, setTarget] = useState("2500");

  return (
    <div>
      <form
        className="flex flex-wrap items-center gap-2 text-sm"
        onSubmit={(event) => {
          event.preventDefault();
          gridRef.current?.scrollToRow(target);
        }}
      >
        <label className="text-site-ink-muted flex items-center gap-2">
          Row
          <input
            type="number"
            min={1}
            max={rows.length}
            value={target}
            onChange={(event) => {
              setTarget(event.target.value);
            }}
            className="border-site-line bg-site-bg text-site-ink rounded-site w-24 border px-2 py-1"
          />
        </label>
        <button
          type="submit"
          className="border-site-line text-site-ink hover:bg-site-surface-raised rounded-site border px-3 py-1"
        >
          Scroll to row
        </button>
      </form>
      <div className="mt-4">
        <DataGrid
          ref={gridRef}
          columns={columns}
          dataSource={rows}
          getRowId={(row) => String(row.Id)}
          label="Tickets, 5,000 rows"
          borders="all"
          height={400}
          virtualized
        />
      </div>
    </div>
  );
}
