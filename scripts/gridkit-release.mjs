/**
 * Validates a `gridkit-release` payload, read from `GRIDKIT_PAYLOAD`, pins
 * its `manifestSha` in `gridkit.json`, and says which packages to install.
 * Fails with every problem listed when the payload is invalid, including a
 * prerelease version. Installs and commits nothing itself.
 *
 * A package needs installing when `package-lock.json` installs another
 * version, or when `package.json` doesn't declare it as `^<version>`: a
 * release replaces the exact pin a `dev` snapshot leaves behind with a caret
 * range, as on `main`.
 *
 * Outputs, to `$GITHUB_OUTPUT` in GitHub Actions and printed elsewhere:
 * - `changed`: `true` when there is anything to commit, else `false`.
 * - `install`: `true` when any package needs installing, else `false`.
 * - `packages`: `<name>@<version>` for every package, space-separated, for
 *   `npm install --save-prefix=^`.
 * - `subject`: the commit subject, `chore(deps): ship gridkit <summary>`.
 *
 * `--dry-run` leaves `gridkit.json` as it is and prints what it would write.
 *
 * Usage: GRIDKIT_PAYLOAD='{"sha":"…","versions":{…},"manifestSha":"…"}' node scripts/gridkit-release.mjs [--dry-run]
 */
import { readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { appendSummary, writeActionsFile } from "./lib/github-actions.mjs";
import {
  PayloadError,
  gridkitDependencies,
  parseReleasePayload,
} from "./lib/gridkit-payload.mjs";

const PIN = new URL("../gridkit.json", import.meta.url);
/** Past this many changed packages, the subject names the first only. */
const LISTED_IN_SUBJECT = 2;

const { values: options } = parseArgs({
  options: { "dry-run": { type: "boolean", default: false } },
});

const dependencies = await gridkitDependencies();

/** @type {import("./lib/gridkit-payload.mjs").ReleasePayload} */
let payload;
try {
  payload = parseReleasePayload(
    process.env.GRIDKIT_PAYLOAD ?? "",
    Object.keys(dependencies),
  );
} catch (error) {
  if (!(error instanceof PayloadError)) throw error;
  console.error(error.message);
  process.exit(1);
}

/** `@gridkitjs/theme-tailwind` → `theme-tailwind`. */
const shortName = (/** @type {string} */ name) => name.split("/").at(-1);

const installs = Object.entries(payload.versions).filter(
  ([name, version]) =>
    dependencies[name]?.installed !== version ||
    dependencies[name]?.range !== `^${version}`,
);

const pin = JSON.parse(await readFile(PIN, "utf8"));
const pinChanged = pin.docsManifest !== payload.manifestSha;
const shortManifest = payload.manifestSha.slice(0, 7);

/** @type {string} */
let summary;
if (installs.length === 0) {
  summary = `docs ${shortManifest}`;
} else if (installs.length <= LISTED_IN_SUBJECT) {
  summary = installs
    .map(([name, version]) => `${shortName(name)} ${version}`)
    .join(", ");
} else {
  const [[name, version]] = installs;
  summary = `${shortName(name)} ${version} and ${installs.length - 1} more`;
}

const changes = [
  ...installs.map(
    ([name, version]) =>
      `| \`${name}\` | ${dependencies[name]?.range ?? "none"} (${dependencies[name]?.installed ?? "not installed"}) | ^${version} |`,
  ),
  ...(pinChanged
    ? [
        `| \`gridkit.json\` docsManifest | ${String(pin.docsManifest).slice(0, 7)} | ${shortManifest} |`,
      ]
    : []),
];
await appendSummary(
  changes.length > 0
    ? [
        `### Release ${payload.sha.slice(0, 7)} changes`,
        "",
        "| What | From | To |",
        "| --- | --- | --- |",
        ...changes,
      ].join("\n")
    : `### Release ${payload.sha.slice(0, 7)} is already on development`,
);

if (pinChanged) {
  pin.docsManifest = payload.manifestSha;
  const text = `${JSON.stringify(pin, null, 2)}\n`;
  if (options["dry-run"]) {
    console.log(`Would write gridkit.json:\n${text}`);
  } else {
    await writeFile(PIN, text);
  }
}

await writeActionsFile("GITHUB_OUTPUT", {
  changed: String(changes.length > 0),
  install: String(installs.length > 0),
  packages: Object.entries(payload.versions)
    .map(([name, version]) => `${name}@${version}`)
    .join(" "),
  subject: `chore(deps): ship gridkit ${summary}`,
});
