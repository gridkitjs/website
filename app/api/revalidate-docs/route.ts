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

/** How far a request's `ts` may be from now before it's treated as a replay. */
const MAX_CLOCK_SKEW_SECONDS = 5 * 60;

/** The body gridkit's revalidate-docs Action signs and posts. */
interface RevalidationPayload {
  ref: string;
  sha: string;
  /** Unix seconds when the Action first sent the request; retries resend it unchanged. */
  ts: number;
}

function parsePayload(body: string): RevalidationPayload | null {
  try {
    const { ref, sha, ts } = JSON.parse(body) as Partial<RevalidationPayload>;
    return typeof ref === "string" &&
      typeof sha === "string" &&
      typeof ts === "number"
      ? { ref, sha, ts }
      : null;
  } catch {
    return null;
  }
}

function isFresh(ts: number): boolean {
  return Math.abs(Date.now() / 1000 - ts) <= MAX_CLOCK_SKEW_SECONDS;
}

/**
 * Called by the `gridkit` repo's `revalidate-docs` GitHub Action after it
 * publishes a new docs manifest, so docs and changelog edits go live without
 * a website redeploy. Verifies an HMAC-SHA256 signature over the raw body
 * rather than trusting the caller, so this endpoint can't be used to spam
 * cache invalidation from the public internet, and rejects a signed body
 * whose `ts` is more than five minutes off, so a captured request can't be
 * replayed later.
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

  const payload = parsePayload(body);
  if (!payload || !isFresh(payload.ts)) {
    console.warn(
      "[revalidate-docs] Rejected a signed request that is malformed or outside the replay window",
    );
    return NextResponse.json(
      { error: "Missing or stale timestamp" },
      { status: 401 },
    );
  }

  // This is a webhook from an external system (gridkit's Action), so it needs
  // immediate expiration rather than "max"'s stale-while-revalidate profile —
  // otherwise docs stay stale until a second visitor happens to hit the page.
  revalidateTag(DOCS_CACHE_TAG, { expire: 0 });
  console.info(
    `[revalidate-docs] Revalidated ${DOCS_CACHE_TAG} for ${payload.ref} at ${payload.sha}`,
  );
  return NextResponse.json({ revalidated: true, tag: DOCS_CACHE_TAG });
}
