/**
 * Opens, or updates, the release pull request `development` → `main` for a
 * `gridkit-release` payload read from `GRIDKIT_PAYLOAD`, after the release
 * workflow has committed the release to `development` and checked it.
 *
 * - `--checks passed`: turns on auto-merge with a merge commit, so the pull
 *   request merges itself once `main`'s required checks pass. When none is
 *   pending, it merges now. When the repo doesn't allow auto-merge, it leaves
 *   the pull request open and says so in the run's summary.
 * - `--checks failed`: comments which check failed (`--failed-check`) and
 *   what to do. Auto-merge isn't turned on; the comment says how to get it
 *   merged once the fix lands.
 *
 * With no open pull request and nothing on `development` that `main` lacks,
 * there is nothing to open, and it says so.
 *
 * Needs `gh`, with `GH_TOKEN` (pull-requests and contents write) and
 * `GH_REPO`. `--dry-run` still reads the repo's pull requests, but prints the
 * writes instead of making them.
 *
 * Usage: GRIDKIT_PAYLOAD='{…}' node scripts/gridkit-release-pr.mjs --checks <passed|failed> [--failed-check <check>] [--dry-run]
 */
import { spawnSync } from "node:child_process";
import { parseArgs } from "node:util";
import { OWNER, REPO } from "./lib/docs-manifest.mjs";
import { appendSummary } from "./lib/github-actions.mjs";
import {
  PayloadError,
  gridkitDependencies,
  parseReleasePayload,
} from "./lib/gridkit-payload.mjs";
import {
  RELEASE_BASE as BASE,
  RELEASE_HEAD as HEAD,
  openReleasePullRequest,
} from "./lib/release-pull-request.mjs";

const GRIDKIT = `https://github.com/${OWNER}/${REPO}`;

/** How a fix made on `development` reaches the release pull request. */
const ON_DEVELOPMENT =
  "on a branch off `development`, and open its pull request into `development`: merging it updates this one, and CI runs again.";

/**
 * What each check the release workflow runs means when it fails, and what to
 * do about it. The keys are the check names its `check` job reports.
 *
 * @type {Record<string, { failed: string, fix: string }>}
 */
const FAILURES = {
  install: {
    failed: "`npm ci` failed on `development`.",
    fix: `Re-run the workflow, as below. If it fails again, \`package-lock.json\` on \`development\` is broken: fix it ${ON_DEVELOPMENT}`,
  },
  "release-deps": {
    failed:
      "`development` installs a prerelease `@gridkitjs/*` version, which `main` refuses. A gridkit snapshot most likely landed on `development` after the release commit.",
    fix: "Re-run the workflow, as below: it installs the release again.",
  },
  format: {
    failed: "`npm run format:check` fails on `development`.",
    fix: `Run \`npx prettier --write\` on the files it names ${ON_DEVELOPMENT}`,
  },
  lint: {
    failed: "`npm run lint` fails with the released packages.",
    fix: `It is usually a live example written against a snapshot API that changed before the release. Fix it ${ON_DEVELOPMENT}`,
  },
  types: {
    failed: "`npx tsc --noEmit` fails with the released packages.",
    fix: `It is usually a live example written against a snapshot API that changed before the release. Fix it ${ON_DEVELOPMENT}`,
  },
  test: {
    failed: "The theme builder's unit tests fail with the released packages.",
    fix: `It is usually the theme package's token manifest or presets changing shape, such as a new \`schemaVersion\` or a value the builder refuses. Update \`lib/theme-builder/\` ${ON_DEVELOPMENT}`,
  },
  build: {
    failed: "`npm run build` fails with the released packages and docs.",
    fix: `Read the first error in the run. A doc page that fails to compile is fixed in gridkit, whose next docs publish sends a new release. Anything else, such as a live example that no longer compiles, fix ${ON_DEVELOPMENT}`,
  },
  routes: {
    failed: "The docs or changelog route is no longer prerendered (`ƒ`).",
    fix: `See "Keep the routes prerendered" in \`app/[locale]/AGENTS.md\`, and fix it ${ON_DEVELOPMENT}`,
  },
  tags: {
    failed:
      "The pinned docs use a tag this site doesn't register, usually a live example that hasn't landed yet.",
    fix: `Add the example (the \`live-example\` skill) ${ON_DEVELOPMENT}`,
  },
  sources: {
    failed:
      "`lib/docs/example-sources.generated.ts` doesn't match the installed packages.",
    fix: `Run \`node scripts/gen-example-sources.mjs\` and commit the result ${ON_DEVELOPMENT}`,
  },
};

