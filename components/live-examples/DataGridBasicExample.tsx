"use client";

import { defineColumnsFromRows } from "@gridkitjs/core";
import { DataGrid } from "@gridkitjs/react";
import { deploymentRows } from "./fixtures";

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
