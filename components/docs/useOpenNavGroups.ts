import { useEffect, useMemo, useSyncExternalStore } from "react";
import { activeNavKeys, type DocsNavSection } from "@/lib/docs/nav";

/** The `sessionStorage` key holding which sidebar sections and groups are open. */
export const DOCS_NAV_STORAGE_KEY = "gk-docs-nav";

type OpenGroups = Readonly<Record<string, boolean>>;

const NONE: OpenGroups = {};

// One store for every sidebar on the page, so the inline sidebar and the
// drawer agree. Held here once read, so a blocked `sessionStorage` still
// lets groups toggle for the rest of the visit.
let openGroups: OpenGroups | undefined;
const listeners = new Set<() => void>();

function readStored(): OpenGroups {
  try {
    const parsed: unknown = JSON.parse(
      sessionStorage.getItem(DOCS_NAV_STORAGE_KEY) ?? "{}",
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

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): OpenGroups {
  openGroups ??= readStored();
  return openGroups;
}

// The server can't read the stored set; it renders only the current page's
// section and group open, which the client's first render matches.
function getServerSnapshot(): OpenGroups {
  return NONE;
}

function setOpenGroups(changes: OpenGroups) {
  const current = getSnapshot();
  if (Object.entries(changes).every(([key, open]) => current[key] === open)) {
    return;
  }
  openGroups = { ...current, ...changes };
  try {
    sessionStorage.setItem(DOCS_NAV_STORAGE_KEY, JSON.stringify(openGroups));
  } catch {
    // Not persisted, but still applied for this visit.
  }
  for (const listener of listeners) listener();
}

/**
 * Which sidebar sections and groups are open, by key ("react",
 * "react/columns"). The ones holding the current page open on every
 * navigation into them; whatever else the reader opens or closes stays that
 * way for the session.
 */
export function useOpenNavGroups(sections: DocsNavSection[], pathname: string) {
  const stored = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const activeKeys = useMemo(
    () => activeNavKeys(sections, pathname),
    [sections, pathname],
  );

  useEffect(() => {
    setOpenGroups(Object.fromEntries(activeKeys.map((key) => [key, true])));
  }, [activeKeys]);

  function isOpen(key: string): boolean {
    return stored[key] ?? activeKeys.includes(key);
  }

  function toggle(key: string) {
    setOpenGroups({ [key]: !isOpen(key) });
  }

  return { isOpen, toggle };
}
