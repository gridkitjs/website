/**
 * Writes `lib/docs/example-sources.generated.ts` from every
 * `components/live-examples/<area>/<Name>.example.tsx`: the component, its
 * `meta`, the source the frame's Code tab shows, and what "Open in
 * StackBlitz" needs to rebuild it as a project (the local files it imports
 * and the published packages it uses, at this site's versions).
 *
 * The tag a doc page writes is `<Name />`, from the file name; the file must
 * export a component of that name. The shown source drops what only this site
 * needs: the `"use client"` directive, `meta` and its type import. Imports of
 * local files (`../fixtures`, `@/components/ui/cn`) become `./<file>`, the
 * way they sit side by side in the StackBlitz project.
 *
 * Runs as `predev` and `prebuild`; the output is committed, so `tsc` works
 * without running it. Usage: node scripts/gen-example-sources.mjs
 */
import { existsSync } from "node:fs";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as prettier from "prettier";
import ts from "typescript";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const EXAMPLES_DIR = path.join(ROOT, "components/live-examples");
const META_MODULE = path.join(EXAMPLES_DIR, "meta.ts");
const OUTPUT = path.join(ROOT, "lib/docs/example-sources.generated.ts");
const EXAMPLE_FILE = /^([A-Z][A-Za-z0-9]*)\.example\.tsx$/;
const META_KEYS = {
  id: "string",
  title: "string",
  description: "string",
  stackblitz: "string",
  minHeight: "number",
};
// Every project needs these whatever the example imports: React to mount it
// and the theme for the grid's stylesheet.
const PROJECT_PACKAGES = ["react", "react-dom", "@gridkitjs/theme-tailwind"];

const toPosix = (file) => file.split(path.sep).join("/");
const relative = (file) => toPosix(path.relative(ROOT, file));

function fail(file, message) {
  throw new Error(`${relative(file)}: ${message}`);
}

async function readSource(file) {
  const text = await readFile(file, "utf8");
  return text.replace(/\r\n/g, "\n");
}

function packageName(specifier) {
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

function isLocal(specifier) {
  return specifier.startsWith(".") || specifier.startsWith("@/");
}

/** The file a local import points at, with its extension. */
function resolveLocal(fromFile, specifier) {
  const base = specifier.startsWith("@/")
    ? path.join(ROOT, specifier.slice(2))
    : path.resolve(path.dirname(fromFile), specifier);
  const found = ["", ".ts", ".tsx"]
    .map((extension) => base + extension)
    .find((candidate) => existsSync(candidate) && path.extname(candidate));
  if (!found) fail(fromFile, `cannot resolve "${specifier}"`);
  return found;
}

function hasExportModifier(node) {
  return (
    ts.canHaveModifiers(node) &&
    (ts.getModifiers(node) ?? []).some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    )
  );
}

function exportedNames(statement) {
  if (!hasExportModifier(statement)) return [];
  if (ts.isFunctionDeclaration(statement) && statement.name) {
    return [statement.name.text];
  }
  if (ts.isVariableStatement(statement)) {
    return statement.declarationList.declarations
      .map((declaration) => declaration.name)
      .filter(ts.isIdentifier)
      .map((name) => name.text);
  }
  return [];
}

function literalValue(file, property) {
  const { initializer } = property;
  if (
    ts.isStringLiteral(initializer) ||
    ts.isNoSubstitutionTemplateLiteral(initializer)
  ) {
    return initializer.text;
  }
  if (ts.isNumericLiteral(initializer)) return Number(initializer.text);
  fail(file, `meta.${property.name.getText()} must be a literal`);
}

function readMeta(file, statement) {
  const [declaration] = statement.declarationList.declarations;
  const object = declaration.initializer;
  if (!object || !ts.isObjectLiteralExpression(object)) {
    fail(file, "`meta` must be an object literal");
  }
  const meta = {};
  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property) || !ts.isIdentifier(property.name)) {
      fail(file, "`meta` may only hold `key: literal` entries");
    }
    const key = property.name.text;
    const value = literalValue(file, property);
    if (!(key in META_KEYS)) fail(file, `unknown meta key "${key}"`);
    if (typeof value !== META_KEYS[key]) {
      fail(file, `meta.${key} must be a ${META_KEYS[key]}`);
    }
    meta[key] = value;
  }
  for (const key of ["id", "title", "description"]) {
    if (!(key in meta)) fail(file, `meta.${key} is required`);
  }
  return meta;
}

/**
 * Parses one module: the source as the reader sees it, its `meta` (examples
 * only), its exported names, and the local files and packages it imports.
 */
