/**
 * Which packages the site pulls content for, and in what order they appear
 * in nav — a website concern shared by both docs and changelog, so it lives
 * in one place rather than drifting between two copies.
 */
export interface PackageInfo {
  slug: string;
  /** Docs nav title; defaults to the slug title-cased ("theme-tailwind" → "Theme Tailwind"). */
  title?: string;
  /**
   * The meta description of the package's docs overview (`/docs/<slug>`),
   * written for search results. The overview's own frontmatter description
   * still shows on the page.
   */
  description: string;
}

export const PACKAGES: PackageInfo[] = [
  {
    slug: "react",
    description:
      "The GridKit DataGrid for React: render your rows, then turn on sorting, filtering, grouping, selection and export with props.",
  },
  {
    slug: "core",
    description:
      "GridKit's framework-agnostic grid logic in plain TypeScript: columns, sorting, filtering, grouping, paging, selection and a headless controller.",
  },
  {
    slug: "dom",
    title: "DOM",
    description:
      "Browser behaviours shared by GridKit renderers: pointer gestures, focus, observers, virtualization, overlays, the clipboard and printing.",
  },
  {
    slug: "theme-tailwind",
    description:
      "GridKit's Tailwind CSS stylesheet: palette tokens, dark mode and the styles for every part of the data grid.",
  },
  {
    slug: "theme-css",
    title: "Theme CSS",
    description:
      "GridKit's plain CSS stylesheet for apps without Tailwind: palette tokens, dark mode and the styles for every part of the data grid.",
  },
  {
    slug: "export-xlsx",
    title: "Export XLSX",
    description:
      "Export a GridKit grid to Excel: typed numbers and dates, column formats and widths, a frozen header and grouped outlines.",
  },
];
