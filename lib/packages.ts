/**
 * Which packages the site pulls content for, and in what order they appear
 * in nav — a website concern shared by both docs and changelog, so it lives
 * in one place rather than drifting between two copies.
 */
export interface PackageInfo {
  slug: string;
  /** Docs nav title; defaults to the slug title-cased ("theme-tailwind" → "Theme Tailwind"). */
  title?: string;
}

export const PACKAGES: PackageInfo[] = [
  { slug: "react" },
  { slug: "core" },
  { slug: "dom" },
  { slug: "theme-tailwind" },
  { slug: "export-xlsx", title: "Export XLSX" },
];
