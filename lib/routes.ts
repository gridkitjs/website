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

/**
 * A named cluster of pages within a section, for a member the grid addresses
 * three different ways — columns, rows, cells — rather than a flat list that
 * would otherwise repeat "Selection" three times with nothing to tell them
 * apart. Kept to this one extra level: a section holds pages or groups of
 * pages, never a group of groups.
 */
export interface DocGroupRoute {
  /** Key into the `docs` messages namespace for the group heading. */
  navLabelKey: string;
  pages: DocPageRoute[];
}

export interface DocSectionRoute {
  /** Path segment relative to `/docs`, e.g. "react". */
  path: string;
  /** Key into the `docs` messages namespace for the section heading. */
  navLabelKey: string;
  pages: DocPageRoute[];
  groups?: DocGroupRoute[];
}

export const docsNav: DocSectionRoute[] = [
  {
    path: "react",
    navLabelKey: "nav.react.section",
    pages: [
      { path: "react", navLabelKey: "nav.react.overview" },
      { path: "react/data-grid", navLabelKey: "nav.react.dataGrid" },
      { path: "react/events", navLabelKey: "nav.react.events" },
    ],
    groups: [
      {
        navLabelKey: "nav.react.groups.columns",
        pages: [
          {
            path: "react/column-templates",
            navLabelKey: "nav.react.columnTemplates",
          },
          {
            path: "react/column-resizing",
            navLabelKey: "nav.react.columnResizing",
          },
          {
            path: "react/column-reordering",
            navLabelKey: "nav.react.columnReordering",
          },
          {
            path: "react/column-selection",
            navLabelKey: "nav.react.columnSelection",
          },
        ],
      },
      {
        navLabelKey: "nav.react.groups.rows",
        pages: [
          {
            path: "react/row-selection",
            navLabelKey: "nav.react.rowSelection",
          },
        ],
      },
      {
        navLabelKey: "nav.react.groups.cells",
        pages: [
          {
            path: "react/cell-selection",
            navLabelKey: "nav.react.cellSelection",
          },
        ],
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
      { path: "core/resizing", navLabelKey: "nav.core.resizing" },
      { path: "core/ordering", navLabelKey: "nav.core.ordering" },
      { path: "core/selection", navLabelKey: "nav.core.selection" },
    ],
  },
  {
    path: "theme-tailwind",
    navLabelKey: "nav.theme.section",
    pages: [{ path: "theme-tailwind", navLabelKey: "nav.theme.overview" }],
  },
];

/** Every docs page path, flattened, e.g. "react/data-grid". */
export const docsPagePaths: string[] = docsNav.flatMap((section) => [
  ...section.pages.map((page) => page.path),
  ...(section.groups?.flatMap((group) =>
    group.pages.map((page) => page.path),
  ) ?? []),
]);

/** Every locale-less site path, for app/sitemap.ts. */
export const siteRoutes: string[] = [
  "",
  "docs",
  ...docsPagePaths.map((path) => `docs/${path}`),
];

/** Finds the docs section (+ group, if any) + page entry for a `/docs/...` path. */
export function findDocPage(path: string):
  | {
      section: DocSectionRoute;
      group?: DocGroupRoute;
      page: DocPageRoute;
    }
  | undefined {
  for (const section of docsNav) {
    const page = section.pages.find((candidate) => candidate.path === path);
    if (page) return { section, page };
    for (const group of section.groups ?? []) {
      const groupPage = group.pages.find(
        (candidate) => candidate.path === path,
      );
      if (groupPage) return { section, group, page: groupPage };
    }
  }
  return undefined;
}
