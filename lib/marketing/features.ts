/**
 * The home page's feature matrix: every shipped feature, grouped into its
 * columns, each linked to the doc page that covers it. Labels are copy, so
 * they live in `messages/<locale>/home.json` under `features.groups` and
 * `features.items`, keyed like the entries here.
 *
 * `npm run build` runs `scripts/check-feature-slugs.mjs` first, which fails
 * on a `slug` the docs tree doesn't have or a `key` without a label. This
 * file is read by that script too, so it must not import anything.
 */
export interface Feature {
  /** Its label's key under `features.items`. */
  key: string;
  /** The doc page, as in `/docs/<slug>`. */
  slug: string;
}

export interface FeatureGroup {
  /** Its heading's key under `features.groups`. */
  key: string;
  features: readonly Feature[];
}

export const FEATURE_GROUPS: readonly FeatureGroup[] = [
  {
    key: "columns",
    features: [
      { key: "definitions", slug: "react/column-definition" },
      { key: "templates", slug: "react/column-templates" },
      { key: "resizing", slug: "react/column-resizing" },
      { key: "reordering", slug: "react/column-reordering" },
      { key: "sorting", slug: "react/column-sorting" },
      { key: "chooser", slug: "react/column-chooser" },
    ],
  },
  {
    key: "rows",
    features: [
      { key: "grouping", slug: "react/row-grouping" },
      { key: "aggregates", slug: "react/aggregate-functions" },
      { key: "pagination", slug: "react/pagination" },
      { key: "virtualization", slug: "react/row-virtualization" },
      { key: "infiniteScroll", slug: "react/infinite-scroll" },
    ],
  },
  {
    key: "selection",
    features: [
      { key: "rowSelection", slug: "react/row-selection" },
      { key: "columnSelection", slug: "react/column-selection" },
      { key: "cellSelection", slug: "react/cell-selection" },
      { key: "keyboard", slug: "react/accessibility" },
      { key: "clipboard", slug: "react/clipboard" },
      { key: "contextMenu", slug: "react/context-menu" },
      { key: "commands", slug: "core/commands" },
    ],
  },
  {
    key: "data",
    features: [
      { key: "filtering", slug: "react/column-filtering" },
      { key: "filterMenu", slug: "react/column-filter-menu" },
      { key: "toolbar", slug: "react/toolbar" },
      { key: "export", slug: "react/export" },
      { key: "excel", slug: "export-xlsx" },
      { key: "printing", slug: "react/printing" },
    ],
  },
  {
    key: "integration",
    features: [
      { key: "state", slug: "react/state" },
      { key: "events", slug: "react/events" },
      { key: "imperativeApi", slug: "react/imperative-handle" },
      { key: "controller", slug: "core/controller" },
      { key: "viewPipeline", slug: "core/view" },
      { key: "localization", slug: "react/localization" },
      { key: "theming", slug: "theme-tailwind" },
      { key: "dom", slug: "dom" },
    ],
  },
];
