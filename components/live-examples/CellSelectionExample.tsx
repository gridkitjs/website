"use client";

import { defineColumnsFromRows } from "@gridkitjs/core";
import { DataGridComponent, type ColumnDefinition } from "@gridkitjs/react";
import { deploymentRows, type DeploymentRow } from "./fixtures";
import { EventLog, useEventLog } from "./EventLog";

const columns: readonly ColumnDefinition<DeploymentRow>[] = [
  ...defineColumnsFromRows(deploymentRows),
];

export function CellSelectionExample() {
  const { entries, record } = useEventLog();

  return (
    <div>
      <DataGridComponent
        columns={columns}
        dataSource={deploymentRows}
        getRowId={(row) => String(row.Id)}
        borders="all"
        selectable={{ cells: "single" }}
        onCellSelect={({ cell }) => {
          record(
            `onCellSelect — ${cell.columnId} of row ${cell.rowId} = ${String(cell.value)}`,
          );
        }}
        onCellDeselect={() => {
          record("onCellDeselect");
        }}
      />
      <EventLog entries={entries} />
    </div>
  );
}
