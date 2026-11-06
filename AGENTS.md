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

A linked folder has rules of its own in its `AGENTS.md`.

| Path                                                                     | What belongs in it                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`app/[locale]/`](app/[locale]/AGENTS.md)                                | Routes: marketing home, `about` (the story behind GridKit, linked from the home page and the footer), `docs/[[...slug]]`, `changelog/[[...slug]]`, and `og/` (Open Graph images, see [lib/seo/AGENTS.md](lib/seo/AGENTS.md)). Locale-prefixed via `next-intl`. The layout's skip link targets `<main id="main">`. |
| `app/[locale]/docs/`                                                     | Docs layout; `error.tsx` retries a page that fails to fetch or compile, `loading.tsx` is its skeleton.                                                                                                                                                                                                            |
| `app/api/revalidate-docs`                                                | Webhook the `gridkit` repo calls after publishing a docs manifest, to bust the fetch cache.                                                                                                                                                                                                                       |
| `app/api/search-index`                                                   | The docs search index as JSON (`lib/docs/search-index.ts`), prerendered and revalidated with the docs.                                                                                                                                                                                                            |
| [`components/live-examples/`](components/live-examples/AGENTS.md)        | `DataGrid` demos, one `<area>/<Name>.example.tsx` each, and their fixtures; registered via `lib/docs/examples.ts`.                                                                                                                                                                                                |
| [`components/search/`](components/search/AGENTS.md)                      | Docs search: `SearchDialog` (the Ctrl/Cmd+K palette, mounted once in the header), `SearchTrigger` (header and docs bar), `useSearchIndex` (MiniSearch over `/api/search-index`).                                                                                                                                  |
| [`components/docs/`](components/docs/AGENTS.md), `components/changelog/` | Docs/changelog page chrome: sidebar (`DocsSidebar`, `SidebarGroup`), mobile drawer (`DocsMobileNav`), table of contents (`OnThisPage`, current heading from `useActiveHeading`), `BackToTop`.                                                                                                                     |
| [`components/marketing/`](components/marketing/AGENTS.md)                | Homepage sections: `Hero` (with `HeroGrid`, the live grid), `FeatureMatrix`, `HeadlessSection`, `PackagesSection`, `StorySection`, `CtaSection`. Not used inside docs.                                                                                                                                            |
| `components/ui/`                                                         | Generic building blocks (Button, Badge, Kbd, Section, Prose, `cn`). No knowledge of docs/marketing content.                                                                                                                                                                                                       |
| `components/code/`                                                       | `CodeBlock` (Shiki highlighting), `CodeFrame` (title bar, wrap toggle) and `CopyButton`, used by the MDX `pre` override.                                                                                                                                                                                          |
| [`lib/docs/`](lib/docs/AGENTS.md)                                        | GitHub-fetch client (`github.ts`), manifest reader (`manifest.ts`), tree builder (`source.ts`, `nav.ts`), search index (`search-index.ts`), MDX renderer (`mdx.tsx`, `rehype-code-meta.ts`).                                                                                                                      |
| `lib/changelog/`                                                         | Same shape as `lib/docs/`, for `CHANGELOG.md` files instead of `docs/*.mdx`; covered by `lib/docs/AGENTS.md`.                                                                                                                                                                                                     |
| `lib/packages/`                                                          | Package release info from the npm registry (`npm.ts`): latest version and release dates.                                                                                                                                                                                                                          |
| `lib/marketing/`                                                         | Home page data: `features.ts`, the feature matrix (`FEATURE_GROUPS`).                                                                                                                                                                                                                                             |
| [`lib/seo/`](lib/seo/AGENTS.md)                                          | Metadata (`metadata.ts`), the Open Graph renderer (`og-image.tsx`), site constants.                                                                                                                                                                                                                               |
| `i18n/`                                                                  | `next-intl` routing/navigation config. `messages/en/` holds UI copy — **not** docs content.                                                                                                                                                                                                                       |

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

### Comments

A comment describes the code as it is now, for a reader who never saw an
earlier version. The history of a change belongs in git and the PR, not in
the file.

- Comment only what the code can't say: a reason that isn't obvious, a
  workaround and what it works around, a constraint from outside the file.
  Don't restate what the next line does.
- Never narrate the change: "was x, now y", "changed to fix #12",
  "instead of the old approach", "new:", "updated to". If a comment only
  makes sense next to the diff, it belongs in the PR or nowhere.
- Code you delete takes its comments with it. Leave no "removed X" note and
  no commented-out code.
- Code you change: fix or delete the comments it makes wrong.

The test: would this comment still read correctly to someone opening the
file cold, a year from now?

## Branches and commits

[Conventional Commits](https://www.conventionalcommits.org):
`type(optional-scope): subject`, as in
`feat(docs): add prev/next navigation between doc pages`,
`fix(mdx): register KbdGroup in the component map`,
`docs: note the GITHUB_TOKEN rate-limit tradeoff` or
`chore(deps): bump next to 16.3`.

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

A PR description describes the end state and why it's needed, not how the
branch got there (what was tried, what was reverted, "addressed review
feedback").

## Where the rest lives

Rules for one folder sit next to its code; rules that cut across folders are
in `.claude/rules/`. Claude Code loads each one by path; with another tool,
open the one the work touches.

| File                                                                     | What it covers                                                                                        |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| [lib/docs/AGENTS.md](lib/docs/AGENTS.md)                                 | The docs pipeline: manifest, caching, versions, search index, MDX component map; `lib/changelog/` too |
| [components/docs/AGENTS.md](components/docs/AGENTS.md)                   | Docs and changelog chrome: sidebar state                                                              |
| [components/search/AGENTS.md](components/search/AGENTS.md)               | Docs search: loading the index, ranking, shortcuts                                                    |
| [components/live-examples/AGENTS.md](components/live-examples/AGENTS.md) | Live examples: the file contract, generated sources, registry, frame                                  |
| [components/marketing/AGENTS.md](components/marketing/AGENTS.md)         | Home page sections: the hero glow, `HeroGrid` height, `FeatureMatrix` slugs                           |
| [app/[locale]/AGENTS.md](app/[locale]/AGENTS.md)                         | Routes: keeping them prerendered (`setRequestLocale`, client `loading.tsx`)                           |
| [lib/seo/AGENTS.md](lib/seo/AGENTS.md)                                   | Metadata, Open Graph images, and the brand mark (`components/ui/icons.tsx`, `app/icon.svg`)           |
| [.claude/rules/styling.md](.claude/rules/styling.md)                     | Styling: tokens, identity, dark mode, the grid's theme, `cn()`, component shape                       |
| [.claude/rules/i18n.md](.claude/rules/i18n.md)                           | UI copy in `messages/`, and what stays untranslated                                                   |
| [CONTRIBUTING.md](CONTRIBUTING.md)                                       | Setup, the workflow and the PR checklist, on one screen                                               |
