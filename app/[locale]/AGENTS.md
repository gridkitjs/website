# Routes (`app/[locale]/`)

Every page of the site, locale-prefixed through `next-intl`. The routes are
listed in the root [Structure](../../AGENTS.md#structure) table. The home
page's sections are covered in
[components/marketing/AGENTS.md](../../components/marketing/AGENTS.md), the
Open Graph images under `og/` and `opengraph-image.tsx` in
[lib/seo/AGENTS.md](../../lib/seo/AGENTS.md), and UI copy in
[.claude/rules/i18n.md](../../.claude/rules/i18n.md).

## Keep the routes prerendered

`next-intl` finds the locale of a server render from request headers unless
the segment has called `setRequestLocale`, and reading headers renders the
whole route on demand: the build's route table shows `ƒ` instead of `●`,
and every visit shows the loading skeleton. Layouts and pages render in
parallel, so the call in one doesn't cover another:

- Every `layout.tsx` and `page.tsx` under `app/[locale]/` takes `params`
  and calls `setRequestLocale(locale)` before it reads translations
  (`getTranslations`, `getFormatter`, …). Server components they render
  below that call are covered.
  `app/[locale]/docs/layout.tsx` is the shape to copy: `params` typed as a
  `Promise<{ locale: string }>`, awaited, then `setRequestLocale(locale)`.
  Reading `cookies()`, `headers()` or a page's `searchParams` also opts a
  route out of prerendering.
- `loading.tsx` files are `"use client"` and translate with
  `useTranslations`: a loading boundary gets no `params`, so it can't call
  `setRequestLocale`. Client hooks read the provider's messages and don't
  touch headers.

After a change under `app/[locale]/`, check the build output still marks
`/[locale]/docs/[[...slug]]` and `/[locale]/changelog/[[...slug]]` with `●`:

```bash
npm run build
```
