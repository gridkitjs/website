"use client";

import { useState } from "react";
import { defineColumnsFromRows } from "@gridkitjs/core";
import {
  DataGridComponent,
  type ColumnDefinition,
  type ResizeMode,
} from "@gridkitjs/react";
import { deploymentRows, type DeploymentRow } from "./fixtures";
import { EventLog, useEventLog } from "./EventLog";

const columns: readonly ColumnDefinition<DeploymentRow>[] = [
  ...defineColumnsFromRows(deploymentRows),
];

const modes: readonly { value: ResizeMode; label: string }[] = [
  { value: "fit", label: "fit — columns fill the grid" },
  { value: "fixed", label: "fixed — columns keep their own width" },
];

export function ColumnResizingExample() {
  const [resizeMode, setResizeMode] = useState<ResizeMode>("fit");
  const { entries, record } = useEventLog();

  return (
    <div>
      <fieldset className="flex flex-wrap gap-4 text-sm">
        <legend className="sr-only">Resize mode</legend>
        {modes.map((mode) => (
          <label
            key={mode.value}
            className="text-site-ink-muted flex items-center gap-1.5"
          >
            <input
              type="radio"
              name="column-resizing-mode"
              checked={resizeMode === mode.value}
              onChange={() => {
                setResizeMode(mode.value);
              }}
            />
            {mode.label}
          </label>
        ))}
      </fieldset>
      <div className="mt-4">
        <DataGridComponent
          columns={columns}
          dataSource={deploymentRows}
          borders="all"
          resizableColumns
          resizeMode={resizeMode}
          onColumnResize={({ columnId, width, phase }) => {
            if (phase === "end") {
              record(
                `onColumnResize — ${columnId} to ${String(Math.round(width))}px`,
              );
            }
          }}
        />
      </div>
      <EventLog entries={entries} />
    </div>
  );
}
