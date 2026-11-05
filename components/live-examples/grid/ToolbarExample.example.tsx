"use client";

import { useState } from "react";
import { xlsxWriter } from "@gridkitjs/export-xlsx";
import {
  DataGrid,
  type ColumnDefinition,
  type ToolbarEntry,
} from "@gridkitjs/react";
import { makeRows, type TicketRow } from "../fixtures";
import { EventLog, useEventLog } from "../EventLog";
import type { ExampleMeta } from "../meta";

export const meta: ExampleMeta = {
  id: "toolbar",
  title: "Toolbar",
  description:
    "Search, export, print or choose the columns from the toolbar, then narrow it with the slider to send the items that no longer fit into More.",
  minHeight: 588,
};

const rows = makeRows(40);

const columns: readonly ColumnDefinition<TicketRow>[] = [
  { field: "Id", type: "number", width: 80, hideable: false },
  { field: "Name" },
  { field: "Region" },
  { field: "Status" },
  { field: "Amount", type: "currency" },
  // Hidden to start with; "Choose columns" shows it.
  { field: "Notes", width: 240, hidden: true },
];

const items: readonly ToolbarEntry<TicketRow>[] = [
  "search",
  "separator",
  "export",
  "print",
  "column.choose",
  "spacer",
  { type: "custom", id: "selectedCount" },
];

// Adds "Export to Excel" to the Export dropdown. Made once, outside the
// component, like any prop that shouldn't change on every render.
const exportWriters = [xlsxWriter({ sheetName: "Tickets" })];

export function ToolbarExample() {
  const { entries, record } = useEventLog();
  const [width, setWidth] = useState(100);
  const [selectedCount, setSelectedCount] = useState(0);

  return (
    <div>
      <label className="text-site-ink-muted flex items-center gap-3 text-sm">
        Width
        <input
          type="range"
          min={40}
          max={100}
          step={5}
          value={width}
          onChange={(event) => {
            setWidth(Number(event.target.value));
          }}
          className="w-40"
        />
        <span className="text-site-ink w-10 tabular-nums">{width}%</span>
      </label>
      <div className="mt-4" style={{ width: `${String(width)}%` }}>
        <DataGrid
          columns={columns}
          dataSource={rows}
          getRowId={(row) => String(row.Id)}
          label="Tickets"
          borders="horizontal"
          height={320}
          sortableColumns
          selectable={{ rows: "multiple" }}
          toolbar={{ label: "Ticket actions", items }}
          renderToolbarItem={(id) =>
            id === "selectedCount" ? (
              <span>{selectedCount} selected</span>
            ) : null
          }
          export={{ fileName: "tickets" }}
          exportWriters={exportWriters}
          print={{ title: "Tickets" }}
          onRowSelectionChange={({ selection }) => {
            setSelectedCount(selection.length);
          }}
          onCommand={({ commandId, source }) => {
            record(`onCommand — ${commandId} from the ${source}`);
          }}
        />
      </div>
      <EventLog entries={entries} />
    </div>
  );
}
