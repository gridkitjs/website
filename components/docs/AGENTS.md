# Docs and changelog chrome (`components/docs/`)

The sidebar, mobile drawer, table of contents and the doc-content
primitives of the docs and changelog pages. The primitives' MDX contract
(string props, registration in the component map) is in
[lib/docs/AGENTS.md](../../lib/docs/AGENTS.md), and the live example frame
(`LiveExampleFrame`, `ExampleTabs`) in
[components/live-examples/AGENTS.md](../live-examples/AGENTS.md).

## Sidebar state

Sidebar state is `sessionStorage["gk-docs-nav"]` for the docs and
`sessionStorage["gk-changelog-nav"]` for the changelog, beside
`gk-theme`: a JSON map of which sections and groups are open (`react`,
`react/columns`), kept by `useOpenNavGroups` (one store per storage key)
and shared by the inline docs sidebar and the mobile drawer. Both docs
sidebars render `lib/docs/nav.ts`'s cut of the docs tree, titles and
slugs only, so no page body reaches the client. The server renders only
the current page's section and group open; the stored set applies after
hydration. `SidebarSection` and `SidebarGroup` in `components/docs/` are
the disclosure pieces every sidebar, the changelog's included, is built
from.
