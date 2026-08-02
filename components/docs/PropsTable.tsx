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
    alignment: "center",
    headerClassName: "rounded-tl-xl!",
    cellTemplate: ({ value }) => (
      <code className="text-site-ink text-xs">{String(value)}</code>
    ),
  },
  {
    alignment: "center",
    field: "type",
    headerTemplate: "Type",
    wrap: { header: true, cells: true },
    cellTemplate: ({ value }) => (
      <code className="text-site-ink-muted text-xs">{String(value)}</code>
    ),
  },
  {
    field: "default",
    alignment: "center",
    headerTemplate: "Default",
    cellTemplate: ({ value }) => (
      <code className="text-site-ink-muted text-xs">
        {value == null || value === "" ? "—" : String(value)}
      </code>
    ),
  },
  {
    field: "description",
    alignment: "center",
    headerTemplate: "Description",
    wrap: { header: true, cells: true },
    cellClassName: "text-site-ink-muted",
    headerClassName: "rounded-tr-xl!",
    cellTemplate: ({ value }) => <p className="text-sm">{value as string}</p>,
  },
];

const propsTableStyle = {
  "--gridkit-line": "var(--site-line)",
  "--gridkit-surface": "var(--site-surface)",
} as CSSProperties;

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div
      className="border-site-line w-full rounded-xl border border-b-0"
      style={propsTableStyle}
    >
      <DataGridComponent
        columns={columns}
        dataSource={rows}
        resizeMode="fit"
        borders="horizontal"
        hoverable={{ rows: false, cells: false, columns: false }}
      />
    </div>
  );
}
