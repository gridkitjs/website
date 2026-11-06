---
name: live-example
description: Add or change a live example, a real DataGrid demo that gridkit's doc pages embed as an MDX tag. Use when a doc page needs an example that doesn't exist yet, or when asked to add, fix or rename a live example.
---

# Add a live example

The file contract (where it goes, what `meta` holds, which fixtures to use)
is in [components/live-examples/AGENTS.md](../../../components/live-examples/AGENTS.md),
and how the grid is styled in [.claude/rules/styling.md](../../rules/styling.md).
Read both first; this is the procedure.

## 1. Pick the base branch

First look in `components/live-examples/` for an example of the same
interaction (`ColumnChooserExample` is under `columns/`, for one). If it
exists, skip to step 6 and hand over its tag.

Then pick the branch by whether `main` already installs the API (see
[Channels](../../../AGENTS.md#channels)). Never move the `@gridkitjs/*`
versions by hand on either branch: bots install them.

- **In `main`'s installed packages**: branch off `main` and open the PR
  into `main`.
- **Anything newer**: branch off `development` and open the PR into
  `development`, which has gridkit's latest `dev` snapshot installed, or
  the release whose pull request into `main` is still open. If the API
  isn't on `development` yet either, wait for the next snapshot commit
  there. The example reaches gridkitjs.com with the release pull request
  that brings the API; when that pull request is red because a doc page
  names this example, landing the example on `development` is the fix.

## 2. Write the file

Pick the area (`grid`, `columns`, `rows`, `selection` or `data`) and a name
ending in `Example`. Start from the smallest existing example,
`components/live-examples/grid/DataGridBasicExample.example.tsx`, and copy
it to `components/live-examples/<area>/<Name>.example.tsx`:

- `"use client"` on the first line; the component exported as `<Name>`.
- `meta` with literal values only: a new kebab-case `id`, a `title`, and a
  one-sentence `description` saying what to try. Leave `minHeight` out until
  step 4.
- Rows from `../fixtures` (`deploymentRows`, `makeRows(n)` or
  `mockLoadMore`), never `Math.random` or `Date`. Any controls (buttons,
  toggles) live inside the component, which takes no props.

## 3. Regenerate sources and the tag list

```bash
node scripts/gen-example-sources.mjs
node scripts/export-mdx-tags.mjs
```

The first rewrites `lib/docs/example-sources.generated.ts`; it names the
file and the problem if `meta` is incomplete, an `id` is taken, or an
import isn't in `package.json`. The second writes `public/mdx-tags.json`
(gitignored); check the new tag is listed in it.

## 4. See it render

No route shows an example on its own: it renders inside a doc page. In your
local `gridkit` checkout, add `<Name />` on its own line to the page it
belongs on (don't commit it there yet), then follow the `preview-docs`
skill ([.claude/skills/preview-docs/SKILL.md](../preview-docs/SKILL.md))
and open that page. Check:

- It works in light and dark (the header's theme toggle), and Reset puts it
  back to its first state.
- The Code tab shows clean, paste-ready source, and "Open in StackBlitz"
  starts.
- The browser console has no hydration warning (usually a random or
  time-based value, or browser-only code running during render).
- Set `meta.minHeight` to the example's rendered height in px (measure the
  preview area in dev tools), rerun step 3, and reload: nothing should jump
  as it mounts.

## 5. Check and commit

Run the `verify` skill ([.claude/skills/verify/SKILL.md](../verify/SKILL.md)).
Commit the example and `lib/docs/example-sources.generated.ts` together,
for example `feat(examples): add a column pinning live example`. Nothing else
registers it.

## 6. Hand over the tag

Tell the doc author the exact tag, `<Name />`, and that it is usable in
`gridkit` only once this site is deployed: `gridkit`'s CI checks doc tags
against the deployed `/mdx-tags.json` of next.gridkitjs.com, which gets an
example merged into `development` directly and one merged into `main`
through the sync. Until then, the page there keeps a complete code sample.
