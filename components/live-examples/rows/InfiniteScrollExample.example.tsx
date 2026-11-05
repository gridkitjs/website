"use client";

import { useState } from "react";
import { DataGrid, type ColumnDefinition } from "@gridkitjs/react";
import {
  MOCK_TOTAL_ROWS,
  makeRows,
  mockLoadMore,
  type TicketRow,
} from "../fixtures";
import type { ExampleMeta } from "../meta";

export const meta: ExampleMeta = {
  id: "infinite-scroll",
  title: "Infinite scroll",
  description:
    "Scroll near the bottom to load the next page; a loading row shows while the request is in flight.",
  minHeight: 508,
};

const PAGE_SIZE = 50;

const columns: readonly ColumnDefinition<TicketRow>[] = [
  { field: "Id", type: "number", width: 80 },
  { field: "Name" },
  { field: "Region" },
  { field: "Status" },
  { field: "Amount", type: "currency" },
];

export function InfiniteScrollExample() {
  // The first page is in hand already; the rest come from the mock API.
  const [rows, setRows] = useState(() => makeRows(PAGE_SIZE));
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  function loadMore(): void {
    setIsLoadingMore(true);
    void mockLoadMore(rows.length / PAGE_SIZE, PAGE_SIZE).then((page) => {
      setRows((loaded) => [...loaded, ...page.rows]);
      setHasMore(page.hasMore);
      setIsLoadingMore(false);
    });
  }

  return (
    <div>
      <DataGrid
        columns={columns}
        dataSource={rows}
        getRowId={(row) => String(row.Id)}
        label="Tickets"
        borders="all"
        height={400}
        virtualized
        infiniteScroll={{ hasMore, isLoadingMore, onLoadMore: loadMore }}
      />
      <p className="text-site-ink-muted mt-3 text-sm" aria-live="polite">
        {String(rows.length)} of {String(MOCK_TOTAL_ROWS)} rows loaded
        {isLoadingMore ? ", loading more…" : ""}
      </p>
    </div>
  );
}
