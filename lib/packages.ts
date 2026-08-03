/**
 * Which packages the site pulls content for, and in what order they appear
 * in nav — a website concern shared by both docs and changelog, so it lives
 * in one place rather than drifting between two copies.
 */
export interface PackageInfo {
  slug: string;
}

export const PACKAGES: PackageInfo[] = [
  { slug: "react" },
  { slug: "core" },
  { slug: "theme-tailwind" },
];
