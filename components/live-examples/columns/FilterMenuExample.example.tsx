"use client";

import { useState } from "react";
import type { FilterMenuUi, FilterState } from "@gridkitjs/core";
import { DataGrid, excelFilter, type ColumnDefinition } from "@gridkitjs/react";
import { makeRows, type TicketRow } from "../fixtures";
import type { ExampleMeta } from "../meta";

export const meta: ExampleMeta = {
  id: "column-filter-menu",
  title: "Column filter menu",
  description:
    "Open a header's funnel to filter that column, with a checklist of its values or with conditions; switching editors keeps the filter.",
  minHeight: 511,
};

const rows = makeRows(40);

const columns: readonly ColumnDefinition<TicketRow>[] = [
  { field: "Id", type: "number", width: 80, filterable: false },
  { field: "Name" },
  { field: "Region" },
  { field: "Status" },
  { field: "Amount", type: "currency" },
];

const editors: readonly { value: FilterMenuUi; label: string }[] = [
  { value: "excel", label: "excel — a checklist of values" },
  { value: "simple", label: "simple — one or two conditions" },
];

export function FilterMenuExample() {
  const [ui, setUi] = useState<FilterMenuUi>("excel");
  const [filter, setFilter] = useState<FilterState<TicketRow>>([]);

  return (
    <div>
      <fieldset className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <legend className="sr-only">Filter editor</legend>
        {editors.map((editor) => (
          <label
            key={editor.value}
            className="text-site-ink-muted flex items-center gap-1.5"
          >
            <input
              type="radio"
              name="column-filter-menu-editor"
              checked={ui === editor.value}
              onChange={() => {
                setUi(editor.value);
              }}
            />
            {editor.label}
          </label>
        ))}
      </fieldset>
      <div className="mt-4">
        <DataGrid
          {...excelFilter}
          // Replaces the preset's filterMenu whole, so spread it to keep its counts.
          filterMenu={{ ...excelFilter.filterMenu, ui }}
          columns={columns}
          dataSource={rows}
          getRowId={(row) => String(row.Id)}
          label="Tickets"
          borders="all"
          sortableColumns
          height={320}
          onFilterChange={(event) => {
            setFilter(event.filter);
          }}
        />
      </div>
      <p className="text-site-ink-muted mt-4 text-xs">
        The filter onFilterChange reports:
      </p>
      <pre className="border-site-code-border bg-site-code-bg text-site-ink rounded-site mt-1 max-h-48 overflow-auto border p-3 text-xs">
        <code>{JSON.stringify(filter, null, 2)}</code>
      </pre>
    </div>
  );
}
