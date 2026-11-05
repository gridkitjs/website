/**
 * Scrolls `element`'s nearest scrolling ancestor, and only that, just far
 * enough to show it. `scrollIntoView` would scroll the page as well, moving
 * the article whenever the sidebar or drawer catches up with the current
 * page.
 */
export function revealInScrollParent(element: HTMLElement) {
  for (
    let parent = element.parentElement;
    parent && parent !== document.body;
    parent = parent.parentElement
  ) {
    const { overflowY } = getComputedStyle(parent);
    const scrolls =
      (overflowY === "auto" || overflowY === "scroll") &&
      parent.scrollHeight > parent.clientHeight;
    if (!scrolls) continue;

    const bounds = parent.getBoundingClientRect();
    const target = element.getBoundingClientRect();
    if (target.top < bounds.top) {
      parent.scrollTop -= bounds.top - target.top;
    } else if (target.bottom > bounds.bottom) {
      parent.scrollTop += target.bottom - bounds.bottom;
    }
    return;
  }
}