const { values: options } = parseArgs({
  options: {
    checks: { type: "string" },
    "failed-check": { type: "string", default: "" },
    "dry-run": { type: "boolean", default: false },
  },
});
if (options.checks !== "passed" && options.checks !== "failed") {
  console.error(
    `--checks must be passed or failed, got ${JSON.stringify(options.checks)}`,
  );
  process.exit(1);
}
const dryRun = options["dry-run"];

/** @type {import("./lib/gridkit-payload.mjs").ReleasePayload} */
let payload;
try {
  payload = parseReleasePayload(
    process.env.GRIDKIT_PAYLOAD ?? "",
    Object.keys(await gridkitDependencies()),
  );
} catch (error) {
  if (!(error instanceof PayloadError)) throw error;
  console.error(error.message);
  process.exit(1);
}

const runUrl = process.env.GITHUB_RUN_ID
  ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
  : undefined;

/**
 * Runs `gh`, returning its output rather than throwing.
 *
 * @param {string[]} args
 * @param {string} [input] Standard input, for `--body-file -`.
 */
function gh(args, input) {
  const result = spawnSync("gh", args, { encoding: "utf8", input });
  if (result.error) throw result.error;
  return {
    ok: result.status === 0,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
}

/**
 * Runs a `gh` command that only reads, and returns its standard output.
 *
 * @param {string[]} args
 */
function ghRead(args) {
  const result = gh(args);
  if (!result.ok)
    throw new Error(`gh ${args.join(" ")} failed:\n${result.stderr}`);
  return result.stdout;
}

/**
 * Runs a `gh` command that writes, or prints it on a dry run. Throws when it
 * fails, unless `tolerate` matches its error.
 *
 * @param {string[]} args
 * @param {{ input?: string, tolerate?: RegExp }} [extra]
 * @returns {{ ok: boolean, stdout: string, stderr: string }}
 */
function ghWrite(args, { input, tolerate } = {}) {
  if (dryRun) {
    console.log(`Would run: gh ${args.join(" ")}`);
    if (input !== undefined) console.log(`with input:\n${input}\n`);
    return { ok: true, stdout: "", stderr: "" };
  }
  const result = gh(args, input);
  if (!result.ok && !tolerate?.test(result.stderr)) {
    throw new Error(`gh ${args.join(" ")} failed:\n${result.stderr}`);
  }
  return result;
}

const coreVersion = payload.versions["@gridkitjs/core"];
const title = `chore: release gridkit ${coreVersion}`;

const body = [
  "gridkit published a release. This brings its packages, and the docs written for them, to gridkitjs.com.",
  "",
  "| Package | Version |",
  "| --- | --- |",
  ...Object.entries(payload.versions).map(
    ([name, version]) =>
      `| \`${name}\` | [${version}](${GRIDKIT}/releases/tag/${encodeURIComponent(`${name}@${version}`)}) |`,
  ),
  "",
  `Docs: the \`docs-meta\` commit [\`${payload.manifestSha.slice(0, 7)}\`](${GRIDKIT}/commit/${payload.manifestSha}), pinned in \`gridkit.json\`. Released from gridkit [\`${payload.sha.slice(0, 7)}\`](${GRIDKIT}/commit/${payload.sha}).`,
  "",
  "It merges itself, with a merge commit, once CI passes. When a check fails it stays open and the release workflow comments what failed and how to fix it: the fix goes into `development`, which updates this pull request.",
  "",
  "Merge it only with a merge commit, never a squash, so `main` and `development` keep the same history.",
  "",
  "<details><summary>Payload, to re-run the Gridkit release workflow</summary>",
  "",
  "```json",
  JSON.stringify(payload),
  "```",
  "",
  "</details>",
].join("\n");

/** @type {import("./lib/release-pull-request.mjs").PullRequest | undefined} */
let pr = openReleasePullRequest();
if (pr) {
  ghWrite(
    ["pr", "edit", String(pr.number), "--title", title, "--body-file", "-"],
    {
      input: body,
    },
  );
  console.log(`Updated ${pr.url}`);
} else {
  const ahead = Number(
    ghRead([
      "api",
      `repos/{owner}/{repo}/compare/${BASE}...${HEAD}`,
      "--jq",
      ".ahead_by",
    ]),
  );
  if (ahead === 0) {
    await appendSummary(
      `### No release pull request\n\n\`${HEAD}\` has nothing \`${BASE}\` lacks: release ${coreVersion} is already in production.`,
    );
    process.exit(0);
  }
  const created = ghWrite(
    [
      "pr",
      "create",
      "--base",
      BASE,
      "--head",
      HEAD,
      "--title",
      title,
      "--body-file",
      "-",
    ],
    { input: body },
  );
  // `gh pr create` prints the new pull request's URL, ending in its number.
  const url = created.stdout.split("\n").at(-1) ?? "";
  pr = { number: Number(url.split("/").at(-1)), url };
  console.log(dryRun ? "Would open the pull request." : `Opened ${url}`);
}

const link = pr.url ? `[#${pr.number}](${pr.url})` : "The release pull request";

if (options.checks === "failed") {
  const failure = FAILURES[options["failed-check"]] ?? {
    failed: "A check failed.",
    fix: `Read the run's log for which one, and fix it ${ON_DEVELOPMENT}`,
  };
  const comment = [
    `**The release checks failed${runUrl ? ` ([run](${runUrl}))` : ""}.** ${failure.failed}`,
    "",
    `**What to do:** ${failure.fix}`,
    "",
    "Auto-merge stays off after a failure. Once CI passes, merge this with a merge commit, or re-run **Gridkit release** from the Actions tab with the payload in the description: it checks again and turns auto-merge on.",
  ].join("\n");
  ghWrite(["pr", "comment", String(pr.number), "--body-file", "-"], {
    input: comment,
  });
  await appendSummary(
    `### Release checks failed\n\n${link} stays open, with a comment on what failed (\`${options["failed-check"] || "unknown"}\`).`,
  );
  process.exit(0);
}

// Through GraphQL rather than `gh pr merge --auto`, which merges at once when
// nothing is pending: this never merges, it only queues the merge.
const prId =
  dryRun && !pr.url
    ? "<new pull request>"
    : ghRead(["pr", "view", String(pr.number), "--json", "id", "--jq", ".id"]);
const autoMerge = ghWrite(
  [
    "api",
    "graphql",
    "-f",
    "query=mutation($id: ID!) { enablePullRequestAutoMerge(input: { pullRequestId: $id, mergeMethod: MERGE }) { clientMutationId } }",
    "-f",
    `id=${prId}`,
  ],
  { tolerate: /auto.?merge is not allowed|clean status/i },
);
if (autoMerge.ok) {
  await appendSummary(
    `### Release pull request\n\n${link} merges itself, with a merge commit, once its required checks pass.`,
  );
} else if (/clean status/i.test(autoMerge.stderr)) {
  // GitHub refuses to queue a merge with nothing left to wait for: `main`'s
  // required checks have passed already, or it requires none. This run's
  // checks passed on the same commit, so it merges now.
  ghWrite(["pr", "merge", String(pr.number), "--merge"]);
  await appendSummary(
    `### Release pull request\n\n${link} merged, with a merge commit: \`${BASE}\` had no pending required check to wait for.`,
  );
} else {
  console.log(`::notice::${autoMerge.stderr}`);
  await appendSummary(
    `### Release pull request\n\n${link} is open, but auto-merge is off: the repository doesn't allow it (Settings → General → Allow auto-merge). Merge it with a merge commit once CI passes.`,
  );
}
