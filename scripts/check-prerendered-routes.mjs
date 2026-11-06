/**
 * Fails when `next build` did not prerender the docs or changelog routes.
 *
 * Both routes must be static (`●` in the build's route table). A layout or
 * page that reads request headers, such as one that skips `setRequestLocale`,
 * turns a route dynamic (`ƒ`): the build still succeeds, but every visit then
 * renders on demand behind the loading skeleton. See
 * `app/[locale]/AGENTS.md`.
 *
 * A route is read from the table as a top-level line carrying the route's
 * pattern, followed by one line per prerendered path. A dynamic route has the
 * `ƒ` on its own line and no paths below it; a route missing from the table
 * fails too, so a changed table layout cannot pass this check unnoticed.
 *
 * Usage: node scripts/check-prerendered-routes.mjs <build-log>
 */
import { readFile } from "node:fs/promises";

const REQUIRED_ROUTES = [
  "/[locale]/docs/[[...slug]]",
  "/[locale]/changelog/[[...slug]]",
];

const STATIC = "●";
const DYNAMIC = "ƒ";

/** @typedef {{ pattern: string, symbol: string | null, children: string[] }} RouteEntry */

/**
 * Splits the route table of a `next build` log into its entries: a top-level
 * line (`├ ƒ /pattern`, `├   /pattern`) and the indented lines below it.
 *
 * @param {string} log
 * @returns {RouteEntry[]}
 */
function parseRouteTable(log) {
  // Drop ANSI colour codes in case the log came from a terminal.
  const lines = log.replace(/\u001b\[[0-9;]*m/g, "").split(/\r?\n/);
  const start = lines.findIndex((line) => line.startsWith("Route (app)"));
  if (start === -1) return [];

  /** @type {RouteEntry[]} */
  const entries = [];
  for (const line of lines.slice(start + 1)) {
    if (line.trim() === "") break;
    const top = /^[┌├└]\s+(?:([●ƒ○◐])\s+)?(\S+)/u.exec(line);
    if (top) {
      entries.push({
        pattern: top[2] ?? "",
        symbol: top[1] ?? null,
        children: [],
      });
    } else {
      entries.at(-1)?.children.push(line);
    }
  }
  return entries;
}

/**
 * Why a route fails the check, or `null` when it is prerendered.
 *
 * @param {RouteEntry | undefined} entry
 * @returns {string | null}
 */
function problemWith(entry) {
  if (!entry) return "is not in the build's route table";
  if (entry.symbol === DYNAMIC) return `is dynamic (${DYNAMIC})`;
  const paths = entry.children.filter((line) => line.includes(STATIC));
  if (paths.length === 0) return `has no prerendered paths (${STATIC})`;
  if (entry.children.some((line) => line.includes(DYNAMIC))) {
    return `has a dynamic path (${DYNAMIC})`;
  }
  return null;
}

const logPath = process.argv[2];
if (!logPath) {
  console.error("Usage: node scripts/check-prerendered-routes.mjs <build-log>");
  process.exit(2);
}

const entries = parseRouteTable(await readFile(logPath, "utf8"));
let failed = false;
for (const route of REQUIRED_ROUTES) {
  const problem = problemWith(entries.find((entry) => entry.pattern === route));
  if (problem) {
    failed = true;
    console.error(`${route} ${problem}.`);
  } else {
    console.log(`${route} is prerendered.`);
  }
}

if (failed) {
  console.error(
    "Fix: see 'Keep the routes prerendered' in app/[locale]/AGENTS.md.",
  );
  process.exit(1);
}
