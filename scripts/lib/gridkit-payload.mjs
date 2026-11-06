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

/**
 * @typedef {object} SnapshotPayload `gridkit-snapshot`: a `dev` snapshot was
 *   published.
 * @property {string} sha The gridkit commit the snapshot was built from.
 * @property {Record<string, string>} versions Every package name, mapped to
 *   the exact version to install.
 * @property {string} manifestRef The gridkit branch holding the docs manifest
 *   that matches the snapshot, `docs-meta-next`.
 */

/** A payload this repo can't act on; its message lists every problem. */
export class PayloadError extends Error {}

/**
 * The `@gridkitjs/*` packages in `package.json`'s dependencies, with the
 * version `package-lock.json` installs for each.
 *
 * @returns {Promise<Record<string, string | undefined>>}
 */
export async function installedGridkitVersions() {
  /** @param {string} file */
  const readJson = async (file) =>
    JSON.parse(await readFile(new URL(`../../${file}`, import.meta.url)));
  const [pkg, lockfile] = await Promise.all([
    readJson("package.json"),
    readJson("package-lock.json"),
  ]);
  return Object.fromEntries(
    Object.keys(pkg.dependencies ?? {})
      .filter((name) => name.startsWith(SCOPE))
      .map((name) => [
        name,
        lockfile.packages?.[`node_modules/${name}`]?.version,
      ]),
  );
}

/**
 * Checks `versions` names exactly the packages this site installs, each with
 * an exact version.
 *
 * @param {unknown} versions
 * @param {string[]} expected The `@gridkitjs/*` dependency names.
 * @param {string[]} problems Collects what's wrong.
 */
function checkVersions(versions, expected, problems) {
  if (typeof versions !== "object" || versions === null) {
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
    } else if (typeof version !== "string" || !VERSION.test(version)) {
      problems.push(
        `versions.${name} must be an exact version, got ${JSON.stringify(version)}`,
      );
    }
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

  /** @type {string[]} */
  const problems = [];
  const { sha, versions, manifestRef } =
    /** @type {Record<string, unknown>} */ (payload);
  if (typeof sha !== "string" || !SHA.test(sha)) {
    problems.push(
      `sha must be a full 40-character commit SHA, got ${JSON.stringify(sha)}`,
    );
  }
  checkVersions(versions, expected, problems);
  if (typeof manifestRef !== "string" || !MANIFEST_REF.test(manifestRef)) {
    problems.push(
      `manifestRef must be a branch name, got ${JSON.stringify(manifestRef)}`,
    );
  }
  if (problems.length > 0) {
    throw new PayloadError(`Invalid payload:\n  ${problems.join("\n  ")}`);
  }
  return /** @type {SnapshotPayload} */ (payload);
}
