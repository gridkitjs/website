import { buildSearchIndex } from "@/lib/docs/search-index";

/**
 * The docs search index, prerendered and regenerated like a docs page: its
 * data comes from `getDocsTree()`, whose fetches carry the `docs-content`
 * tag, so the revalidation webhook refreshes it along with the pages. Next
 * sends the matching ISR `Cache-Control` (`s-maxage=3600`,
 * `stale-while-revalidate`) for the CDN. Must equal the docs fetch cache's
 * one hour; segment config has to be a literal.
 */
export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  return Response.json(await buildSearchIndex());
}
