"use client";

import { defineColumnsFromRows } from "@gridkitjs/core";
import { DataGridComponent, type ColumnDefinition } from "@gridkitjs/react";
import { deploymentRows, type DeploymentRow } from "./fixtures";
import { EventLog, useEventLog } from "./EventLog";

const columns: readonly ColumnDefinition<DeploymentRow>[] = [
  ...defineColumnsFromRows(deploymentRows),
];

/** Rows, columns, and cells selectable at once — the same selection state applyIntent resolves against, however the grid uses it. */
export function CombinedSelectionExample() {
  const { entries, record } = useEventLog();

  return (
    <div>
      <DataGridComponent
        columns={columns}
        dataSource={deploymentRows}
        getRowId={(row) => String(row.Id)}
        borders="all"
        selectable={{ rows: "multiple", columns: "multiple", cells: "single" }}
        onRowSelectionChange={({ selected }) => {
          record(`rows — ${String(selected.length)} selected`);
        }}
        onColumnSelectionChange={({ selected }) => {
          record(`columns — ${String(selected.length)} selected`);
        }}
        onCellSelectionChange={({ selected }) => {
          record(`cell — ${selected === null ? "cleared" : selected.columnId}`);
        }}
      />
      <EventLog entries={entries} />
    </div>
  );
}
