# Docs search (`components/search/`)

The Ctrl/Cmd+K palette and its triggers. The index it searches,
`/api/search-index`, is built in `lib/docs/search-index.ts`; what goes into
it is in [lib/docs/AGENTS.md](../../lib/docs/AGENTS.md).

## Loading and ranking

Search fetches `/api/search-index` only when a reader hovers or
focuses a search trigger or opens the palette, then builds a MiniSearch
index in the browser (`useSearchIndex`), once per visit. Ranking: fields
boosted page > heading > terms > snippet, prefix and fuzzy (0.2) matching,
every word required, and a page's own record ahead of its sections. A
result links to its heading (`/docs/<slug>#<id>`). Ctrl/Cmd+K toggles the
palette anywhere and `/` opens it outside a text field. The last five
results opened are kept in `localStorage["gk-search-recent"]` and listed
while the query is empty. The palette's strings live in
`messages/en/search.json`.
