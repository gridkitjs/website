import { useState, useSyncExternalStore } from "react";
import { themeFromHash, themeToHash } from "@/lib/theme-builder/hash";
import type { Token } from "@/lib/theme-builder/manifest";
import { defaultTheme, type Theme } from "@/lib/theme-builder/theme";

/**
 * How long the URL waits for the theme to stop changing. A slider changes
 * it on every frame, and browsers throttle history updates (Safari throws
 * past 100 in 10 seconds).
 */
const HASH_WRITE_DELAY_MS = 300;

/**
 * The builder's theme, kept in the URL hash so the address bar is always a
 * link to it. The server renders the defaults, as it can't see the hash,
 * and the theme in the hash applies once the page hydrates. A hash that
 * sets no token, such as the skip link's `#main`, leaves the theme alone.
 */
function createThemeStore(tokens: readonly Token[]) {
  const defaults = defaultTheme(tokens);
  const listeners = new Set<() => void>();
  let theme: Theme | undefined;
  let pendingWrite: ReturnType<typeof setTimeout> | undefined;

  function notify() {
    for (const listener of listeners) listener();
  }

  function readHash() {
    const fromHash = themeFromHash(window.location.hash, tokens);
    if (fromHash === undefined) return;
    theme = fromHash;
    notify();
  }

  function writeHash(written: Theme) {
    const url = new URL(window.location.href);
    url.hash = themeToHash(written, tokens);
    window.history.replaceState(null, "", url);
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (listeners.size === 1) {
        window.addEventListener("hashchange", readHash);
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          window.removeEventListener("hashchange", readHash);
          // Leaving the page: a late write would land on the next one's URL.
          clearTimeout(pendingWrite);
        }
      };
    },
    getSnapshot(): Theme {
      theme ??= themeFromHash(window.location.hash, tokens) ?? defaults;
      return theme;
    },
    getServerSnapshot(): Theme {
      return defaults;
    },
    setTheme(next: Theme) {
      theme = next;
      notify();
      clearTimeout(pendingWrite);
      pendingWrite = setTimeout(() => writeHash(next), HASH_WRITE_DELAY_MS);
    },
  };
}

/** The builder's theme and the function that replaces it. */
export function useTheme(tokens: readonly Token[]) {
  const [store] = useState(() => createThemeStore(tokens));
  const theme = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  return [theme, store.setTheme] as const;
}
