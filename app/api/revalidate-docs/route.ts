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
    return NextResponse.json(
      { error: "DOCS_REVALIDATE_SECRET is not configured" },
      { status: 500 },
    );
  }

  const signature = request.headers.get("x-hub-signature-256");
  const body = await request.text();
  if (!signature || !isValidSignature(body, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // "max" is the recommended stale-while-revalidate profile: stale docs
  // content keeps serving instantly while the next request refetches it.
  revalidateTag(DOCS_CACHE_TAG, "max");
  return NextResponse.json({ revalidated: true, tag: DOCS_CACHE_TAG });
}
