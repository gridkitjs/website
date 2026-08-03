"use client";

import { defineColumnsFromRows } from "@gridkitjs/core";
import { DataGridComponent, type ColumnDefinition } from "@gridkitjs/react";
import { deploymentRows, type DeploymentRow } from "./fixtures";
import { EventLog, useEventLog } from "./EventLog";

const columns: readonly ColumnDefinition<DeploymentRow>[] = [
  ...defineColumnsFromRows(deploymentRows),
];

export function RowSelectionExample() {
  const { entries, record } = useEventLog();

  return (
    <div>
      <DataGridComponent
        columns={columns}
        dataSource={deploymentRows}
        getRowId={(row) => String(row.Id)}
        borders="horizontal"
        selectable={{ rows: "multiple" }}
        onRowSelectionChange={({ selected }) => {
          record(
            `onRowSelectionChange — ${String(selected.length)} row(s) selected`,
          );
        }}
      />
      <EventLog entries={entries} />
    </div>
  );
}
