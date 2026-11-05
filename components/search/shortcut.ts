"use client";

import { useSyncExternalStore } from "react";

/** The modifier the search shortcut takes: Cmd on Apple devices, Ctrl elsewhere. */
export type ShortcutModifier = "cmd" | "ctrl";

function isApplePlatform(): boolean {
  return /Mac|iPhone|iPad/.test(navigator.userAgent);
}

function subscribeToNothing() {
  return () => {};
}

/** The platform's modifier; the server renders Ctrl, the client corrects it after hydration. */
export function useShortcutModifier(): ShortcutModifier {
  return useSyncExternalStore(
    subscribeToNothing,
    () => (isApplePlatform() ? "cmd" : "ctrl"),
    () => "ctrl",
  );
}

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.closest("input, textarea, select") !== null)
  );
}

/** Ctrl+K or Cmd+K, which toggles search from anywhere, even a text field. */
export function isToggleShortcut(event: KeyboardEvent): boolean {
  return (
    (event.ctrlKey || event.metaKey) &&
    !event.altKey &&
    !event.shiftKey &&
    event.key.toLowerCase() === "k"
  );
}

/** `/`, which opens search unless the reader is typing somewhere. */
export function isOpenShortcut(event: KeyboardEvent): boolean {
  return (
    event.key === "/" &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !isTyping(event.target)
  );
}
