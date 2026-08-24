"use client";

import { defineColumnsFromRows } from "@gridkitjs/core";
import {
  DataGridComponent,
  type ColumnDefinition,
  type DataGridProps,
} from "@gridkitjs/react";
import { deploymentRows, type DeploymentRow } from "./fixtures";
import { EventLog, useEventLog } from "./EventLog";

const columns: readonly ColumnDefinition<DeploymentRow>[] = [
  ...defineColumnsFromRows(deploymentRows),
];

// Derived off a generic Record row rather than DeploymentRow itself —
// DeploymentRow is a union of per-row literal types (fixtures.ts declares
// deploymentRows `as const`), and none of the formatters below read a
// row-typed field, so the widening costs nothing in practice.
type AnyRow = Record<string, unknown>;

type EventFormatters = {
  [
    K in keyof DataGridProps<AnyRow> as K extends `on${string}` ? K : never
  ]?: DataGridProps<AnyRow>[K] extends ((event: infer E) => void) | undefined
    ? (event: E) => string
    : never;
};

function eventHandlers(
  events: EventFormatters | undefined,
  record: (entry: string) => void,
): Partial<DataGridProps<DeploymentRow>> {
  const handlers: Record<string, (event: unknown) => void> = {};
  for (const [name, format] of Object.entries(events ?? {})) {
    handlers[name] = (event) => {
      record(`${name} — ${(format as (event: unknown) => string)(event)}`);
    };
  }
  return handlers as Partial<DataGridProps<DeploymentRow>>;
}

/**
 * The one fixture every doc page's live example demos against, driven by
 * whatever `props` a page needs to show and logging whichever `events` it
 * cares about — one shared implementation in place of a dedicated component
 * per doc.
 */
export function GridExample({
  props,
  events,
}: {
  fixture: "deployment";
  props?: Omit<DataGridProps<DeploymentRow>, "columns" | "dataSource" | "ref">;
  events?: EventFormatters;
}) {
  const { entries, record } = useEventLog();

  return (
    <div>
      <DataGridComponent
        columns={columns}
        dataSource={deploymentRows}
        getRowId={(row) => String(row.Id)}
        {...props}
        {...eventHandlers(events, record)}
      />
      {events !== undefined && <EventLog entries={entries} />}
    </div>
  );
}
