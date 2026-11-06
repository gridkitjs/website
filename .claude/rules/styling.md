---
paths:
  - "components/**"
  - "app/**/*.tsx"
  - "app/globals.css"
---

# Styling and custom components

This rule applies to every component and page of the site, under
`components/` and `app/`, and to the stylesheet `app/globals.css`. How a live
example is built is in
[components/live-examples/AGENTS.md](../../components/live-examples/AGENTS.md),
and the MDX component map in [lib/docs/AGENTS.md](../../lib/docs/AGENTS.md).

## Tokens

**Tailwind CSS 4**, configured via `@theme inline` in `app/globals.css`.
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

## Identity

The site is dense and rectilinear, like the grid it sells: every bordered
container (card, panel, frame, lattice, button, control) uses `rounded-site`;
small inline chips (badges, `<Kbd>`) use `rounded-site-sm`; never pills
(`rounded-full`), `rounded-lg`+ or square corners. Groups of items are 1px
hairline lattices in `line`/`line-strong` rather than gapped card grids,
framed by a bordered wrapper with `rounded-site` and `overflow-hidden`: each
cell draws its right and bottom edge and the inner grid takes `-mr-px -mb-px`,
so the outermost cell borders sit under the frame's and none pokes through a
corner; versions and counts are `font-mono tabular-nums`; a section label,
when one earns its place, is a small uppercase header-cell style line, at most
one per three sections. Apart from the home hero's one radial accent glow
(see [components/marketing/AGENTS.md](../../components/marketing/AGENTS.md)),
nothing uses gradients, radial backgrounds or gradient-clipped text.

## Dark mode

Dark mode is the `.dark` class on `<html>`. Every token above is
redefined under `@variant dark` in `globals.css`, so a component built from
token utilities is correct in both themes without any `dark:` classes, and a
new token needs a dark value there too. An inline script in the locale layout's `<head>`
(`ThemeScript`, built from `lib/theme.ts`) sets `.dark` or `.light` before
first paint from `localStorage["gk-theme"]` (`light`, `dark` or `system`;
missing means `system`), and `ThemeToggle` in the header writes that key.
The `dark` custom variant falls back to `prefers-color-scheme` while
neither class is set, so visitors without JavaScript still get dark. The
grid stylesheet follows the same variant, so the site toggle themes every
embedded grid; code blocks carry both Shiki themes and `globals.css` picks
one. Only the toggle touches `<html>`.

## The grid

The grid itself is styled by `@gridkitjs/theme-tailwind`, imported once in
`globals.css`. Never hand-style `DataGrid` internals with
site-local utility classes — that's the same "utility classes obliging
every consumer to scan our source" problem the `gridkit` repo's `AGENTS.md`
calls out for its own `packages/react`; this site is a consumer of that
package, not an owner of its markup.

## Components

- **`cn()`** (`components/ui/cn.ts`, `clsx` + `tailwind-merge`) is the only
  way to conditionally join class names. It resolves conflicting Tailwind
  utilities (e.g. a caller's `className` overriding a default) correctly;
  template-string concatenation does not.
- **Component shape**: small, typed prop interfaces, `cn()` for the root
  class, `...props` spread last so a caller can still override anything.
  See `components/ui/Button.tsx` and `components/ui/Kbd.tsx` as the
  reference shape for new `ui/` components.
