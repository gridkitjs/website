import { useEffect, useState } from "react";

/**
 * The band of the viewport a heading counts as current in: below the sticky
 * header, down to 30% of the height. The observer only says when a heading
 * crosses one of its edges; which one is current is then read off the page.
 */
const ROOT_MARGIN = "-80px 0px -70% 0px";
const BAND_BOTTOM = 0.3;

/**
 * The id of the heading the reader is in: the last of `ids` whose heading
 * has scrolled above the band's bottom edge, or `undefined` above the first.
 */
export function useActiveHeading(ids: readonly string[]) {
  const [activeId, setActiveId] = useState<string>();
  // A stable dependency: the server hands a new array on every render.
  const idList = ids.join(" ");

  useEffect(() => {
    const headings = idList
      .split(" ")
      .map((id) => document.getElementById(id))
      .filter((heading) => heading !== null);
    if (headings.length === 0) return;

    function update() {
      const bandBottom = window.innerHeight * BAND_BOTTOM;
      const passed = headings.filter(
        (heading) => heading.getBoundingClientRect().top <= bandBottom,
      );
      setActiveId(passed.at(-1)?.id);
    }

    const observer = new IntersectionObserver(update, {
      rootMargin: ROOT_MARGIN,
    });
    for (const heading of headings) observer.observe(heading);
    return () => {
      observer.disconnect();
    };
  }, [idList]);

  return activeId;
}
