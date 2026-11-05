"use client";

import { useState } from "react";
import { defineColumnsFromRows } from "@gridkitjs/core";
import {
  DataGrid,
  type ColumnDefinition,
  type ResizeMode,
} from "@gridkitjs/react";
import { deploymentRows, type DeploymentRow } from "../fixtures";
import type { ExampleMeta } from "../meta";

export const meta: ExampleMeta = {
  id: "data-grid-resize-reorder",
  title: "Resizable, reorderable columns",
  description:
    "Drag a header edge to resize, drag a header to reorder, and switch between fit and fixed sizing.",
  minHeight: 300,
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const columns: readonly ColumnDefinition<DeploymentRow>[] = [
  ...defineColumnsFromRows(deploymentRows),
  {
    field: "Cost",
    id: "Cost.currency",
    type: "currency",
    headerTemplate: <span className="italic">Cost</span>,
    cellTemplate: ({ value, row }) => (
      <span className={row.Cost > 500 ? "font-semibold text-red-600" : ""}>
        {currency.format(Number(value))}
      </span>
    ),
  },
];

const modes: readonly { value: ResizeMode; label: string }[] = [
  { value: "fit", label: "fit — columns fill the grid" },
  { value: "fixed", label: "fixed — columns keep their own width" },
];

export function DataGridResizeReorderExample() {
  const [resizeMode, setResizeMode] = useState<ResizeMode>("fit");

  return (
    <div className="space-y-4">
      <fieldset className="flex flex-wrap gap-4 text-sm">
        <legend className="sr-only">Resize mode</legend>
        {modes.map((mode) => (
          <label
            key={mode.value}
            className="text-site-ink-muted flex items-center gap-1.5"
          >
            <input
              type="radio"
              name="resize-mode"
              checked={resizeMode === mode.value}
              onChange={() => {
                setResizeMode(mode.value);
              }}
            />
            {mode.label}
          </label>
        ))}
      </fieldset>
      <DataGrid
        columns={columns}
        dataSource={deploymentRows}
        borders="all"
        resizableColumns
        reorderableColumns
        resizeMode={resizeMode}
      />
    </div>
  );
}
