"use client";

import { defineColumnsFromRows } from "@gridkitjs/core";
import { DataGrid, type ColumnDefinition } from "@gridkitjs/react";
import { deploymentRows, type DeploymentRow } from "../fixtures";
import type { ExampleMeta } from "../meta";

export const meta: ExampleMeta = {
  id: "column-templates",
  title: "Column templates",
  description:
    "A header template and a cell template format the cost column as currency.",
  minHeight: 260,
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

export function ColumnTemplatesExample() {
  return (
    <DataGrid
      columns={columns}
      dataSource={deploymentRows}
      borders="horizontal"
      hoverable={{ rows: true }}
    />
  );
}
