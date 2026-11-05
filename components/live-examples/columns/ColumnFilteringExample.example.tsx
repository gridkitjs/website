"use client";

import { useRef, useState } from "react";
import type { FilterState } from "@gridkitjs/core";
import {
  DataGrid,
  type ColumnDefinition,
  type DataGridApi,
} from "@gridkitjs/react";
import { makeRows, type TicketRow } from "../fixtures";
import type { ExampleMeta } from "../meta";

export const meta: ExampleMeta = {
  id: "column-filtering",
  title: "The five filter entry kinds",
  description:
    "Pick an entry kind to apply it with setFilter; the snippet under the choices is the filter the grid now holds.",
  minHeight: 483,
};

const rows = makeRows(40);

const columns: readonly ColumnDefinition<TicketRow>[] = [
  { field: "Id", type: "number", width: 80 },
  { field: "Name" },
  { field: "Region" },
  { field: "Status" },
  { field: "Amount", type: "currency" },
];

interface FilterChoice {
  label: string;
  filter: FilterState<TicketRow>;
  /** How `filter` reads in code, since a predicate can't be printed. */
  snippet: string;
}

const noFilter: FilterChoice = { label: "None", filter: [], snippet: "[]" };

const choices: readonly FilterChoice[] = [
  noFilter,
  {
    label: "Text",
    // `%` is a wildcard: contains "7".
    filter: [{ columnId: "Name", query: "%7%" }],
    snippet: `[{ columnId: "Name", query: "%7%" }]`,
  },
  {
    label: "Value",
    // Strict equality, against a column whose type agrees with the value.
    filter: [{ columnId: "Id", value: 12 }],
    snippet: `[{ columnId: "Id", value: 12 }]`,
  },
  {
    label: "Operator",
    filter: [{ columnId: "Amount", operator: "between", value: [500, 1000] }],
    snippet: `[{ columnId: "Amount", operator: "between", value: [500, 1000] }]`,
  },
  {
    label: "Predicate",
    filter: [{ predicate: (_value, row) => row.Amount % 2 === 1 }],
    snippet: `[{ predicate: (_value, row) => row.Amount % 2 === 1 }]`,
  },
  {
    label: "Group",
    // The top level always ANDs; a group is where OR comes in.
    filter: [
      {
        combinator: "or",
        entries: [
          { columnId: "Status", query: "Escalated" },
          { columnId: "Region", query: "North" },
        ],
      },
    ],
    snippet: `[{
  combinator: "or",
  entries: [
    { columnId: "Status", query: "Escalated" },
    { columnId: "Region", query: "North" },
  ],
}]`,
  },
];

export function ColumnFilteringExample() {
  const gridRef = useRef<DataGridApi<TicketRow>>(null);
  const [selected, setSelected] = useState(noFilter);

  function applyChoice(choice: FilterChoice): void {
    setSelected(choice);
    gridRef.current?.setFilter(choice.filter);
  }

  return (
    <div>
      <fieldset className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <legend className="sr-only">Filter entry kind</legend>
        {choices.map((choice) => (
          <label
            key={choice.label}
            className="text-site-ink-muted flex items-center gap-1.5"
          >
            <input
              type="radio"
              name="column-filtering-kind"
              checked={selected === choice}
              onChange={() => {
                applyChoice(choice);
              }}
            />
            {choice.label}
          </label>
        ))}
      </fieldset>
      <pre className="border-site-code-border bg-site-code-bg text-site-ink rounded-site mt-3 overflow-x-auto border p-3 text-xs">
        <code>{selected.snippet}</code>
      </pre>
      <div className="mt-4">
        <DataGrid
          ref={gridRef}
          columns={columns}
          dataSource={rows}
          getRowId={(row) => String(row.Id)}
          label="Tickets"
          borders="all"
          height={320}
        />
      </div>
    </div>
  );
}
