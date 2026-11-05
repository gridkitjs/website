/**
 * Writes `public/mdx-tags.json`: the JSX tags `.mdx` docs content may use,
 * read from the keys of `mdxComponents` in `lib/docs/mdx.tsx`. The gridkit
 * repo's docs check fetches it from the deployed site and fails on any tag
 * not in the list, which would otherwise render as literal text here.
 *
 * Only capitalised keys are listed: the lowercase ones (`pre`, `a`, …)
 * restyle plain markdown elements rather than add tags.
 *
 * Runs as `prebuild`. Usage: node scripts/export-mdx-tags.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import ts from "typescript";

const SOURCE = new URL("../lib/docs/mdx.tsx", import.meta.url);
const OUTPUT = new URL("../public/mdx-tags.json", import.meta.url);

function findComponentsObject(sourceFile) {
  let found;
  sourceFile.forEachChild(function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      node.name.getText(sourceFile) === "mdxComponents" &&
      node.initializer &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      found = node.initializer;
    }
    if (!found) node.forEachChild(visit);
  });
  return found;
}

const text = await readFile(SOURCE, "utf8");
const sourceFile = ts.createSourceFile("mdx.tsx", text, ts.ScriptTarget.Latest);
const components = findComponentsObject(sourceFile);
if (!components) {
  throw new Error("No `const mdxComponents = { ... }` in lib/docs/mdx.tsx");
}

const tags = components.properties
  .map((property) => property.name?.getText(sourceFile))
  .filter((name) => name && /^[A-Z]/.test(name))
  .sort();

await writeFile(OUTPUT, `${JSON.stringify(tags, null, 2)}\n`);
console.log(`Wrote public/mdx-tags.json (${tags.length} tags)`);
