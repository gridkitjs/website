# Metadata, social images and brand assets (`lib/seo/`)

Page metadata (`metadata.ts`, `buildMetadata`), the Open Graph renderer
(`og-image.tsx`) and site constants (`site-config.ts`). This file also
covers the brand mark, which is drawn outside this folder.

## The mark

The mark is a four-by-four lattice with one blue cell, drawn twice:
`GridKitMark` in `components/ui/icons.tsx` (the header logo, inline, and
the Open Graph images) and `app/icon.svg` (the favicon). Keep the two in
step. `app/favicon.ico` and `app/apple-icon.png` cover browsers and iOS
home screens without SVG icons; `public/android-chrome-*.png` are the
web manifest's. All of `app/`'s icons are linked by file convention,
which Next skips once any `icons` key is set in metadata, so the layout
sets none.

## Open Graph images

Open Graph images are 1200×630 PNGs rendered by `renderOgImage` in
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
