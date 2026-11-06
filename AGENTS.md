<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# GridKit website

Marketing site and docs reader for [GridKit](https://gridkitjs.com), a
headless data-grid toolkit. Next.js 16 App Router, React 19, Tailwind CSS 4,
`next-intl`. This repo has no docs content of its own — see
[Relationship to the `gridkit` repo](#relationship-to-the-gridkit-repo) below.

## Structure

| Path                                        | What belongs in it                                                                                                                                                                                                                                                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/[locale]/`                             | Routes: marketing home, `about` (the story behind GridKit, linked from the home page and the footer), `docs/[[...slug]]`, `changelog/[[...slug]]`, and `og/` (Open Graph images, see **Brand assets**). Locale-prefixed via `next-intl`. The layout's skip link targets `<main id="main">`. |
| `app/[locale]/docs/`                        | Docs layout; `error.tsx` retries a page that fails to fetch or compile, `loading.tsx` is its skeleton.                                                                                                                                                                                      |
| `app/api/revalidate-docs`                   | Webhook the `gridkit` repo calls after publishing a docs manifest, to bust the fetch cache.                                                                                                                                                                                                 |
| `app/api/search-index`                      | The docs search index as JSON (`lib/docs/search-index.ts`), prerendered and revalidated with the docs.                                                                                                                                                                                      |
| `components/live-examples/`                 | `DataGrid` demos, one `<area>/<Name>.example.tsx` each, and their fixtures; registered via `lib/docs/examples.ts` (see [components/live-examples/AGENTS.md](components/live-examples/AGENTS.md)).                                                                                           |
| `components/search/`                        | Docs search: `SearchDialog` (the Ctrl/Cmd+K palette, mounted once in the header), `SearchTrigger` (header and docs bar), `useSearchIndex` (MiniSearch over `/api/search-index`).                                                                                                            |
| `components/docs/`, `components/changelog/` | Docs/changelog page chrome: sidebar (`DocsSidebar`, `SidebarGroup`), mobile drawer (`DocsMobileNav`), table of contents (`OnThisPage`, current heading from `useActiveHeading`), `BackToTop`.                                                                                               |
| `components/marketing/`                     | Homepage sections: `Hero` (with `HeroGrid`, the live grid), `FeatureMatrix`, `HeadlessSection`, `PackagesSection`, `StorySection`, `CtaSection`. Not used inside docs (see **Home page**).                                                                                                  |
| `components/ui/`                            | Generic building blocks (Button, Badge, Kbd, Section, Prose, `cn`). No knowledge of docs/marketing content.                                                                                                                                                                                 |
| `components/code/`                          | `CodeBlock` (Shiki highlighting), `CodeFrame` (title bar, wrap toggle) and `CopyButton`, used by the MDX `pre` override.                                                                                                                                                                    |
| `lib/docs/`                                 | GitHub-fetch client (`github.ts`), manifest reader (`manifest.ts`), tree builder (`source.ts`, `nav.ts`), search index (`search-index.ts`), MDX renderer (`mdx.tsx`, `rehype-code-meta.ts`).                                                                                                |
| `lib/changelog/`                            | Same shape as `lib/docs/`, for `CHANGELOG.md` files instead of `docs/*.mdx`.                                                                                                                                                                                                                |
| `lib/packages/`                             | Package release info from the npm registry (`npm.ts`): latest version and release dates.                                                                                                                                                                                                    |
| `lib/marketing/`                            | Home page data: `features.ts`, the feature matrix (`FEATURE_GROUPS`).                                                                                                                                                                                                                       |
| `lib/seo/`                                  | Metadata (`metadata.ts`), the Open Graph renderer (`og-image.tsx`), site constants.                                                                                                                                                                                                         |
| `i18n/`                                     | `next-intl` routing/navigation config. `messages/en/` holds UI copy — **not** docs content.                                                                                                                                                                                                 |

## Relationship to the `gridkit` repo

This site has **no docs content checked in** and no docs build step. Docs are
authored as `.mdx` under `packages/*/docs/` in the sibling `gridkit` repo and
the changelog comes from that repo's per-package `CHANGELOG.md` files
(generated by Changesets); `gridkit` publishes both in one docs manifest.
Package versions and release dates come from the npm registry. This site only
fetches, renders, and caches them: how is in
[lib/docs/AGENTS.md](lib/docs/AGENTS.md).

## Development

```bash
npm install
npm run dev      # http://localhost:3000
```

Requires `.env` (copy from `.env.example`) for the GitHub-fetch config.
`GITHUB_TOKEN` is required for `npm run build` and on Vercel: the manifest
comes through the rate-limited GitHub API, and the per-file fallback makes
more requests than GitHub's unauthenticated limit (60 req/hr) allows; set it
for local dev too.

`npm run update-gridkit` moves all five `@gridkitjs/*` packages (`core`,
`dom`, `react`, `theme-tailwind`, `export-xlsx`) to their `latest` releases.
It is the only way they move: on `0.x` a caret range never crosses a minor,
so `npm update` leaves them where they are. Docs are fetched from `gridkit`'s
`main`, so a page can describe a feature the pinned packages lack until this
runs; add a new published package to the script when `gridkit` ships one.

## Styling and custom components

- **Tailwind CSS 4**, configured via `@theme inline` in `app/globals.css`.
  Site tokens (`--site-bg`, `--site-ink`, `--site-accent`, etc.) are CSS
  custom properties mapped to Tailwind color utilities (`bg-site-bg`,
  `text-site-ink`, `border-site-line`, …) — **use the token utilities, not
  raw Tailwind palette classes** (`bg-slate-50`), so a palette change is a
  one-line edit in `globals.css` rather than a repo-wide find/replace.
  The set: surfaces `bg`, `surface`, `surface-raised`; text `ink`,
  `ink-muted`, `ink-faint` (decorative only, below AA); lines `line`,
  `line-strong`; `accent`, `accent-hover`, `accent-soft` and `accent-ink`
  (text on an accent fill — never `text-white`); states `success`,
  `warning`, `danger`, `info`, each with a `-soft` background; code
  `code-bg`, `code-border`, `code-inline-bg`; `focus-ring`; and radii
  `rounded-site-sm`/`rounded-site` (4px/6px). Inverted surfaces — the
  footer — use the `-inverted` tokens (`bg-`, `surface-`, `ink-`,
  `ink-muted-`, `line-inverted`), which stay dark in both themes; reach for
  them instead of hand-picking a dark color.
- **Identity** is dense and rectilinear, like the grid it sells: every bordered
  container (card, panel, frame, lattice, button, control) uses `rounded-site`;
  small inline chips (badges, `<Kbd>`) use `rounded-site-sm`; never pills
  (`rounded-full`), `rounded-lg`+ or square corners. Groups of items are 1px
  hairline lattices in `line`/`line-strong` rather than gapped card grids,
  framed by a bordered wrapper with `rounded-site` and `overflow-hidden`: each
  cell draws its right and bottom edge and the inner grid takes `-mr-px -mb-px`,
  so the outermost cell borders sit under the frame's and none pokes through a
  corner; versions and counts are `font-mono tabular-nums`; a section label,
  when one earns its place, is a small uppercase header-cell style line, at most
  one per three sections. The home hero carries the one radial accent glow
  (`--site-accent` mixed into `--site-bg`, fading to transparent); nothing
  else uses gradients, radial backgrounds or gradient-clipped text.
- **Dark mode** is the `.dark` class on `<html>`. Every token above is
  redefined under `@variant dark` in `globals.css`, so a new token needs a
  dark value there too. An inline script in the locale layout's `<head>`
  (`ThemeScript`, built from `lib/theme.ts`) sets `.dark` or `.light` before
  first paint from `localStorage["gk-theme"]` (`light`, `dark` or `system`;
  missing means `system`), and `ThemeToggle` in the header writes that key.
  The `dark` custom variant falls back to `prefers-color-scheme` while
  neither class is set, so visitors without JavaScript still get dark. The
  grid stylesheet follows the same variant, so the site toggle themes every
  embedded grid; code blocks carry both Shiki themes and `globals.css` picks
  one. Only the toggle touches `<html>`: a live example that demonstrates a
  theme (`DarkModeExample`) pins its own wrapper with the grid's
  `.gridkit-light`/`.gridkit-dark` classes instead.
- **Sidebar state** is `sessionStorage["gk-docs-nav"]` for the docs and
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
- **Search** fetches `/api/search-index` only when a reader hovers or
  focuses a search trigger or opens the palette, then builds a MiniSearch
  index in the browser (`useSearchIndex`), once per visit. Ranking: fields
  boosted page > heading > terms > snippet, prefix and fuzzy (0.2) matching,
  every word required, and a page's own record ahead of its sections. A
  result links to its heading (`/docs/<slug>#<id>`). Ctrl/Cmd+K toggles the
  palette anywhere and `/` opens it outside a text field. The last five
  results opened are kept in `localStorage["gk-search-recent"]` and listed
  while the query is empty. The palette's strings live in
  `messages/en/search.json`.
- The grid itself is styled by `@gridkitjs/theme-tailwind`, imported once in
  `globals.css`. Never hand-style `DataGrid` internals with
  site-local utility classes — that's the same "utility classes obliging
  every consumer to scan our source" problem the `gridkit` repo's `AGENTS.md`
  calls out for its own `packages/react`; this site is a consumer of that
  package, not an owner of its markup.
- **`cn()`** (`components/ui/cn.ts`, `clsx` + `tailwind-merge`) is the only
  way to conditionally join class names. It resolves conflicting Tailwind
  utilities (e.g. a caller's `className` overriding a default) correctly;
  template-string concatenation does not.
- **Component shape**: small, typed prop interfaces, `cn()` for the root
  class, `...props` spread last so a caller can still override anything.
  See `components/ui/Button.tsx` and `components/ui/Kbd.tsx` as the
  reference shape for new `ui/` components.
- **New MDX-exposed components** (a new doc-content primitive like
  `<Kbd>`) are registered in exactly one place — `mdxComponents` in
  `lib/docs/mdx.tsx`. Adding the component file without registering it
  there means `.mdx` content using it 404s silently into literal text. Live
  examples are the exception: they reach `mdxComponents` through
  `...exampleTags`, generated from their files (see
  [components/live-examples/AGENTS.md](components/live-examples/AGENTS.md)).
  `npm run build` first runs `scripts/export-mdx-tags.mjs` (`prebuild`),
  which reads that object's capitalised keys, plus the example tags from
  `lib/docs/example-sources.generated.ts`, and writes
  `public/mdx-tags.json`, served at `/mdx-tags.json`. `gridkit`'s docs check
  fetches it from the deployed site and fails on any tag the docs use that
  isn't listed. It is a build output, so it is gitignored; run the script by
  hand to see it locally.
- **Doc-content primitives** (`components/docs/`) give authors what they
  used to fake with headings. next-mdx-remote runs with `blockJS: true`, so
  every prop is a string — a flag is `dev="true"`, never `dev={true}`:
  - `<Callout type="note|tip|warning|breaking" title="…">` — a boxed aside;
    children are the content. `type` defaults to `note` (so does an unknown
    one); without `title` the heading is the type's label, from
    `messages/en/docs.json` (`content.callout`) like other site chrome.
  - `<PackageInstall pkg="@gridkitjs/react @gridkitjs/theme-tailwind" dev="true" />`
    — the install command with npm/pnpm/yarn/bun tabs and a copy button.
    The choice is shared by every block and kept in
    `localStorage["gk-pm"]` (`usePackageManager`); `dev` is optional.
  - `<Since v="0.12.0" pkg="react" />` — an inline "since version" badge;
    `pkg` (the package without its scope) is optional.
  - `<LinkCards>` holding `<LinkCard href="/docs/…" title="…" description="…" />`
    — a two-column grid of link cards, e.g. a page's next steps.
    `description` is optional; `href` routes like a prose link.
- **Code fences** take meta after the language, forwarded to `Pre` by
  `lib/docs/rehype-code-meta.ts` and read by `parseFenceMeta` in `mdx.tsx`:
  `title="App.tsx"` (a title bar), `{1,3-5}` (highlight lines),
  `showLineNumbers`, and `wrap` (lines start wrapped). In the code itself,
  Shiki's notation comments `// [!code highlight]`, `// [!code ++]`,
  `// [!code --]` and `// [!code focus]` mark single lines; they are
  stripped from the output and from what the copy button copies, which
  also leaves out removed diff lines. `CodeFrame` adds a wrap toggle beside
  the copy button whenever a line overflows. The line styles live in
  `globals.css` under `.code-block`.
- **Internal links inside MDX** must go through `next-intl`'s `Link` (see
  `DocLink` in `components/docs/`, behind both the `A` override and
  `LinkCard`) so they carry the current locale prefix. In-page `#anchor`
  and relative links get a plain `<a>` in the same tab; only `http(s)://`
  links open a new tab.

## Home page

`app/[locale]/page.tsx` stacks the sections in `components/marketing/`.
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

## Brand assets and social images

- **The mark** is a four-by-four lattice with one blue cell, drawn twice:
  `GridKitMark` in `components/ui/icons.tsx` (the header logo, inline, and
  the Open Graph images) and `app/icon.svg` (the favicon). Keep the two in
  step. `app/favicon.ico` and `app/apple-icon.png` cover browsers and iOS
  home screens without SVG icons; `public/android-chrome-*.png` are the
  web manifest's. All of `app/`'s icons are linked by file convention,
  which Next skips once any `icons` key is set in metadata, so the layout
  sets none.
- **Open Graph images** are 1200×630 PNGs rendered by `renderOgImage` in
  `lib/seo/og-image.tsx` (`next/og`, Geist, the dark theme's colours, so a
  shared link looks the same whatever theme the reader uses): the mark, a
  section label, the page title and its URL. Every page names its image
  through `buildMetadata`'s `image` option, a locale-less route path:
  - `app/[locale]/opengraph-image.tsx`, the site image (the hero's
    headline), is the default.
  - `app/[locale]/og/docs/[[...slug]]/route.tsx` and
    `app/[locale]/og/changelog/[[...slug]]/route.tsx` render a docs or
    changelog page's title, at `/<locale>/og/docs/<slug>` and
    `/<locale>/og/changelog/<slug>`. They are route handlers because Next
    can't put an `opengraph-image.tsx` under an optional catch-all.
  - **Adding one for a new section**: copy a route handler under
    `app/[locale]/og/<section>/`, keep `dynamic = "force-static"`,
    `revalidate` and a `generateStaticParams` that lists every locale
    (route handlers don't inherit the layout's params; without it the
    route renders on demand), and pass `image: "og/<section>/<slug>"` from
    the page's `generateMetadata`. Labels live under `og` in
    `messages/<locale>/common.json`.
  - Set the image explicitly, as `buildMetadata` does: a page's own
    `openGraph` replaces its layout's, file-based image included.

## i18n

`next-intl`, routed by `[locale]`. UI copy (nav labels, footer, error
strings) lives in `messages/<locale>/`. Docs and changelog **content** is
not translated through this system — it is whatever `gridkit`'s `.mdx`/
`CHANGELOG.md` files contain, in whatever language they're written in.
Don't add docs strings to `messages/`; that's only for site chrome.

Keep the routes prerendered. `next-intl` finds the locale of a server render
from request headers unless the segment has called `setRequestLocale`, and
reading headers renders the whole route on demand: the build's route table
shows `ƒ` instead of `●`, and every visit shows the loading skeleton.
Layouts and pages render in parallel, so the call in one doesn't cover
another:

- Every `layout.tsx` and `page.tsx` under `app/[locale]/` takes `params`
  and calls `setRequestLocale(locale)` before it reads translations
  (`getTranslations`, `getFormatter`, …). Server components they render
  below that call are covered.
- `loading.tsx` files are `"use client"` and translate with
  `useTranslations`: a loading boundary gets no `params`, so it can't call
  `setRequestLocale`. Client hooks read the provider's messages and don't
  touch headers.

After a change under `app/[locale]/`, check the build output still marks
`/[locale]/docs/[[...slug]]` and `/[locale]/changelog/[[...slug]]` with `●`.

## Standards

CI-equivalent local check, in order:

```bash
npm run format:check && npm run lint && npx tsc --noEmit && npm run build
```

- **TypeScript** — `strict` (see `tsconfig.json`). Fix the type rather than
  reaching for `any` or a non-null assertion.
- **ESLint** — `eslint-config-next`'s core-web-vitals + typescript configs.
  Fix the code rather than adding disable comments.
- **Prettier** — double quotes, semicolons, 2-space indent, trailing commas,
  80 columns, `prettier-plugin-tailwindcss` (class names get reordered
  automatically — don't hand-order them, don't fight the formatter).
- Server-only modules (`lib/docs/github.ts`, `lib/docs/source.ts`) import
  `"server-only"` at the top. Keep that import when editing them, and add it
  to any new module that reads `GITHUB_TOKEN`/`DOCS_REVALIDATE_SECRET` or
  otherwise must never end up in a client bundle.

## Branches and commits

[Conventional Commits](https://www.conventionalcommits.org):
`type(optional-scope): subject`.

```
feat(docs): add prev/next navigation between doc pages
fix(mdx): register KbdGroup in the component map
docs: note the GITHUB_TOKEN rate-limit tradeoff
chore(deps): bump next to 16.3
```

- **Subject is one short imperative sentence**, lowercase, no trailing
  period, ideally under 72 characters. Needs "and"? It's probably two
  commits.
- Types: `feat`, `fix`, `docs`, `refactor`, `test`, `perf`, `build`, `ci`,
  `chore`, `revert`.
- Scope is optional and loose here (there's no package split to key off
  of) — use the area touched when it helps: `docs`, `mdx`, `changelog`,
  `seo`, `i18n`. Omit it for changes that cut across areas.
- Breaking changes (e.g. an env var rename, a route shape change) take a
  `!` before the colon plus a `BREAKING CHANGE:` footer.
- **Default to no body.** Add one only for a non-obvious _why_ — a
  workaround, a rejected alternative, a constraint from outside the diff.
  Don't restate the diff in prose.
- No changesets here — this app is `"private": true` and never published;
  `npm run build`/deploy is the only release process.

Branch names take the commit type as prefix, then a short kebab-case
subject: `feat/prev-next-nav`, `fix/kbd-registration`.
