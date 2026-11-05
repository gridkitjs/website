"use client";

import { useRef, useState } from "react";
import {
  DataGrid,
  excelFilter,
  serializeGridState,
  type ColumnDefinition,
  type DataGridApi,
  type SerializedGridState,
} from "@gridkitjs/react";
import { makeRows, type TicketRow } from "../fixtures";
import type { ExampleMeta } from "../meta";

export const meta: ExampleMeta = {
  id: "state-persistence",
  title: "Saving and restoring state",
  description:
    "Sort, filter, resize, move or page the grid and save it; change it again, then restore to put the saved layout back.",
  minHeight: 601,
};

const rows = makeRows(40);

const columns: readonly ColumnDefinition<TicketRow>[] = [
  { field: "Id", type: "number", width: 80 },
  { field: "Name" },
  { field: "Region" },
  { field: "Status" },
  { field: "Amount", type: "currency" },
];

const buttonClass =
  "border-site-line text-site-ink hover:bg-site-surface-raised rounded-site border px-3 py-1 disabled:opacity-50";

export function StatePersistenceExample() {
  const gridRef = useRef<DataGridApi<TicketRow>>(null);
  // An app would keep this in localStorage, a URL or its own backend.
  const [saved, setSaved] = useState<SerializedGridState<TicketRow> | null>(
    null,
  );

  function save(): void {
    const state = gridRef.current?.getState();
    if (state !== undefined) setSaved(serializeGridState(state));
  }

  function restore(): void {
    if (saved !== null) gridRef.current?.restoreState(saved);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 text-sm">
        <button type="button" onClick={save} className={buttonClass}>
          Save state
        </button>
        <button
          type="button"
          onClick={restore}
          disabled={saved === null}
          className={buttonClass}
        >
          Restore state
        </button>
      </div>
      <div className="mt-4">
        <DataGrid
          {...excelFilter}
          ref={gridRef}
          columns={columns}
          dataSource={rows}
          getRowId={(row) => String(row.Id)}
          label="Tickets"
          borders="all"
          sortableColumns
          resizableColumns
          reorderableColumns
          selectable={{ rows: "multiple" }}
          paginated
          defaultPagination={{ pageIndex: 0, pageSize: 5 }}
        />
      </div>
      <p className="text-site-ink-muted mt-4 text-xs">The saved state:</p>
      <pre className="border-site-code-border bg-site-code-bg text-site-ink rounded-site mt-1 h-48 overflow-auto border p-3 text-xs">
        <code>
          {saved === null
            ? "Nothing saved yet."
            : JSON.stringify(saved, null, 2)}
        </code>
      </pre>
    </div>
  );
}
