"use client";

import type { CSSProperties } from "react";
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
    width: 160,
    minWidth: 120,
    cellTemplate: ({ value }) => (
      <code className="text-site-ink text-xs">{String(value)}</code>
    ),
  },
  {
    field: "type",
    headerTemplate: "Type",
    width: 220,
    minWidth: 160,
    cellTemplate: ({ value }) => (
      <code className="text-site-ink-muted text-xs">{String(value)}</code>
    ),
  },
  {
    field: "default",
    headerTemplate: "Default",
    width: 100,
    minWidth: 80,
    cellTemplate: ({ value }) => (
      <code className="text-site-ink-muted text-xs">
        {value == null || value === "" ? "—" : String(value)}
      </code>
    ),
  },
  {
    field: "description",
    headerTemplate: "Description",
    width: 380,
    minWidth: 260,
    wrap: { header: true, cells: true },
    cellTemplate: ({ value }) => (
      <span className="text-site-ink-muted">{String(value)}</span>
    ),
  },
];

const propsTableStyle = {
  "--gridkit-line": "var(--site-line)",
  "--gridkit-surface": "var(--site-surface)",
} as CSSProperties;

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div
      className="border-site-line overflow-hidden rounded-xl border border-b-0"
      style={propsTableStyle}
    >
      <DataGridComponent
        columns={columns}
        dataSource={rows}
        resizeMode="fixed"
        borders="horizontal"
        hoverable={{ rows: false, cells: false, columns: false }}
      />
    </div>
  );
}
