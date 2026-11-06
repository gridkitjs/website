# Live examples (`components/live-examples/`)

**Live examples** mount a real `DataGrid` inside a frame with Preview and
Code tabs, Reset and "Open in StackBlitz". Keep one example per
interaction being demonstrated (sorting, resizing, selection, …) rather
than one large kitchen-sink grid; the doc page picks the example that
matches the section it's in.

How the grid is styled, and why its internals are never hand-styled, is in
the root
[Styling and custom components](../../AGENTS.md#styling-and-custom-components)
section.

## One file each

`components/live-examples/<area>/<Name>.example.tsx`, `<area>` one of
`grid`, `columns`, `rows`, `selection`, `data`. It starts with
`"use client"`, exports a component named `<Name>` (PascalCase, by
convention ending in `Example`), and exports `meta: ExampleMeta`
(`components/live-examples/meta.ts`): `id` (unique kebab-case), `title`,
`description` (one sentence on what to try), optional `minHeight` (px, the
example's rendered height, reserved until it mounts) and optional
`stackblitz` (an `examples/<path>` project in `gridkit` to open instead of
one built from the source). `meta` values must be literals: the generator
reads them from the source text. Data comes from `fixtures.ts`
(`deploymentRows`, five rows; `makeRows(n)`, any number of deterministic
rows; `mockLoadMore(page, size)`, a paged loader with a fixed delay); never
`Math.random` or `Date`, so server and client agree. Controls live inside
the example (`blockJS` allows no props).

## Generated sources

`scripts/gen-example-sources.mjs` (run by `predev` and `prebuild`) writes
`lib/docs/example-sources.generated.ts`, which is committed so `tsc` works
without it: per tag, the component, `meta`, the source the Code tab shows,
and the local files and package versions a StackBlitz project needs. The
shown source drops `"use client"`, `meta` and its import, and rewrites
local imports (`../fixtures`, `@/components/ui/cn`) to `./<file>`, as they
sit in the project. It fails on a missing `meta` field, a duplicate `id`, a
file without its named component, or a package `package.json` lacks. Rerun
it (or restart `npm run dev`) after editing an example, and commit the
result.

## Registry

`lib/docs/examples.ts` exposes the generated entries by tag, and `mdx.tsx`
turns each into an MDX tag that renders the example in its own
`LiveExampleFrame`, prerendered with the page. A doc page writes
`<Name />`, or `<Name title="…" />` to override `meta.title`. A bare
`<LiveExampleFrame title="…">` around a registered example passes its title
on rather than framing it twice; around anything else (such as
`<StackblitzExample>`) it is a plain frame.

## Frame

`LiveExampleFrame` (server) highlights the source with `CodeBlock` and
hands it to `ExampleTabs` (client), which owns the tabs (arrow keys, Home
and End), Reset (a `key` remount) and StackBlitz:
`components/live-examples/stackblitz.ts` builds a Vite project from the
source with `@stackblitz/sdk` `openProject`, or links to
`meta.stackblitz`. Its strings are `content.example` in
`messages/en/docs.json`. Both components live in `components/docs/`.

## Adding one

Write the file, run `node scripts/gen-example-sources.mjs`, commit both,
and use `<Name />` in a `gridkit` doc page (preview it with
`DOCS_MANIFEST_FILE`, see [lib/docs/AGENTS.md](../../lib/docs/AGENTS.md)).
Nothing else registers it.
