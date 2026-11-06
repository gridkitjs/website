/**
 * Validates a `gridkit-snapshot` payload, read from `GRIDKIT_PAYLOAD`, and
 * says what installing it would change. Fails with every problem listed when
 * the payload is invalid; installs and commits nothing itself.
 *
 * While a release pull request (`development` → `main`) is open, the
 * snapshot is skipped, with a notice and a line in the run's summary: its
 * prerelease versions would replace the release's on `development`, and the
 * pull request would fail. The next snapshot after the release merges brings
 * `development` back onto the snapshots. Checking needs `gh` (read-only).
 *
 * Outputs, to `$GITHUB_OUTPUT` in GitHub Actions and printed elsewhere:
 * - `changed`: `true` when any version differs from what `package-lock.json`
 *   installs and no release pull request is open, else `false`.
 * - `packages`: `<name>@<version>` for every package, space-separated, for
 *   `npm install --save-exact`.
 * - `short-sha`: the gridkit commit, shortened to 7 characters.
 * - `manifest-ref`: the docs manifest's branch.
 *
 * Usage: GRIDKIT_PAYLOAD='{"sha":"…","versions":{…},"manifestRef":"docs-meta-next"}' node scripts/gridkit-snapshot.mjs
 */
import { appendSummary, writeActionsFile } from "./lib/github-actions.mjs";
import {
  PayloadError,
  installedGridkitVersions,
  parseSnapshotPayload,
} from "./lib/gridkit-payload.mjs";
import { openReleasePullRequest } from "./lib/release-pull-request.mjs";

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

const release = changes.length > 0 ? openReleasePullRequest() : undefined;
if (release) {
  const prefix = process.env.GITHUB_ACTIONS === "true" ? "::notice::" : "";
  console.log(
    `${prefix}Skipped snapshot ${payload.sha.slice(0, 7)}: the release pull request ${release.url} is open.`,
  );
  await appendSummary(
    `### Snapshot ${payload.sha.slice(0, 7)} skipped\n\nThe release pull request [#${release.number}](${release.url}) is open, and this snapshot's prerelease versions would fail it. The next snapshot after it merges installs normally.`,
  );
}

await writeActionsFile("GITHUB_OUTPUT", {
  changed: String(changes.length > 0 && !release),
  packages: Object.entries(payload.versions)
    .map(([name, version]) => `${name}@${version}`)
    .join(" "),
  "short-sha": payload.sha.slice(0, 7),
  "manifest-ref": payload.manifestRef,
});
