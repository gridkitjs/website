"use client";

import { defineColumnsFromRows } from "@gridkitjs/core";
import { DataGridComponent } from "@gridkitjs/react";
import { deploymentRows } from "./fixtures";

export function DataGridBasicExample() {
  const columns = defineColumnsFromRows(deploymentRows);

  return (
    <DataGridComponent
      columns={columns}
      dataSource={deploymentRows}
      borders="horizontal"
      hoverable={{ rows: true }}
    />
  );
}
