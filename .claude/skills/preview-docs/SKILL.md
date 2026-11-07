---
name: preview-docs
description: Preview gridkit doc pages that aren't pushed yet, by rendering this site from a docs manifest built in a local gridkit checkout. Use when asked to preview, check or see unpublished docs, or a new live example on its page.
---

# Preview unpublished docs

The site normally reads `docs-manifest.json` at the `docs-meta` commit
pinned in `gridkit.json` (or at `DOCS_MANIFEST_REF`, when set). Setting
`DOCS_MANIFEST_FILE` makes it read a file on disk instead.
How the manifest works is in [lib/docs/AGENTS.md](../../../lib/docs/AGENTS.md#the-manifest).
Local only: never set it on Vercel.

## 1. Build a manifest in gridkit

In the `gridkit` checkout, with its dependencies installed (`pnpm install`;
the script needs `yaml` and fails with `ERR_MODULE_NOT_FOUND` without it),
write the manifest to a path outside both repos. Use an absolute path: the
site resolves a relative one against its own folder.

```bash
cd ../gridkit
pnpm install
node scripts/build-docs-manifest.mjs /tmp/docs-manifest.json --inline-bodies
```

It prints the packages, pages and `_meta.json` files it found. Uncommitted
edits are included; last-updated dates come from git, so they lag behind.
`--inline-bodies` puts every page and changelog in the file; without it the
site fetches each one from GitHub by blob SHA, and an unpushed edit isn't
there.

## 2. Run the site against it

Set the variable for this one command rather than in `.env`, so it can't be
left behind:

```bash
DOCS_MANIFEST_FILE=/tmp/docs-manifest.json npm run dev
```

On Windows, give both commands the same full Windows path
(`C:/temp/docs-manifest.json`) rather than `/tmp`. In PowerShell, set it
with `$env:DOCS_MANIFEST_FILE = "C:/temp/docs-manifest.json"` before
`npm run dev`, and clear it afterwards with
`Remove-Item Env:DOCS_MANIFEST_FILE`.

Open the page at `http://localhost:3000/en/docs/<pkg>/<page>`. A page in a
topic subfolder drops the folder from its URL
(`packages/react/docs/columns/column-sorting.mdx` is
`/en/docs/react/column-sorting`); when unsure, click through the sidebar. A
wrong URL renders the "not found" page, with a 200 status in dev.

## 3. Iterate

After editing a page in `gridkit`, rerun step 1 and reload. The file is read
on each render, so the dev server doesn't need a restart.

## 4. Clean up

Stop the server with Ctrl+C. `npm run dev` regenerates
`lib/docs/example-sources.generated.ts`; if `git status` shows it changed
and you didn't add an example, restore it with
`git checkout -- lib/docs/example-sources.generated.ts`. Delete the
manifest file.

## Checking the production build

`DOCS_MANIFEST_FILE=/tmp/docs-manifest.json npm run build` builds against
the same file. In its route table, `/[locale]/docs/[[...slug]]` and
`/[locale]/changelog/[[...slug]]` must stay marked `●` (prerendered); `ƒ`
means a route reads request headers, see
[app/[locale]/AGENTS.md](../../../app/[locale]/AGENTS.md#keep-the-routes-prerendered).
