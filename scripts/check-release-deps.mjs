/**
 * Fails when `package.json` or `package-lock.json` holds a prerelease
 * `@gridkitjs/*` version, such as a `0.0.0-dev-…` snapshot. Production
 * renders released packages only, so CI runs this on pull requests into
 * `main`; the `development` branch, which tracks the snapshots, is exempt.
 *
 * A version is a prerelease when its `major.minor.patch` is followed by `-`.
 *
 * Usage: node scripts/check-release-deps.mjs
 */
import { readFile } from "node:fs/promises";

const SCOPE = "@gridkitjs/";
const PRERELEASE = /\d+\.\d+\.\d+-/;
const DEPENDENCY_FIELDS = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
];

/** @param {string} file Relative to the repo root. */
async function readJson(file) {
  return JSON.parse(await readFile(new URL(`../${file}`, import.meta.url)));
}

/**
 * `<file>: <name> <version>` for every prerelease `@gridkitjs/*` range in a
 * manifest's dependency fields.
 *
 * @param {string} file
 * @param {Record<string, Record<string, string> | undefined>} manifest
 * @returns {string[]}
 */
function prereleaseRanges(file, manifest) {
  return DEPENDENCY_FIELDS.flatMap((field) =>
    Object.entries(manifest[field] ?? {})
      .filter(
        ([name, range]) => name.startsWith(SCOPE) && PRERELEASE.test(range),
      )
      .map(([name, range]) => `${file}: ${name} ${range} (${field})`),
  );
}

/**
 * Every prerelease `@gridkitjs/*` package the lockfile installs, at any depth.
 *
 * @param {{ packages?: Record<string, { version?: string }> }} lockfile
 * @returns {string[]}
 */
function prereleaseInstalls(lockfile) {
  return Object.entries(lockfile.packages ?? {})
    .filter(
      ([path, { version = "" }]) =>
        path.split("node_modules/").at(-1)?.startsWith(SCOPE) &&
        PRERELEASE.test(version),
    )
    .map(([path, { version }]) => `package-lock.json: ${path} ${version}`);
}

const [pkg, lockfile] = await Promise.all([
  readJson("package.json"),
  readJson("package-lock.json"),
]);
const problems = [
  ...prereleaseRanges("package.json", pkg),
  ...prereleaseInstalls(lockfile),
];

if (problems.length > 0) {
  console.error(
    `Prerelease @gridkitjs versions, which main does not take:\n  ${problems.join("\n  ")}`,
  );
  process.exit(1);
}
console.log("Every @gridkitjs dependency is a release.");
