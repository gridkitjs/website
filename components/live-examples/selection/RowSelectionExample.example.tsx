"use client";

import { useState } from "react";
import { DataGrid, type ColumnDefinition } from "@gridkitjs/react";
import { makeRows, type TicketRow } from "../fixtures";
import { EventLog, useEventLog } from "../EventLog";
import type { ExampleMeta } from "../meta";

export const meta: ExampleMeta = {
  id: "row-selection",
  title: "Row selection",
  description:
    "Click a row to select it, Ctrl+click to add one and Shift+click to take a range; switch the mode or let a plain click toggle.",
  minHeight: 548,
};

const rows = makeRows(8);

const columns: readonly ColumnDefinition<TicketRow>[] = [
  { field: "Id", type: "number", width: 80 },
  { field: "Name" },
  { field: "Region" },
  { field: "Status" },
  { field: "Amount", type: "currency" },
];

const modes = ["single", "multiple"] as const;

export function RowSelectionExample() {
  const { entries, record } = useEventLog();
  const [mode, setMode] = useState<(typeof modes)[number]>("multiple");
  const [toggleOnClick, setToggleOnClick] = useState(false);

  return (
    <div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <fieldset className="flex gap-4">
          <legend className="sr-only">Selection mode</legend>
          {modes.map((option) => (
            <label
              key={option}
              className="text-site-ink-muted flex items-center gap-1.5"
            >
              <input
                type="radio"
                name="row-selection-mode"
                checked={mode === option}
                onChange={() => {
                  setMode(option);
                }}
              />
              {option}
            </label>
          ))}
        </fieldset>
        <label className="text-site-ink-muted flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={toggleOnClick}
            onChange={(event) => {
              setToggleOnClick(event.target.checked);
            }}
          />
          toggleOnClick
        </label>
      </div>
      <div className="mt-4">
        <DataGrid
          columns={columns}
          dataSource={rows}
          getRowId={(row) => String(row.Id)}
          label="Tickets"
          borders="all"
          selectable={{ rows: mode, toggleOnClick }}
          onRowSelectionChange={({ added, removed, selection }) => {
            record(
              `onRowSelectionChange — +${String(added.length)} −${String(removed.length)}, selected: [${selection.join(", ")}]`,
            );
          }}
        />
      </div>
      <EventLog entries={entries} />
    </div>
  );
}
