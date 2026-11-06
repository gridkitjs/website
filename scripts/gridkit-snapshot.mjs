/**
 * Validates a `gridkit-snapshot` payload, read from `GRIDKIT_PAYLOAD`, and
 * says what installing it would change. Fails with every problem listed when
 * the payload is invalid; installs and commits nothing itself.
 *
 * Outputs, to `$GITHUB_OUTPUT` in GitHub Actions and printed elsewhere:
 * - `changed`: `true` when any version differs from what `package-lock.json`
 *   installs, else `false`.
 * - `packages`: `<name>@<version>` for every package, space-separated, for
 *   `npm install --save-exact`.
 * - `short-sha`: the gridkit commit, shortened to 7 characters.
 * - `manifest-ref`: the docs manifest's branch.
 *
 * Usage: GRIDKIT_PAYLOAD='{"sha":"…","versions":{…},"manifestRef":"docs-meta-next"}' node scripts/gridkit-snapshot.mjs
 */
import { writeActionsFile } from "./lib/github-actions.mjs";
import {
  PayloadError,
  installedGridkitVersions,
  parseSnapshotPayload,
} from "./lib/gridkit-payload.mjs";

const installed = await installedGridkitVersions();

/** @type {import("./lib/gridkit-payload.mjs").SnapshotPayload} */
let payload;
try {
  payload = parseSnapshotPayload(
    process.env.GRIDKIT_PAYLOAD ?? "",
    Object.keys(installed),
  );
} catch (error) {
  if (!(error instanceof PayloadError)) throw error;
  console.error(error.message);
  process.exit(1);
}

const changes = Object.entries(payload.versions)
  .filter(([name, version]) => installed[name] !== version)
  .map(([name, version]) => `${name} ${installed[name]} -> ${version}`);

console.log(
  changes.length > 0
    ? `Snapshot ${payload.sha} changes:\n  ${changes.join("\n  ")}`
    : `Snapshot ${payload.sha} is already installed.`,
);

await writeActionsFile("GITHUB_OUTPUT", {
  changed: String(changes.length > 0),
  packages: Object.entries(payload.versions)
    .map(([name, version]) => `${name}@${version}`)
    .join(" "),
  "short-sha": payload.sha.slice(0, 7),
  "manifest-ref": payload.manifestRef,
});
