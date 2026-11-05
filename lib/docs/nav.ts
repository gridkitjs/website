import type { DocSectionNode } from "./source";

/** A page as the sidebar needs it: no body, so none reaches the client. */
export interface DocsNavPage {
  slug: string;
  title: string;
}

export interface DocsNavGroup {
  /** Open-state key, the section slug and folder, e.g. "react/columns". */
  key: string;
  title: string;
  pages: DocsNavPage[];
}

export interface DocsNavSection {
  /** Also the section's open-state key, e.g. "react". */
  slug: string;
  title: string;
  pages: DocsNavPage[];
  groups: DocsNavGroup[];
}

function toNavPage({ slug, title }: DocsNavPage): DocsNavPage {
  return { slug, title };
}

/** The docs tree cut down to what the sidebar renders. */
export function toDocsNav(sections: DocSectionNode[]): DocsNavSection[] {
  return sections.map((section) => ({
    slug: section.slug,
    title: section.title,
    pages: section.pages.map(toNavPage),
    groups: section.groups.map((group) => ({
      key: `${section.slug}/${group.key}`,
      title: group.title,
      pages: group.pages.map(toNavPage),
    })),
  }));
}

/**
 * The open-state keys of the section and group holding the page at
 * `pathname` (locale-less, e.g. "/docs/react/column-sorting"); empty off
 * any doc page.
 */
export function activeNavKeys(
  sections: DocsNavSection[],
  pathname: string,
): string[] {
  const isCurrent = (page: DocsNavPage) => pathname === `/docs/${page.slug}`;
  for (const section of sections) {
    if (section.pages.some(isCurrent)) return [section.slug];
    const group = section.groups.find((candidate) =>
      candidate.pages.some(isCurrent),
    );
    if (group) return [section.slug, group.key];
  }
  return [];
}
