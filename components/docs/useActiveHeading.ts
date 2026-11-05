import { useEffect, useState } from "react";

/**
 * How far down the viewport, as a fraction of its height, a heading has to
 * scroll before its section counts as the one being read.
 */
const READING_LINE = 0.3;

/**
 * The id of the heading the reader is in: the last of `ids` whose heading
 * has scrolled above the reading line, or `undefined` above the first. At
 * the bottom of the page it is the last heading on screen, since the
 * sections there may be too short to reach the line.
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

    // Read on scroll rather than through an IntersectionObserver: a jump
    // (End, a scrollbar drag, find in page) can carry a heading straight
    // past any band an observer watches without it ever intersecting.
    let frame = 0;

    function update() {
      frame = 0;
      const root = document.documentElement;
      const atBottom =
        window.innerHeight + window.scrollY >= root.scrollHeight - 1;
      const line = atBottom
        ? window.innerHeight
        : window.innerHeight * READING_LINE;
      const passed = headings.filter(
        (heading) => heading.getBoundingClientRect().top <= line,
      );
      setActiveId(passed.at(-1)?.id);
    }

    function scheduleUpdate() {
      if (frame === 0) frame = requestAnimationFrame(update);
    }

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [idList]);

  return activeId;
}
