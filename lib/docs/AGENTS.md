# Docs pipeline (`lib/docs/`)

Fetches, renders and caches the docs that live in the sibling `gridkit` repo.
`lib/changelog/` has the same shape, for `CHANGELOG.md` files instead of
`docs/*.mdx`, and reads the same manifest, so this file covers it too. Why
there is no docs content here is summarised in the root
[Relationship to the `gridkit` repo](../../AGENTS.md#relationship-to-the-gridkit-repo)
section.

## The manifest

- `gridkit`'s `revalidate-docs` GitHub Action runs on every push to `main`
  touching `packages/*/docs/**`, `packages/*/CHANGELOG.md` or
  `packages/*/package.json`. It builds `docs-manifest.json` (every page's
  frontmatter and body, every `_meta.json`, every changelog, and each file's
  last commit date) and commits it to the orphan `docs-meta` branch.
- `lib/docs/manifest.ts` fetches that file in **one request**, through the
  GitHub contents API (`lib/docs/github.ts`) with the raw media type, from
  the ref in `DOCS_MANIFEST_REF` (default `docs-meta`; see `.env.example`).
  The API isn't behind a CDN, unlike raw.githubusercontent.com, so a refetch
  right after a push can't cache the previous revision. The fetch goes
  through Next's `fetch` cache, tagged `docs-content`, with a 1-hour
  time-based fallback; the docs tree, the changelog and the footer's "Docs
  synced" line all read it. `cacheComponents` is off, so this is the
  `fetch`-cache model, not `use cache`.
- While no manifest is published (a 404), `lib/docs/source.ts` and
  `lib/changelog/source.ts` fall back, with a logged warning, to the old
  per-file path: the repo tree for `DOCS_GITHUB_BRANCH`, then each file from
  raw.githubusercontent.com, ~57 requests per render and no last-updated
  dates. The fallback is temporary; remove it once the manifest has been
  live for a while.
- `app/api/revalidate-docs` is the on-demand hook: after publishing the
  manifest, the Action POSTs `{ ref, sha, manifestSha, ts }` here,
  HMAC-SHA256-signed in `X-Hub-Signature-256` with `DOCS_REVALIDATE_SECRET`
  (which must match on both sides). A request whose `ts` (Unix seconds) is
  more than five minutes from the server's clock gets a 401, so a captured
  request can't be replayed; the Action's retries resend the same `ts`, so
  they must land inside that window too. A valid one calls
  `revalidateTag("docs-content", { expire: 0 })`, so a doc or changelog
  edit goes live without redeploying this site.
- To preview gridkit docs before pushing them, build a manifest locally
  (`node scripts/build-docs-manifest.mjs <path>` in `gridkit`) and point
  `DOCS_MANIFEST_FILE` at it; this site then reads that file instead of
  GitHub. Local only, never on Vercel.

## Versions and dates

- Package versions and release dates come from the npm registry, not the
  manifest: `lib/packages/npm.ts` fetches
  `registry.npmjs.org/@gridkitjs/<pkg>` for each package (5 requests, no
  auth), tagged `pkg-freshness` with a 1-hour fallback, for the changelog
  pages, the changelog index and the docs sidebar. A registry failure is
  logged and the page renders without the version rather than failing.
- Per-page "Last updated", JSON-LD `dateModified` and sitemap
  `lastModified` all come from the manifest's per-file commit dates; nothing
  calls GitHub's commits API.

## The docs tree and search index

- `lib/docs/source.ts` turns the manifest into a `DocsTree`: one
  section per package, ordered by that package's `docs/_meta.json`
  (`order` array), with subfolders becoming groups. A package's
  `docs/overview.mdx` becomes the section root (`/docs/react`, not
  `/docs/react/overview`), and its title is composed here as
  `"<Section title> overview"` ("React overview") whatever its frontmatter
  says, since every package titles that file "Overview".
- The docs search index, `/api/search-index`, derives from `getDocsTree()`
  in `lib/docs/search-index.ts`, so it shares the `docs-content` tag and
  the webhook refreshes it with the pages; between webhooks it regenerates
  hourly like them (`revalidate = 3600`, which Next sends to the CDN as
  `s-maxage`). It holds a record per page and per h2/h3 section: titles, a
  200-character snippet of prose (code fences left out, JSX tags reduced to
  their text) and `terms`, the identifiers from inline code and first table
  columns. No page body ships.

**A doc page never gets bundled here.** If a page is missing or stale, the
fix is in `gridkit`'s `packages/*/docs/`, or in the cache config here — never
by adding local `.mdx` files to this repo.

## The MDX component map

Because content lives elsewhere, doc pages can reference components and
copy the two repos share by convention rather than by import — e.g.
`<Kbd>` (see below) is written directly into `.mdx` in `gridkit` and must
stay registered in this repo's MDX component map (`lib/docs/mdx.tsx`) for
it to render. Renaming or removing a component from that map is a breaking
change for every doc page that uses it; grep `gridkit`'s `packages/*/docs/`
before doing either.

### New MDX-exposed components

A new doc-content primitive like `<Kbd>` is registered in exactly one
place — `mdxComponents` in `lib/docs/mdx.tsx`. Adding the component file
without registering it there means `.mdx` content using it 404s silently
into literal text. Live examples are the exception: they reach
`mdxComponents` through `...exampleTags`, generated from their files (see
[components/live-examples/AGENTS.md](../../components/live-examples/AGENTS.md)).

`npm run build` first runs `scripts/export-mdx-tags.mjs` (`prebuild`),
which reads that object's capitalised keys, plus the example tags from
`lib/docs/example-sources.generated.ts`, and writes
`public/mdx-tags.json`, served at `/mdx-tags.json`. `gridkit`'s docs check
fetches it from the deployed site and fails on any tag the docs use that
isn't listed. It is a build output, so it is gitignored; run the script by
hand to see it locally.

### Doc-content primitives

The primitives in `components/docs/` give authors what they used to fake
with headings. next-mdx-remote runs with `blockJS: true`, so every prop is
a string — a flag is `dev="true"`, never `dev={true}`:

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

### Code fences

Code fences take meta after the language, forwarded to `Pre` by
`lib/docs/rehype-code-meta.ts` and read by `parseFenceMeta` in `mdx.tsx`:
`title="App.tsx"` (a title bar), `{1,3-5}` (highlight lines),
`showLineNumbers`, and `wrap` (lines start wrapped). In the code itself,
Shiki's notation comments `// [!code highlight]`, `// [!code ++]`,
`// [!code --]` and `// [!code focus]` mark single lines; they are
stripped from the output and from what the copy button copies, which
also leaves out removed diff lines. `CodeFrame` adds a wrap toggle beside
the copy button whenever a line overflows. The line styles live in
`globals.css` under `.code-block`.

### Internal links inside MDX

Internal links inside MDX must go through `next-intl`'s `Link` (see
`DocLink` in `components/docs/`, behind both the `A` override and
`LinkCard`) so they carry the current locale prefix. In-page `#anchor`
and relative links get a plain `<a>` in the same tab; only `http(s)://`
links open a new tab.

### `<Kbd>` convention

Reference actual key presses with `<Kbd>` — `<Kbd>Ctrl</Kbd>+<Kbd>A</Kbd>`,
not backtick text like `` `Ctrl+A` ``. It's globally available in rendered
docs via the MDX component map (`components/ui/Kbd.tsx`), so `.mdx` content
needs no import. Reserve it for keys, not mouse actions worded with "click"
or "drag".

## Server-only modules

The `"server-only"` import rule, which covers `github.ts` and `source.ts`,
is in the root [Standards](../../AGENTS.md#standards) section.
