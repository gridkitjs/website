/**
 * Single source of truth for every routable page in the site (locale-less
 * paths). Feeds the docs sidebar, breadcrumbs, sitemap.ts, and BreadcrumbList
 * JSON-LD so none of those can drift out of sync with each other.
 */

export interface DocPageRoute {
  /** Path segment relative to `/docs`, e.g. "react/data-grid". */
  path: string;
  /** Key into the `docs` messages namespace for the nav label. */
  navLabelKey: string;
}

export interface DocSectionRoute {
  /** Path segment relative to `/docs`, e.g. "react". */
  path: string;
  /** Key into the `docs` messages namespace for the section heading. */
  navLabelKey: string;
  pages: DocPageRoute[];
}

export const docsNav: DocSectionRoute[] = [
  {
    path: "react",
    navLabelKey: "nav.react.section",
    pages: [
      { path: "react", navLabelKey: "nav.react.overview" },
      { path: "react/data-grid", navLabelKey: "nav.react.dataGrid" },
      {
        path: "react/column-templates",
        navLabelKey: "nav.react.columnTemplates",
      },
    ],
  },
  {
    path: "core",
    navLabelKey: "nav.core.section",
    pages: [
      { path: "core", navLabelKey: "nav.core.overview" },
      {
        path: "core/column-definitions",
        navLabelKey: "nav.core.columnDefinitions",
      },
      {
        path: "core/sizing-and-ordering",
        navLabelKey: "nav.core.sizingAndOrdering",
      },
    ],
  },
  {
    path: "theme-tailwind",
    navLabelKey: "nav.theme.section",
    pages: [{ path: "theme-tailwind", navLabelKey: "nav.theme.overview" }],
  },
];

/** Every docs page path, flattened, e.g. "react/data-grid". */
export const docsPagePaths: string[] = docsNav.flatMap((section) =>
  section.pages.map((page) => page.path),
);

/** Every locale-less site path, for app/sitemap.ts. */
export const siteRoutes: string[] = [
  "",
  "docs",
  ...docsPagePaths.map((path) => `docs/${path}`),
];

/** Finds the docs section + page entry for a given `/docs/...` path. */
export function findDocPage(
  path: string,
): { section: DocSectionRoute; page: DocPageRoute } | undefined {
  for (const section of docsNav) {
    const page = section.pages.find((candidate) => candidate.path === path);
    if (page) return { section, page };
  }
  return undefined;
}
