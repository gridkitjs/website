"use client";

import { DataGridComponent, type ColumnDefinition } from "@gridkitjs/react";

export interface PropRow {
  name: string;
  type: string;
  default?: string;
  description: string;
}

const columns: readonly ColumnDefinition<PropRow>[] = [
  {
    field: "name",
    headerTemplate: "Prop",
    cellTemplate: ({ value }) => (
      <code className="text-site-ink text-xs">{String(value)}</code>
    ),
  },
  {
    field: "type",
    headerTemplate: "Type",
    cellTemplate: ({ value }) => (
      <code className="text-site-ink-muted text-xs">{String(value)}</code>
    ),
  },
  {
    field: "default",
    headerTemplate: "Default",
    cellTemplate: ({ value }) => (
      <code className="text-site-ink-muted text-xs">
        {value == null || value === "" ? "—" : String(value)}
      </code>
    ),
  },
  {
    field: "description",
    headerTemplate: "Description",
    cellTemplate: ({ value }) => (
      <span className="text-site-ink-muted">{String(value)}</span>
    ),
  },
];

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="border-site-line overflow-hidden rounded-xl border">
      <DataGridComponent
        columns={columns}
        dataSource={rows}
        borders="horizontal"
        hoverable={{ rows: false, cells: false, columns: false }}
      />
    </div>
  );
}
