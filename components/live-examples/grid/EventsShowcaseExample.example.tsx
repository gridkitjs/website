"use client";

import { defineColumnsFromRows } from "@gridkitjs/core";
import { DataGrid, type ColumnDefinition } from "@gridkitjs/react";
import { deploymentRows, type DeploymentRow } from "../fixtures";
import { EventLog, useEventLog } from "../EventLog";
import type { ExampleMeta } from "../meta";

export const meta: ExampleMeta = {
  id: "events-showcase",
  title: "Every DataGrid callback",
  description:
    "Resize, reorder or select anything in the grid; each callback logs a line below it.",
  minHeight: 460,
};

const columns: readonly ColumnDefinition<DeploymentRow>[] = [
  ...defineColumnsFromRows(deploymentRows),
];

/** Every callback DataGrid exposes, each logging its own line. */
export function EventsShowcaseExample() {
  const { entries, record } = useEventLog(10);

  return (
    <div>
      <DataGrid
        columns={columns}
        dataSource={deploymentRows}
        getRowId={(row) => String(row.Id)}
        label="Deployments"
        borders="all"
        resizableColumns
        reorderableColumns
        selectable={{ rows: "multiple", columns: "multiple", cells: "single" }}
        onColumnResize={({ columnId, width, phase }) => {
          if (phase === "end") {
            record(
              `onColumnResize — ${columnId} to ${String(Math.round(width))}px`,
            );
          }
        }}
        onColumnOrderChange={({ columnId }) => {
          record(`onColumnOrderChange — ${columnId} moved`);
        }}
        onRowSelect={({ row }) => {
          record(`onRowSelect — ${row.row.Service}`);
        }}
        onRowsSelect={({ rows }) => {
          record(`onRowsSelect — ${String(rows.length)} row(s)`);
        }}
        onRowDeselect={({ row }) => {
          record(`onRowDeselect — ${row.row.Service}`);
        }}
        onRowsDeselect={({ rows }) => {
          record(`onRowsDeselect — ${String(rows.length)} row(s)`);
        }}
        onRowSelectionChange={({ added, removed, selected }) => {
          record(
            `onRowSelectionChange — +${String(added.length)} -${String(removed.length)}, ${String(selected.length)} selected`,
          );
        }}
        onColumnSelect={({ column }) => {
          record(`onColumnSelect — ${column.column.column.field}`);
        }}
        onColumnsSelect={({ columns: selected }) => {
          record(`onColumnsSelect — ${String(selected.length)} column(s)`);
        }}
        onColumnDeselect={({ column }) => {
          record(`onColumnDeselect — ${column.column.column.field}`);
        }}
        onColumnsDeselect={({ columns: selected }) => {
          record(`onColumnsDeselect — ${String(selected.length)} column(s)`);
        }}
        onColumnSelectionChange={({ added, removed, selected }) => {
          record(
            `onColumnSelectionChange — +${String(added.length)} -${String(removed.length)}, ${String(selected.length)} selected`,
          );
        }}
        onCellSelect={({ cell }) => {
          record(
            `onCellSelect — ${cell.columnId} of row ${cell.rowId} = ${String(cell.value)}`,
          );
        }}
        onCellDeselect={({ cell }) => {
          record(`onCellDeselect — ${cell.columnId} of row ${cell.rowId}`);
        }}
        onCellSelectionChange={({ selected }) => {
          record(
            `onCellSelectionChange — ${selected === null ? "cleared" : selected.columnId}`,
          );
        }}
      />
      <EventLog entries={entries} />
    </div>
  );
}
