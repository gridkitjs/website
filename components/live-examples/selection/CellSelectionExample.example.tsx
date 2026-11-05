"use client";

import { useState } from "react";
import {
  DataGrid,
  type ColumnDefinition,
  type SelectedCell,
} from "@gridkitjs/react";
import { makeRows, type TicketRow } from "../fixtures";
import type { ExampleMeta } from "../meta";

export const meta: ExampleMeta = {
  id: "cell-selection",
  title: "Cell selection",
  description:
    "Click a cell to select it, or move with the arrow keys and press Space; Ctrl+click the selected cell to clear it.",
  minHeight: 357,
};

const rows = makeRows(6);

const columns: readonly ColumnDefinition<TicketRow>[] = [
  { field: "Id", type: "number", width: 80 },
  { field: "Name" },
  { field: "Region" },
  { field: "Status" },
  { field: "Amount", type: "currency" },
];

export function CellSelectionExample() {
  const [cell, setCell] = useState<SelectedCell<TicketRow> | null>(null);

  return (
    <div>
      <DataGrid
        columns={columns}
        dataSource={rows}
        getRowId={(row) => String(row.Id)}
        label="Tickets"
        borders="all"
        selectable={{ cells: "single" }}
        onCellSelectionChange={({ selected }) => {
          setCell(selected);
        }}
      />
      <p className="text-site-ink-muted mt-4 text-sm" aria-live="polite">
        {cell === null ? (
          "No cell selected."
        ) : (
          <>
            {cell.columnId} of {cell.row.Name}:{" "}
            <code className="text-site-ink">{String(cell.value)}</code>
          </>
        )}
      </p>
    </div>
  );
}
