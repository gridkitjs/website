import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { DOCS_CACHE_TAG } from "@/lib/docs/github";

function isValidSignature(
  body: string,
  header: string,
  secret: string,
): boolean {
  const expected = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
  const expectedBuffer = Buffer.from(expected);
  const headerBuffer = Buffer.from(header);
  return (
    expectedBuffer.length === headerBuffer.length &&
    timingSafeEqual(expectedBuffer, headerBuffer)
  );
}

/** The git ref the gridkit Action reports pushing, for the log line only. */
function pushedRef(body: string): string {
  try {
    const { ref } = JSON.parse(body) as { ref?: unknown };
    return typeof ref === "string" ? ref : "an unnamed ref";
  } catch {
    return "an unnamed ref";
  }
}

/**
 * Called by the `gridkit` repo's `revalidate-docs` GitHub Action (or a native
 * GitHub webhook) after a push touching `packages/*\/docs`, so edits go live
 * without a website redeploy. Verifies an HMAC-SHA256 signature over the raw
 * body rather than trusting the caller, so this endpoint can't be used to
 * spam cache invalidation from the public internet.
 */
export async function POST(request: Request) {
  const secret = process.env.DOCS_REVALIDATE_SECRET;
  if (!secret) {
    console.error("[revalidate-docs] DOCS_REVALIDATE_SECRET is not configured");
    return NextResponse.json(
      { error: "DOCS_REVALIDATE_SECRET is not configured" },
      { status: 500 },
    );
  }

  const signature = request.headers.get("x-hub-signature-256");
  const body = await request.text();
  if (!signature || !isValidSignature(body, signature, secret)) {
    console.warn("[revalidate-docs] Rejected a request with a bad signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // This is a webhook from an external system (gridkit's Action), so it needs
  // immediate expiration rather than "max"'s stale-while-revalidate profile —
  // otherwise docs stay stale until a second visitor happens to hit the page.
  revalidateTag(DOCS_CACHE_TAG, { expire: 0 });
  console.info(
    `[revalidate-docs] Revalidated ${DOCS_CACHE_TAG} for ${pushedRef(body)}`,
  );
  return NextResponse.json({ revalidated: true, tag: DOCS_CACHE_TAG });
}
