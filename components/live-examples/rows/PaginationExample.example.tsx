"use client";

import { DataGrid, type ColumnDefinition } from "@gridkitjs/react";
import { makeRows, type TicketRow } from "../fixtures";
import { EventLog, useEventLog } from "../EventLog";
import type { ExampleMeta } from "../meta";

export const meta: ExampleMeta = {
  id: "pagination",
  title: "Pagination",
  description:
    "Page through 95 rows with the numbered pager, or change how many rows a page holds.",
  minHeight: 436,
};

const rows = makeRows(95);

const columns: readonly ColumnDefinition<TicketRow>[] = [
  { field: "Id", type: "number", width: 80 },
  { field: "Name" },
  { field: "Region" },
  { field: "Status" },
  { field: "Amount", type: "currency" },
];

export function PaginationExample() {
  const { entries, record } = useEventLog();

  return (
    <div>
      <DataGrid
        columns={columns}
        dataSource={rows}
        getRowId={(row) => String(row.Id)}
        label="Tickets"
        borders="all"
        paginated
        defaultPagination={{ pageIndex: 0, pageSize: 5 }}
        pager={{ variant: "numbered", sizeOptions: [5, 10, 25] }}
        onPaginationChange={({ pagination, pageCount }) => {
          record(
            `onPaginationChange — page ${String(pagination.pageIndex + 1)} of ${String(pageCount)}, ${String(pagination.pageSize)} per page`,
          );
        }}
      />
      <EventLog entries={entries} />
    </div>
  );
}
