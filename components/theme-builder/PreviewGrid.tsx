"use client";

import {
  DataGrid,
  excelFilter,
  type ColumnDefinition,
  type ToolbarEntry,
} from "@gridkitjs/react";
import type {
  AggregateState,
  ColumnSortState,
  GroupByState,
  SelectionState,
} from "@gridkitjs/core";
import { makeRows, type TicketRow } from "@/components/live-examples/fixtures";

const rows = makeRows(60);

const columns: readonly ColumnDefinition<TicketRow>[] = [
  { field: "Id", type: "number", width: 72, groupable: false },
  { field: "Name" },
  { field: "Region" },
  { field: "Status" },
  { field: "Amount", type: "currency", groupable: false },
];

const toolbarItems: readonly ToolbarEntry<TicketRow>[] = [
  "search",
  "spacer",
  "column.choose",
];

const defaultGroupBy: GroupByState = [{ columnId: "Region" }];

const defaultColumnSort: ColumnSortState = [
  { columnId: "Amount", direction: "desc" },
];

const defaultRowSelection: SelectionState = ["50", "45"];

const aggregates: AggregateState<TicketRow> = [
  { columnId: "Amount", fn: "sum" },
];

interface PreviewGridProps {
  label: string;
  toolbarLabel: string;
}

/**
 * The grid the builder restyles, with a part for nearly every token: the
 * toolbar, the group-by bar and group rows, sorted and filterable headers
 * with their menus, selected rows, a numeric column, totals and the pager.
 * Lines between columns too, since a line token only restyles the lines
 * `borders` draws.
 */
export function PreviewGrid({ label, toolbarLabel }: PreviewGridProps) {
  return (
    <DataGrid
      {...excelFilter}
      columns={columns}
      dataSource={rows}
      getRowId={(row) => String(row.Id)}
      label={label}
      borders="all"
      sortableColumns
      defaultColumnSort={defaultColumnSort}
      groupableColumns
      groupByDraggableColumns
      groupByBarVisibility="always"
      defaultGroupBy={defaultGroupBy}
      selectable={{ rows: "multiple" }}
      defaultRowSelection={defaultRowSelection}
      aggregates={aggregates}
      paginated
      paginationUnit="row"
      defaultPagination={{ pageIndex: 0, pageSize: 8 }}
      pager={{ variant: "numbered" }}
      toolbar={{ label: toolbarLabel, items: toolbarItems }}
    />
  );
}
