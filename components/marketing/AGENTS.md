# Home page sections (`components/marketing/`)

`app/[locale]/page.tsx` stacks the sections in `components/marketing/`.
The look they share (the lattices, the tokens) is in
[.claude/rules/styling.md](../../.claude/rules/styling.md). The home hero
carries the site's one radial accent glow (`--site-accent` mixed into
`--site-bg`, fading to transparent).

Two of them need care:

- **`HeroGrid`** is a live `DataGrid` (200 rows from `makeRows`, grouped
  by region), prerendered with the page. Its wrapper pins the grid's whole
  height (`h-[432px]`) so nothing below it moves. The grid's
  `height` bounds only the rows area, so after changing it, the toolbar or
  the group-by bar, measure the mounted grid and update the wrapper.
- **`FeatureMatrix`** renders `FEATURE_GROUPS` from
  `lib/marketing/features.ts`: each feature is a `key`, its label under
  `features.items` in `messages/<locale>/home.json`, and the `slug` of
  its doc page. `prebuild` runs `scripts/check-feature-slugs.mjs`, which
  fails the build when a slug isn't a page of the docs tree (read as the
  site reads it: `DOCS_MANIFEST_FILE`, the manifest, or the repo tree) or a
  key has no label; run it by hand with
  `node scripts/check-feature-slugs.mjs`. A doc page gridkit renames or
  removes fails the next build here; a new feature page is added by hand.
