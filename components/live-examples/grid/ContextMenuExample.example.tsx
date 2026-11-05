"use client";

import { useMemo, useState } from "react";
import {
  DataGrid,
  type ColumnDefinition,
  type GridCommand,
  type GridContextMenuOptions,
} from "@gridkitjs/react";
import { makeRows, type TicketRow } from "../fixtures";
import { EventLog, useEventLog } from "../EventLog";
import type { ExampleMeta } from "../meta";

export const meta: ExampleMeta = {
  id: "context-menu",
  title: "Context menu",
  description:
    "Right-click a header or a row, or focus one and press Shift+F10; the row menu starts with two commands of the app's own.",
  minHeight: 676,
};

const columns: readonly ColumnDefinition<TicketRow>[] = [
  { field: "Id", type: "number", width: 80 },
  { field: "Name" },
  { field: "Region" },
  { field: "Status" },
  { field: "Amount", type: "currency" },
];

// The row menu: the app's own commands, listed by id, above the defaults.
const contextMenu: GridContextMenuOptions<TicketRow> = {
  cell: ({ defaults }) => [
    "tickets.escalate",
    "tickets.close",
    "separator",
    ...defaults,
  ],
};

export function ContextMenuExample() {
  const { entries, record } = useEventLog();
  const [rows, setRows] = useState(() => makeRows(12));

  // Registered once, so a toolbar or another menu could list them by id too.
  // Opening the menu on a row selects it first, so `selectedRows` always
  // holds the row the menu opened on.
  const commands = useMemo<readonly GridCommand<TicketRow>[]>(() => {
    function setStatus(ids: readonly number[], status: string): void {
      setRows((current) =>
        current.map((row) =>
          ids.includes(row.Id) ? { ...row, Status: status } : row,
        ),
      );
    }

    return [
      {
        id: "tickets.escalate",
        label: ({ selectedRows }) =>
          selectedRows().length > 1
            ? `Escalate ${String(selectedRows().length)} tickets`
            : "Escalate ticket",
        isEnabled: ({ selectedRows }) =>
          selectedRows().some((entry) => entry.row.Status !== "Escalated"),
        execute: ({ selectedRows }) => {
          setStatus(
            selectedRows().map((entry) => entry.row.Id),
            "Escalated",
          );
        },
      },
      {
        id: "tickets.close",
        label: "Close ticket",
        isVisible: ({ row }) => row !== null && row.row.Status !== "Closed",
        execute: ({ row }) => {
          if (row !== null) setStatus([row.row.Id], "Closed");
        },
      },
    ];
  }, []);

  return (
    <div>
      <DataGrid
        columns={columns}
        dataSource={rows}
        getRowId={(row) => String(row.Id)}
        label="Tickets"
        borders="all"
        sortableColumns
        resizableColumns
        groupableColumns
        selectable={{ rows: "multiple" }}
        commands={commands}
        contextMenu={contextMenu}
        onCommand={({ commandId, target }) => {
          record(`onCommand — ${commandId} on the ${target.area}`);
        }}
      />
      <EventLog entries={entries} />
    </div>
  );
}
