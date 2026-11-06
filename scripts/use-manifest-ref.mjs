/**
 * Points the rest of a CI job at the docs manifest on `<ref>` (usually
 * `docs-meta-next`, the next site's docs) by setting `DOCS_MANIFEST_REF` for
 * the later steps, but only once gridkit has published that ref. Until then
 * it warns and leaves the variable unset, so the build and its checks read
 * the docs-meta commit pinned in `gridkit.json`, as production does.
 *
 * In GitHub Actions the variable goes to `$GITHUB_ENV`; elsewhere the line is
 * printed. Reads `GITHUB_TOKEN` for the API's rate limit.
 *
 * Usage: node scripts/use-manifest-ref.mjs <ref>
 */
import { MANIFEST_REF, OWNER, REPO, refExists } from "./lib/docs-manifest.mjs";
import { writeActionsFile } from "./lib/github-actions.mjs";

const ref = process.argv[2] ?? "";
if (!MANIFEST_REF.test(ref)) {
  console.error(`Usage: node scripts/use-manifest-ref.mjs <ref>, got "${ref}"`);
  process.exit(1);
}

if (await refExists(ref)) {
  await writeActionsFile("GITHUB_ENV", { DOCS_MANIFEST_REF: ref });
  console.log(`The build reads the docs manifest at ${OWNER}/${REPO}@${ref}.`);
} else {
  const prefix = process.env.GITHUB_ACTIONS === "true" ? "::warning::" : "";
  console.log(
    `${prefix}${OWNER}/${REPO} has no ref ${ref} yet; the build reads the docs manifest pinned in gridkit.json.`,
  );
}
