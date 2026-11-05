/**
 * Fails the build when the home page's feature matrix
 * (`lib/marketing/features.ts`) links to a doc page the docs tree doesn't
 * have, or names a group or feature with no label in a locale's
 * `messages/<locale>/home.json`. A doc renamed or removed in gridkit would
 * otherwise leave the matrix linking to a 404.
 *
 * The doc pages come from where the site reads them (see `lib/docs/`):
 * `DOCS_MANIFEST_FILE`, else the published `docs-manifest.json`, else the
 * repo tree of `DOCS_GITHUB_BRANCH`. Their slugs follow `lib/docs/source.ts`:
 * `packages/<pkg>/docs/[<group>/]<name>.mdx` is `<pkg>/<name>`, and a
 * package's top-level `overview.mdx` is `<pkg>`. `.env.local` and `.env` are
 * read for the same variables, as `next build` reads them.
 *
 * Runs as `prebuild`. Usage: node scripts/check-feature-slugs.mjs
 */
import { readdir, readFile } from "node:fs/promises";
import ts from "typescript";

for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(new URL(`../${file}`, import.meta.url));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

const OWNER = process.env.DOCS_GITHUB_OWNER ?? "gridkitjs";
const REPO = process.env.DOCS_GITHUB_REPO ?? "gridkitjs";
const BRANCH = process.env.DOCS_GITHUB_BRANCH ?? "main";
const MANIFEST_REF = process.env.DOCS_MANIFEST_REF ?? "docs-meta";
const MANIFEST_FILE = process.env.DOCS_MANIFEST_FILE;
const MESSAGES = new URL("../messages/", import.meta.url);

/** A TypeScript module without imports, transpiled and loaded as is. */
async function importTs(path) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const encoded = Buffer.from(outputText).toString("base64");
  return import(`data:text/javascript;base64,${encoded}`);
}

function githubApi(path, accept) {
  const headers = { Accept: accept };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return fetch(`https://api.github.com/repos/${OWNER}/${REPO}/${path}`, {
    headers,
  });
}

/** The repo path of every docs page, from the manifest or the repo tree. */
async function docsRepoPaths() {
  if (MANIFEST_FILE) {
    const manifest = JSON.parse(await readFile(MANIFEST_FILE, "utf8"));
    return manifest.docs.map((doc) => doc.repoPath);
  }
  const manifest = await githubApi(
    `contents/docs-manifest.json?ref=${encodeURIComponent(MANIFEST_REF)}`,
    "application/vnd.github.raw+json",
  );
  if (manifest.ok) {
    return (await manifest.json()).docs.map((doc) => doc.repoPath);
  }
  if (manifest.status !== 404) {
    throw new Error(`GitHub returned ${manifest.status} for the manifest`);
  }
  const tree = await githubApi(
    `git/trees/${BRANCH}?recursive=1`,
    "application/vnd.github+json",
  );
  if (!tree.ok) {
    throw new Error(`GitHub returned ${tree.status} for the repo tree`);
  }
  return (await tree.json()).tree
    .filter((entry) => entry.type === "blob" && entry.path.endsWith(".mdx"))
    .map((entry) => entry.path);
}

/** The page's slug as `lib/docs/source.ts` builds it, or `undefined` outside a listed package. */
function slugOf(repoPath, packageSlugs) {
  const match = /^packages\/([^/]+)\/docs\/(.+)\.mdx$/.exec(repoPath);
  if (!match || !packageSlugs.has(match[1])) return undefined;
  const [, pkg, relative] = match;
  const slash = relative.indexOf("/");
  if (slash === -1) return relative === "overview" ? pkg : `${pkg}/${relative}`;
  return `${pkg}/${relative.slice(slash + 1)}`;
}

const [{ FEATURE_GROUPS }, { PACKAGES }] = await Promise.all([
  importTs("../lib/marketing/features.ts"),
  importTs("../lib/packages.ts"),
]);
const packageSlugs = new Set(PACKAGES.map((pkg) => pkg.slug));
const docSlugs = new Set(
  (await docsRepoPaths())
    .map((path) => slugOf(path, packageSlugs))
    .filter((slug) => slug !== undefined),
);

const problems = [];
for (const group of FEATURE_GROUPS) {
  for (const feature of group.features) {
    if (!docSlugs.has(feature.slug)) {
      problems.push(
        `"${feature.key}" links to /docs/${feature.slug}, no such doc page`,
      );
    }
  }
}
for (const locale of await readdir(MESSAGES)) {
  const home = JSON.parse(
    await readFile(new URL(`${locale}/home.json`, MESSAGES), "utf8"),
  );
  for (const group of FEATURE_GROUPS) {
    if (!home.features?.groups?.[group.key]) {
      problems.push(`${locale}: no label for group "${group.key}"`);
    }
    for (const feature of group.features) {
      if (!home.features?.items?.[feature.key]) {
        problems.push(`${locale}: no label for feature "${feature.key}"`);
      }
    }
  }
}

if (problems.length > 0) {
  console.error(
    `Feature matrix (lib/marketing/features.ts):\n  ${problems.join("\n  ")}`,
  );
  process.exit(1);
}
const featureCount = FEATURE_GROUPS.flatMap((group) => group.features).length;
console.log(
  `Checked ${featureCount} feature links against ${docSlugs.size} doc pages`,
);
