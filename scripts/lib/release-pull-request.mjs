/**
 * Finds the release pull request: `development` → `main`, which the release
 * workflow opens when gridkit releases. `development` reaches `main` through
 * no other pull request, so any open one with that base and head is it.
 * Read-only; needs `gh`, authenticated through `GH_TOKEN` in Actions, and
 * reads the repo from `GH_REPO` or the checkout's remote.
 */
import { spawnSync } from "node:child_process";

export const RELEASE_BASE = "main";
export const RELEASE_HEAD = "development";

/**
 * @typedef {object} PullRequest
 * @property {number} number
 * @property {string} url
 */

/**
 * The open release pull request, or `undefined` when there is none. Throws
 * when `gh` fails.
 *
 * @returns {PullRequest | undefined}
 */
export function openReleasePullRequest() {
  const args = [
    "pr",
    "list",
    "--base",
    RELEASE_BASE,
    "--head",
    RELEASE_HEAD,
    "--state",
    "open",
    "--json",
    "number,url",
  ];
  const result = spawnSync("gh", args, { encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`gh ${args.join(" ")} failed:\n${result.stderr.trim()}`);
  }
  /** @type {PullRequest[]} */
  const open = JSON.parse(result.stdout);
  return open[0];
}
