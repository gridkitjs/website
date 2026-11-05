"use client";

import { useTranslations } from "next-intl";
import {
  DataGrid,
  type ColumnDefinition,
  type ToolbarEntry,
} from "@gridkitjs/react";
import type { GroupByState } from "@gridkitjs/core";
import { makeRows, type TicketRow } from "@/components/live-examples/fixtures";
import { ClientOnly } from "@/components/ui/ClientOnly";
import { cn } from "@/components/ui/cn";

const rows = makeRows(200);

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

/**
 * The rows area's height. The toolbar, group-by bar and header sit outside
 * it; with them the grid is 432px tall, which the wrapper's `h-[432px]`
 * reserves. Change the two together.
 */
const BODY_HEIGHT = 300;

interface HeroGridProps {
  className?: string;
}

/**
 * The home page's live grid: 200 seeded rows grouped by region, with a
 * search box, sortable headers and a group-by bar. It mounts in the browser
 * only (`DataGrid` can't prerender), so its wrapper reserves the grid's
 * height and the page doesn't move when it appears.
 */
export function HeroGrid({ className }: HeroGridProps) {
  const t = useTranslations("home.hero");

  return (
    <div className={cn("h-[432px]", className)}>
      <ClientOnly
        fallback={
          <div className="border-site-line bg-site-surface rounded-site h-full border" />
        }
      >
        <DataGrid
          columns={columns}
          dataSource={rows}
          getRowId={(row) => String(row.Id)}
          label={t("gridLabel")}
          borders="horizontal"
          height={BODY_HEIGHT}
          virtualized
          sortableColumns
          groupableColumns
          groupByDraggableColumns
          // A fixed drop target, so the grid's height doesn't change when
          // the last level is removed.
          groupByBarVisibility="always"
          defaultGroupBy={defaultGroupBy}
          toolbar={{ label: t("gridToolbarLabel"), items: toolbarItems }}
        />
      </ClientOnly>
    </div>
  );
}