async function parseModule(file) {
  const text = await readSource(file);
  const sourceFile = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const edits = [];
  const localFiles = [];
  const packages = new Set();
  const exports = [];
  let meta;

  const remove = (statement) =>
    edits.push({ start: statement.getStart(), end: statement.end, text: "" });

  for (const statement of sourceFile.statements) {
    if (
      ts.isExpressionStatement(statement) &&
      ts.isStringLiteral(statement.expression) &&
      statement.expression.text === "use client"
    ) {
      remove(statement);
    } else if (ts.isImportDeclaration(statement)) {
      const specifier = statement.moduleSpecifier;
      const target = specifier.text;
      if (!isLocal(target)) {
        packages.add(packageName(target));
        continue;
      }
      const resolved = resolveLocal(file, target);
      if (resolved === META_MODULE) {
        remove(statement);
        continue;
      }
      localFiles.push(resolved);
      const flattened = `./${path.basename(resolved).replace(/\.tsx?$/, "")}`;
      edits.push({
        start: specifier.getStart() + 1,
        end: specifier.end - 1,
        text: flattened,
      });
    } else if (
      ts.isVariableStatement(statement) &&
      exportedNames(statement).includes("meta")
    ) {
      meta = readMeta(file, statement);
      remove(statement);
    } else {
      exports.push(...exportedNames(statement));
    }
  }

  let source = text;
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    source = source.slice(0, edit.start) + edit.text + source.slice(edit.end);
  }
  source = `${source.replace(/\n{3,}/g, "\n\n").trim()}\n`;

  return { source, meta, exports, localFiles, packages };
}

async function findExampleFiles() {
  const entries = await readdir(EXAMPLES_DIR, { recursive: true });
  return entries
    .map(toPosix)
    .filter((entry) => EXAMPLE_FILE.test(path.posix.basename(entry)))
    .sort()
    .map((entry) => path.join(EXAMPLES_DIR, entry));
}

async function readDependencyVersions() {
  const manifest = JSON.parse(
    await readFile(path.join(ROOT, "package.json"), "utf8"),
  );
  return { ...manifest.devDependencies, ...manifest.dependencies };
}

/**
 * Follows an example's local imports, and theirs, collecting every file the
 * project needs under its flattened name and every package any of them uses.
 */
async function collectProject(example, sharedSources, versions) {
  const packages = new Set([...PROJECT_PACKAGES, ...example.packages]);
  const localFiles = new Set();
  const queue = [...example.localFiles];
  while (queue.length > 0) {
    const file = queue.shift();
    const name = path.basename(file);
    if (localFiles.has(name)) continue;
    const shared = await parseModule(file);
    const existing = sharedSources.get(name);
    if (existing && existing.file !== file) {
      fail(file, `shares its file name with ${relative(existing.file)}`);
    }
    sharedSources.set(name, { file, source: shared.source });
    localFiles.add(name);
    queue.push(...shared.localFiles);
    shared.packages.forEach((pkg) => packages.add(pkg));
  }

  const dependencies = {};
  for (const name of [...packages].sort()) {
    if (!versions[name]) {
      fail(example.file, `imports "${name}", which package.json lacks`);
    }
    dependencies[name] = versions[name];
  }
  return { localFiles: [...localFiles].sort(), dependencies };
}

function templateLiteral(text) {
  return `\`${text.replace(/[\\`]/g, "\\$&").replace(/\$\{/g, "\\${")}\``;
}

function importPath(file) {
  return `@/${relative(file).replace(/\.tsx$/, "")}`;
}

async function main() {
  const versions = await readDependencyVersions();
  const sharedSources = new Map();
  const examples = [];
  const seenIds = new Map();

  for (const file of await findExampleFiles()) {
    const tag = EXAMPLE_FILE.exec(path.basename(file))[1];
    const parsed = await parseModule(file);
    if (!parsed.meta) fail(file, "exports no `meta`");
    if (!parsed.exports.includes(tag)) {
      fail(file, `exports no component named ${tag}`);
    }
    const { id } = parsed.meta;
    if (seenIds.has(id)) {
      fail(file, `meta.id "${id}" is also used by ${seenIds.get(id)}`);
    }
    seenIds.set(id, relative(file));
    const project = await collectProject(
      { ...parsed, file },
      sharedSources,
      versions,
    );
    examples.push({ tag, file, ...parsed, ...project });
  }

  const tags = new Set();
  for (const { tag, file } of examples) {
    if (tags.has(tag)) fail(file, `a second example is named ${tag}`);
    tags.add(tag);
  }

  const output = `// Generated by scripts/gen-example-sources.mjs from
// components/live-examples/**/*.example.tsx. Do not edit by hand.
import type { GeneratedExample } from "./examples";
${examples
  .map(({ tag, file }) => `import { ${tag} } from "${importPath(file)}";`)
  .join("\n")}

export const generatedExamples = {
${examples
  .map(
    (example) => `${example.tag}: {
    Component: ${example.tag},
    meta: ${JSON.stringify(example.meta)},
    fileName: "${example.tag}.tsx",
    source: ${templateLiteral(example.source)},
    localFiles: ${JSON.stringify(example.localFiles)},
    dependencies: ${JSON.stringify(example.dependencies)},
  },`,
  )
  .join("\n")}
} satisfies Record<string, GeneratedExample>;

/** Local files the examples import, by the flattened name they import them as. */
export const sharedSources: Readonly<Record<string, string>> = {
${[...sharedSources.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([name, { source }]) => `"${name}": ${templateLiteral(source)},`)
  .join("\n")}
};
`;

  const config = await prettier.resolveConfig(OUTPUT);
  const formatted = await prettier.format(output, {
    ...config,
    filepath: OUTPUT,
  });
  await writeFile(OUTPUT, formatted);
  console.log(
    `Wrote ${relative(OUTPUT)} (${examples.length} examples, ${sharedSources.size} shared files)`,
  );
}

await main();
