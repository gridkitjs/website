/**
 * Writes `public/mdx-tags.json`: the JSX tags `.mdx` docs content may use,
 * read from the keys of `mdxComponents` in `lib/docs/mdx.tsx`. The gridkit
 * repo's docs check fetches it from the deployed site and fails on any tag
 * not in the list, which would otherwise render as literal text here.
 *
 * Only capitalised keys are listed: the lowercase ones (`pre`, `a`, …)
 * restyle plain markdown elements rather than add tags. The live examples
 * are spread in as `...exampleTags`; their tags are the keys of
 * `generatedExamples` in `lib/docs/example-sources.generated.ts`, which
 * `scripts/gen-example-sources.mjs` writes.
 *
 * Runs as `prebuild`. Usage: node scripts/export-mdx-tags.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import ts from "typescript";

const SOURCE = new URL("../lib/docs/mdx.tsx", import.meta.url);
const EXAMPLES = new URL(
  "../lib/docs/example-sources.generated.ts",
  import.meta.url,
);
const OUTPUT = new URL("../public/mdx-tags.json", import.meta.url);

/** The object literal `const <name> = { ... }` holds, `satisfies` or not. */
function findObject(sourceFile, name) {
  let found;
  sourceFile.forEachChild(function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      node.name.getText(sourceFile) === name &&
      node.initializer
    ) {
      const value = ts.isSatisfiesExpression(node.initializer)
        ? node.initializer.expression
        : node.initializer;
      if (ts.isObjectLiteralExpression(value)) found = value;
    }
    if (!found) node.forEachChild(visit);
  });
  return found;
}

async function keysOf(url, name) {
  const text = await readFile(url, "utf8");
  const sourceFile = ts.createSourceFile(
    url.pathname,
    text,
    ts.ScriptTarget.Latest,
  );
  const object = findObject(sourceFile, name);
  if (!object) {
    throw new Error(`No \`const ${name} = { ... }\` in ${url.pathname}`);
  }

  const keys = [];
  for (const property of object.properties) {
    if (!ts.isSpreadAssignment(property)) {
      keys.push(property.name.getText(sourceFile));
      continue;
    }
    const spread = property.expression.getText(sourceFile);
    if (spread !== "exampleTags") {
      throw new Error(`Cannot list the tags of \`...${spread}\``);
    }
    keys.push(...(await keysOf(EXAMPLES, "generatedExamples")));
  }
  return keys;
}

const tags = (await keysOf(SOURCE, "mdxComponents"))
  .filter((name) => /^[A-Z]/.test(name))
  .sort();

await writeFile(OUTPUT, `${JSON.stringify(tags, null, 2)}\n`);
console.log(`Wrote public/mdx-tags.json (${tags.length} tags)`);
