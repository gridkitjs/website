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
| [`lib/docs/`](lib/docs/AGENTS.md)                                        | GitHub-fetch client (`github.ts`), manifest reader (`manifest.ts`), tree builder (`source.ts`, `nav.ts`), search index (`search-index.ts`), MDX renderer (`mdx.tsx`, `rehype-code-meta.ts`, `remark-unregistered-tags.ts`).                                                                                       |
| `lib/changelog/`                                                         | Same shape as `lib/docs/`, for `CHANGELOG.md` files instead of `docs/*.mdx`; covered by `lib/docs/AGENTS.md`.                                                                                                                                                                                                     |
| `lib/packages/`                                                          | Package release info from the npm registry (`npm.ts`): latest version and release dates.                                                                                                                                                                                                                          |
| `lib/marketing/`                                                         | Home page data: `features.ts`, the feature matrix (`FEATURE_GROUPS`).                                                                                                                                                                                                                                             |
| [`lib/seo/`](lib/seo/AGENTS.md)                                          | Metadata (`metadata.ts`), the Open Graph renderer (`og-image.tsx`), site constants.                                                                                                                                                                                                                               |
| `gridkit.json`                                                           | `docsManifest`: the `gridkit` `docs-meta` commit whose docs manifest production renders. The release workflow updates it; see [lib/docs/AGENTS.md](lib/docs/AGENTS.md#the-manifest).                                                                                                                              |
| `i18n/`                                                                  | `next-intl` routing/navigation config. `messages/en/` holds UI copy — **not** docs content.                                                                                                                                                                                                                       |

## Relationship to the `gridkit` repo

This site has **no docs content checked in** and no docs build step. Docs are
authored as `.mdx` under `packages/*/docs/` in the sibling `gridkit` repo and
the changelog comes from that repo's per-package `CHANGELOG.md` files
(generated by Changesets); `gridkit` publishes both in one docs manifest.
Package versions and release dates come from the npm registry. This site only
fetches, renders, and caches them: how is in
[lib/docs/AGENTS.md](lib/docs/AGENTS.md).

Production reads the manifest at a `docs-meta` commit pinned in
`gridkit.json`, so gridkitjs.com's docs change only through a pull request,
the one that also takes a gridkit release's packages. The next site
(next.gridkitjs.com, from the `development` branch) reads a branch named by
`DOCS_MANIFEST_REF` instead.

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

The five `@gridkitjs/*` packages (`core`, `dom`, `react`, `theme-tailwind`,
`export-xlsx`) are never moved by hand. On `main` they change only through
the release pull request a bot opens when gridkit releases, which also
moves the docs pin in `gridkit.json`, so production's packages and docs
change together; on `development`, a bot installs gridkit's `dev`
snapshots (see [Channels](#channels)). On `0.x` a caret range never crosses
a minor, so `npm update` leaves them where they are. When `gridkit` ships a
new published package, add it to `package.json` by hand once: the release
payload names every package, and the release workflow refuses one it
doesn't depend on.

## Standards

CI-equivalent local check, in order:

```bash
npm run format:check && npm run lint && npx tsc --noEmit && npm run build
```

The `ci` job in `.github/workflows/ci.yml` runs this same sequence on every
pull request and every push to `main` and `development`; the `ci` check must
pass before a merge. The sequence and the build's guards live in the
`.github/actions/site-checks` composite action, which the snapshot and
release workflows run too. On `development`, and on pull requests into it,
the build reads the next site's docs (`DOCS_MANIFEST_REF=docs-meta-next`,
set by `scripts/use-manifest-ref.mjs`); until gridkit has published that
branch, it warns and reads the pin in `gridkit.json`. On pull requests into `main`,
before the build, `node scripts/check-release-deps.mjs` fails on a
prerelease `@gridkitjs/*` version in `package.json` or the lockfile. After
the build it also runs
three guards:

- `node scripts/check-prerendered-routes.mjs <build-log>` fails when the docs
  or changelog route is `ƒ` instead of `●` in the build's route table (see
  [app/[locale]/AGENTS.md](app/[locale]/AGENTS.md#keep-the-routes-prerendered)).
- `node scripts/check-manifest-tags.mjs` fails when a page of the docs
  manifest the build read uses a tag missing from `public/mdx-tags.json`
  (see [lib/docs/AGENTS.md](lib/docs/AGENTS.md#the-manifest)).
- `git diff --exit-code lib/docs/example-sources.generated.ts` fails when the
  committed file no longer matches what `prebuild` generates, so an example
  changed without its regenerated sources being committed.

Vercel still builds the previews and production on its own.

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

### Channels

| Branch        | Deploys to         | `@gridkitjs/*`    | Docs manifest                 | Takes                                                          |
| ------------- | ------------------ | ----------------- | ----------------------------- | -------------------------------------------------------------- |
| `main`        | gridkitjs.com      | Released versions | The pin in `gridkit.json`     | All site work, and gridkit's release PRs                       |
| `development` | next.gridkitjs.com | `dev` snapshots   | `docs-meta-next` (Vercel env) | Live examples that need unreleased APIs, and the bots' commits |

- **Branch off `main` and open the PR into `main`** for anything that works
  with the released packages: pages, components, fixes, and examples of
  released features. That is nearly everything.
- **Branch off `development` and open the PR into it** only for a live
  example that needs an API gridkit hasn't released yet. It ships to
  production with the release that brings the API.
- **Bots keep `development` current.** `sync-development.yml` merges `main`
  into it after every push to `main`, so it always contains `main`. When
  that merge conflicts, it opens (or comments on) a pull request
  `main` → `development` titled `chore: sync development with main`, whose
  body says how to resolve it on a branch; merge that fix with a merge
  commit, not a squash. `gridkit-snapshot.yml` installs the exact `dev`
  snapshot versions gridkit sends after each snapshot publish, runs the
  site checks and commits `chore(deps): use gridkit snapshot <sha>`. Both
  push as the release bot (a GitHub App), so CI and the Vercel deploy run.
- **Never merge `development` into `main` by hand**, and never push to it
  except through a pull request. It carries prerelease packages, which CI
  refuses on pull requests into `main`. It reaches `main` only through the
  release pull request below.
- To test the snapshot workflow, run it from the Actions tab with a
  payload of the event's shape, versions from
  `npm view @gridkitjs/<pkg> dist-tags` (the `dev` tag):
  `{"sha": "<40-character gridkit commit>", "versions": {"@gridkitjs/core": "0.0.0-dev-…", "@gridkitjs/dom": "…", "@gridkitjs/react": "…", "@gridkitjs/theme-tailwind": "…", "@gridkitjs/export-xlsx": "…"}, "manifestRef": "docs-meta-next"}`.
  It skips when those versions are already installed.
- next.gridkitjs.com is built with `SITE_CHANNEL=next`, which keeps it out
  of search engines and shows a preview banner (see
  [lib/seo/AGENTS.md](lib/seo/AGENTS.md#the-next-channel)).

#### How production moves

gridkitjs.com takes new `@gridkitjs/*` versions and new docs only through
a release pull request; site work still merges to `main` directly, as
above, and never waits for one.

1. gridkit publishes a release and its docs, then sends `gridkit-release`
   with every package's released version and the `docs-meta` commit
   holding their docs (`manifestSha`).
2. `gridkit-release.yml` ("Gridkit release") installs those versions on
   `development` as caret ranges, replacing the snapshots' exact pins,
   writes `manifestSha` into `gridkit.json`, and commits
   `chore(deps): ship gridkit <versions>` as the release bot.
3. It runs the site checks against the pin, as CI does on a pull request
   into `main`, then opens the pull request `development` → `main` titled
   `chore: release gridkit <core version>`, or updates the open one. Its
   description links each version's GitHub Release and the manifest
   commit, and holds the payload for a re-run.
4. With the checks green it turns on auto-merge, so the pull request merges
   itself with a **merge commit** once `ci` passes on it. Never squash it:
   `main` and `development` must keep the same history. Every example
   written on `development` ships with it.

**When a release pull request is red** it stays open, and the workflow
comments which check failed and what to do. Usually a doc page names a
live example this site lacks (`check-manifest-tags`), or an example
written against a snapshot no longer compiles against the release. Fix it
on a branch off `development` with a pull request into `development`;
merging that updates the release pull request and CI runs again.
Auto-merge stays off after a failure, so then merge it with a merge
commit, or re-run the workflow (below), which checks it again and turns
auto-merge on.

**To re-run a release**, after a fix, or for a closed release pull
request, run "Gridkit release" from the Actions tab with the payload from
the pull request's description:
`{"sha": "<40-character gridkit commit>", "versions": {"@gridkitjs/core": "0.15.0", …all five}, "manifestSha": "<40-character docs-meta commit>"}`.
Versions must be releases; it refuses a prerelease. What is already on
`development` it leaves alone, and with nothing on `development` that
`main` lacks it opens no pull request.

## Where the rest lives

Rules for one folder sit next to its code; rules that cut across folders are
in `.claude/rules/`. Claude Code loads each one by path; with another tool,
open the one the work touches. Skills in `.claude/skills/` are step-by-step
procedures for repeated tasks; with another tool, follow the `SKILL.md`.

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
| [.claude/skills/live-example/](.claude/skills/live-example/SKILL.md)     | Skill: add a live example, check it renders, hand over its tag                                        |
| [.claude/skills/preview-docs/](.claude/skills/preview-docs/SKILL.md)     | Skill: render unpublished `gridkit` docs from a local manifest                                        |
| [.claude/skills/verify/](.claude/skills/verify/SKILL.md)                 | Skill: run the local check sequence in order and read a failure                                       |
