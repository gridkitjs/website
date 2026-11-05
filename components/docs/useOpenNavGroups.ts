import { useEffect, useSyncExternalStore } from "react";

/** The `sessionStorage` key holding which docs sidebar sections and groups are open. */
export const DOCS_NAV_STORAGE_KEY = "gk-docs-nav";

type OpenGroups = Readonly<Record<string, boolean>>;

const NONE: OpenGroups = {};

interface OpenGroupsStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => OpenGroups;
  set: (changes: OpenGroups) => void;
}

// One store per storage key for every sidebar on the page, so the inline
// sidebar and the drawer agree. Held here once read, so a blocked
// `sessionStorage` still lets groups toggle for the rest of the visit.
const stores = new Map<string, OpenGroupsStore>();

function readStored(storageKey: string): OpenGroups {
  try {
    const parsed: unknown = JSON.parse(
      sessionStorage.getItem(storageKey) ?? "{}",
    );
    if (typeof parsed !== "object" || parsed === null) return NONE;
    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, boolean] => typeof entry[1] === "boolean",
      ),
    );
  } catch {
    return NONE;
  }
}

function createStore(storageKey: string): OpenGroupsStore {
  let openGroups: OpenGroups | undefined;
  const listeners = new Set<() => void>();

  function getSnapshot(): OpenGroups {
    openGroups ??= readStored(storageKey);
    return openGroups;
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot,
    set(changes) {
      const current = getSnapshot();
      if (
        Object.entries(changes).every(([key, open]) => current[key] === open)
      ) {
        return;
      }
      openGroups = { ...current, ...changes };
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(openGroups));
      } catch {
        // Not persisted, but still applied for this visit.
      }
      for (const listener of listeners) listener();
    },
  };
}

function storeFor(storageKey: string): OpenGroupsStore {
  let store = stores.get(storageKey);
  if (!store) {
    store = createStore(storageKey);
    stores.set(storageKey, store);
  }
  return store;
}

// The server can't read the stored set; it renders only the active keys
// open, which the client's first render matches.
function getServerSnapshot(): OpenGroups {
  return NONE;
}

function isClient(): boolean {
  return true;
}

function isServer(): boolean {
  return false;
}

/**
 * Which sidebar sections and groups are open, by key ("react",
 * "react/columns"), kept in `sessionStorage[storageKey]`. The `activeKeys`,
 * those holding the current page, open on every navigation into them;
 * whatever else the reader opens or closes stays that way for the session.
 *
 * `restored` turns true once the stored set applies, which is after
 * hydration: anything measuring the sidebar should wait for it.
 */
export function useOpenNavGroups(
  storageKey: string,
  activeKeys: readonly string[],
) {
  const store = storeFor(storageKey);
  const stored = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    getServerSnapshot,
  );
  const restored = useSyncExternalStore(store.subscribe, isClient, isServer);

  useEffect(() => {
    store.set(Object.fromEntries(activeKeys.map((key) => [key, true])));
  }, [store, activeKeys]);

  function isOpen(key: string): boolean {
    return stored[key] ?? activeKeys.includes(key);
  }

  function toggle(key: string) {
    store.set({ [key]: !isOpen(key) });
  }

  return { isOpen, toggle, restored };
}
