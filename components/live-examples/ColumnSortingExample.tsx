"use client";

import { defineColumnsFromRows } from "@gridkitjs/core";
import { DataGridComponent, type ColumnDefinition } from "@gridkitjs/react";
import { deploymentRows, type DeploymentRow } from "./fixtures";
import { EventLog, useEventLog } from "./EventLog";

const columns: readonly ColumnDefinition<DeploymentRow>[] = [
  ...defineColumnsFromRows(deploymentRows),
];

export function ColumnSortingExample() {
  const { entries, record } = useEventLog();

  return (
    <div>
      <DataGridComponent
        columns={columns}
        dataSource={deploymentRows}
        borders="all"
        sortableColumns
        onColumnSortChange={({ sort }) => {
          record(
            sort.length === 0
              ? "onColumnSortChange — cleared"
              : `onColumnSortChange — ${sort
                  .map((entry) => `${entry.columnId} ${entry.direction}`)
                  .join(", then ")}`,
          );
        }}
      />
      <EventLog entries={entries} />
    </div>
  );
}
