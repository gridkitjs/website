export const deploymentRows = [
  {
    Id: 1,
    Service: "checkout-api",
    Environment: { Name: "production", Region: "us-east-1" },
    Status: "healthy",
    Cost: 1240.5,
  },
  {
    Id: 2,
    Service: "billing-worker",
    Environment: { Name: "production", Region: "eu-west-1" },
    Status: "degraded",
    Cost: 860.2,
  },
  {
    Id: 3,
    Service: "search-index",
    Environment: { Name: "staging", Region: "us-east-1" },
    Status: "healthy",
    Cost: 92.75,
  },
  {
    Id: 4,
    Service: "notifications",
    Environment: { Name: "production", Region: "us-west-2" },
    Status: "down",
    Cost: 305.4,
  },
  {
    Id: 5,
    Service: "analytics-pipeline",
    Environment: { Name: "staging", Region: "eu-west-1" },
    Status: "healthy",
    Cost: 145.0,
  },
] as const;

export type DeploymentRow = (typeof deploymentRows)[number];

export interface TicketRow {
  Id: number;
  Name: string;
  Region: string;
  Status: string;
  Amount: number;
  Notes: string;
}

const regions = ["North", "South", "East", "West", "Central"] as const;
const statuses = ["Open", "Pending", "Closed", "Escalated"] as const;

/**
 * The row at `index`, computed from the index alone, so every render and
 * every page of `mockLoadMore` agrees on it. One row in five carries a note
 * long enough to wrap.
 */
function ticketRow(index: number): TicketRow {
  const id = index + 1;
  return {
    Id: id,
    Name: `Item ${String(id)}`,
    Region: regions[index % regions.length] ?? "North",
    Status: statuses[index % statuses.length] ?? "Open",
    Amount: 10 + ((index * 47) % 4990),
    Notes:
      index % 5 === 0
        ? `Row ${String(id)} carries a longer note that wraps across more than one line once its column opts into wrapping.`
        : `Note ${String(id)}`,
  };
}

/** `count` synthetic rows, identical on every call: enough to page or virtualize. */
export function makeRows(count: number): TicketRow[] {
  return Array.from({ length: count }, (_unused, index) => ticketRow(index));
}

/** How many rows `mockLoadMore` serves before it reports no more. */
export const MOCK_TOTAL_ROWS = 500;

const MOCK_LOAD_DELAY_MS = 600;

/**
 * A stand-in for a paged API: resolves with page `page` (0-based) of `size`
 * rows after a fixed delay, and whether a further page exists.
 */
export async function mockLoadMore(
  page: number,
  size: number,
): Promise<{ rows: TicketRow[]; hasMore: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LOAD_DELAY_MS));
  const start = page * size;
  const end = Math.min(start + size, MOCK_TOTAL_ROWS);
  const rows = Array.from({ length: Math.max(end - start, 0) }, (_unused, i) =>
    ticketRow(start + i),
  );
  return { rows, hasMore: end < MOCK_TOTAL_ROWS };
}
