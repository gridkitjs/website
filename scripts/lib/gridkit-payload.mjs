/**
 * Reads the `client_payload` of the events gridkit sends this repo through
 * `repository_dispatch`, and the `@gridkitjs/*` packages this site installs.
 * gridkit's release pipeline defines the payloads; a field changed there
 * changes here too.
 */
import { readFile } from "node:fs/promises";
import { MANIFEST_REF } from "./docs-manifest.mjs";

const SCOPE = "@gridkitjs/";
const SHA = /^[0-9a-f]{40}$/;
/** An exact version, never a range: `0.15.0` or `0.0.0-dev-20261106120000`. */
const VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
/** A release: `major.minor.patch` and nothing after it. */
const RELEASE = /^\d+\.\d+\.\d+$/;

/**
 * @typedef {object} SnapshotPayload `gridkit-snapshot`: a `dev` snapshot was
 *   published.
 * @property {string} sha The gridkit commit the snapshot was built from.
 * @property {Record<string, string>} versions Every package name, mapped to
 *   the exact version to install.
 * @property {string} manifestRef The gridkit branch holding the docs manifest
 *   that matches the snapshot, `docs-meta-next`.
 */

/**
 * @typedef {object} ReleasePayload `gridkit-release`: a release and its docs
 *   were published.
 * @property {string} sha The gridkit commit the release was cut from.
 * @property {Record<string, string>} versions Every package name, mapped to
 *   its released version, whether or not this release changed it.
 * @property {string} manifestSha The `docs-meta` commit holding the docs for
 *   those versions, for `gridkit.json`.
 */

/**
 * @typedef {object} GridkitDependency
 * @property {string} range The range `package.json` declares.
 * @property {string | undefined} installed The version `package-lock.json`
 *   installs.
 */

/** A payload this repo can't act on; its message lists every problem. */
export class PayloadError extends Error {}

/** @param {string} file Relative to the repo root. */
async function readRepoJson(file) {
  return JSON.parse(
    await readFile(new URL(`../../${file}`, import.meta.url), "utf8"),
  );
}

/**
 * The `@gridkitjs/*` packages in `package.json`'s dependencies, with the range
 * declared for each and the version `package-lock.json` installs.
 *
 * @returns {Promise<Record<string, GridkitDependency>>}
 */
export async function gridkitDependencies() {
  const [pkg, lockfile] = await Promise.all([
    readRepoJson("package.json"),
    readRepoJson("package-lock.json"),
  ]);
  /** @type {Record<string, string>} */
  const dependencies = pkg.dependencies ?? {};
  return Object.fromEntries(
    Object.entries(dependencies)
      .filter(([name]) => name.startsWith(SCOPE))
      .map(([name, range]) => [
        name,
        {
          range,
          installed: lockfile.packages?.[`node_modules/${name}`]?.version,
        },
      ]),
  );
}

/**
 * The `@gridkitjs/*` packages in `package.json`'s dependencies, with the
 * version `package-lock.json` installs for each.
 *
 * @returns {Promise<Record<string, string | undefined>>}
 */
export async function installedGridkitVersions() {
  return Object.fromEntries(
    Object.entries(await gridkitDependencies()).map(([name, { installed }]) => [
      name,
      installed,
    ]),
  );
}

/**
 * Checks `versions` names exactly the packages this site installs, each with
 * a version `rule.format` accepts.
 *
 * @param {unknown} versions
 * @param {string[]} expected The `@gridkitjs/*` dependency names.
 * @param {string[]} problems Collects what's wrong.
 * @param {{ format: RegExp, kind: string }} rule What a version must match,
 *   and what to call it in a problem.
 */
function checkVersions(versions, expected, problems, rule) {
  if (
    typeof versions !== "object" ||
    versions === null ||
    Array.isArray(versions)
  ) {
    problems.push("versions must be an object of package names to versions");
    return;
  }
  for (const name of expected) {
    if (!(name in versions)) problems.push(`versions lacks ${name}`);
  }
  for (const [name, version] of Object.entries(versions)) {
    if (!expected.includes(name)) {
      problems.push(
        `versions names ${name}, which package.json doesn't depend on`,
      );
    } else if (typeof version !== "string" || !rule.format.test(version)) {
      problems.push(
        `versions.${name} must be ${rule.kind}, got ${JSON.stringify(version)}`,
      );
    }
  }
}

/**
 * @param {string} field
 * @param {unknown} value
 * @param {string[]} problems Collects what's wrong.
 */
function checkSha(field, value, problems) {
  if (typeof value !== "string" || !SHA.test(value)) {
    problems.push(
      `${field} must be a full 40-character commit SHA, got ${JSON.stringify(value)}`,
    );
  }
}

/**
 * Parses a payload's JSON, which must be an object.
 *
 * @param {string} text
 * @returns {Record<string, unknown>}
 * @throws {PayloadError}
 */
function parseObject(text) {
  if (text.trim() === "") throw new PayloadError("The payload is empty.");
  /** @type {unknown} */
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new PayloadError(`The payload isn't JSON: ${text}`);
  }
  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload)
  ) {
    throw new PayloadError(`The payload must be an object: ${text}`);
  }
  return /** @type {Record<string, unknown>} */ (payload);
}

/**
 * @param {string[]} problems
 * @throws {PayloadError} When there are any.
 */
function throwProblems(problems) {
  if (problems.length > 0) {
    throw new PayloadError(`Invalid payload:\n  ${problems.join("\n  ")}`);
  }
}

/**
 * Parses and validates a `gridkit-snapshot` payload.
 *
 * @param {string} text The payload as JSON.
 * @param {string[]} expected The `@gridkitjs/*` dependency names.
 * @returns {SnapshotPayload}
 * @throws {PayloadError}
 */
export function parseSnapshotPayload(text, expected) {
  const payload = parseObject(text);
  /** @type {string[]} */
  const problems = [];
  const { sha, versions, manifestRef } = payload;
  checkSha("sha", sha, problems);
  checkVersions(versions, expected, problems, {
    format: VERSION,
    kind: "an exact version",
  });
  if (typeof manifestRef !== "string" || !MANIFEST_REF.test(manifestRef)) {
    problems.push(
      `manifestRef must be a branch name, got ${JSON.stringify(manifestRef)}`,
    );
  }
  throwProblems(problems);
  return /** @type {SnapshotPayload} */ (payload);
}

/**
 * Parses and validates a `gridkit-release` payload. Production takes releases
 * only, so a prerelease version is a problem.
 *
 * @param {string} text The payload as JSON.
 * @param {string[]} expected The `@gridkitjs/*` dependency names.
 * @returns {ReleasePayload}
 * @throws {PayloadError}
 */
export function parseReleasePayload(text, expected) {
  const payload = parseObject(text);
  /** @type {string[]} */
  const problems = [];
  const { sha, versions, manifestSha } = payload;
  checkSha("sha", sha, problems);
  checkVersions(versions, expected, problems, {
    format: RELEASE,
    kind: "a release (major.minor.patch, no prerelease)",
  });
  checkSha("manifestSha", manifestSha, problems);
  throwProblems(problems);
  return /** @type {ReleasePayload} */ (payload);
}
