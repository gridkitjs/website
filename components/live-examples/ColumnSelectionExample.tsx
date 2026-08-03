"use client";

import { defineColumnsFromRows } from "@gridkitjs/core";
import { DataGridComponent, type ColumnDefinition } from "@gridkitjs/react";
import { deploymentRows, type DeploymentRow } from "./fixtures";
import { EventLog, useEventLog } from "./EventLog";

const columns: readonly ColumnDefinition<DeploymentRow>[] = [
  ...defineColumnsFromRows(deploymentRows),
];

export function ColumnSelectionExample() {
  const { entries, record } = useEventLog();

  return (
    <div>
      <DataGridComponent
        columns={columns}
        dataSource={deploymentRows}
        borders="horizontal"
        selectable={{ columns: "multiple" }}
        onColumnSelectionChange={({ selected }) => {
          record(
            `onColumnSelectionChange — ${String(selected.length)} column(s) selected`,
          );
        }}
      />
      <EventLog entries={entries} />
    </div>
  );
}
