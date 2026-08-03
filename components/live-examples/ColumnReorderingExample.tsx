"use client";

import { defineColumnsFromRows } from "@gridkitjs/core";
import { DataGridComponent, type ColumnDefinition } from "@gridkitjs/react";
import { deploymentRows, type DeploymentRow } from "./fixtures";
import { EventLog, useEventLog } from "./EventLog";

const columns: readonly ColumnDefinition<DeploymentRow>[] = [
  ...defineColumnsFromRows(deploymentRows),
];

export function ColumnReorderingExample() {
  const { entries, record } = useEventLog();

  return (
    <div>
      <DataGridComponent
        columns={columns}
        dataSource={deploymentRows}
        borders="all"
        reorderableColumns
        onColumnOrderChange={({ columnId }) => {
          record(`onColumnOrderChange — ${columnId} moved`);
        }}
      />
      <EventLog entries={entries} />
    </div>
  );
}
