"use client";

import { defineColumnsFromRows } from "@gridkitjs/core";
import { DataGrid } from "@gridkitjs/react";
import { deploymentRows } from "../fixtures";
import type { ExampleMeta } from "../meta";

export const meta: ExampleMeta = {
  id: "data-grid-basic",
  title: "Columns inferred from rows",
  description:
    "defineColumnsFromRows builds the columns from the data; hover a row to highlight it.",
  minHeight: 260,
};

export function DataGridBasicExample() {
  const columns = defineColumnsFromRows(deploymentRows);

  return (
    <DataGrid
      columns={columns}
      dataSource={deploymentRows}
      borders="horizontal"
      hoverable={{ rows: true }}
    />
  );
}
