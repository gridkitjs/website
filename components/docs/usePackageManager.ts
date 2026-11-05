import { useSyncExternalStore } from "react";

/** The `localStorage` key holding the reader's package manager. */
export const PACKAGE_MANAGER_STORAGE_KEY = "gk-pm";

export const PACKAGE_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;

export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

const DEFAULT_MANAGER: PackageManager = "npm";

function isPackageManager(value: string | null): value is PackageManager {
  return PACKAGE_MANAGERS.some((manager) => manager === value);
}

// One choice for every install block on the page, held here once read, so a
// blocked `localStorage` still lets the tabs switch for the rest of the visit.
let currentManager: PackageManager | undefined;
const listeners = new Set<() => void>();

function readStored(): PackageManager {
  try {
    const stored = localStorage.getItem(PACKAGE_MANAGER_STORAGE_KEY);
    return isPackageManager(stored) ? stored : DEFAULT_MANAGER;
  } catch {
    return DEFAULT_MANAGER;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): PackageManager {
  currentManager ??= readStored();
  return currentManager;
}

// The server can't read the stored choice; it renders npm, and the stored
// manager applies after hydration.
function getServerSnapshot(): PackageManager {
  return DEFAULT_MANAGER;
}

function setPackageManager(manager: PackageManager) {
  currentManager = manager;
  try {
    localStorage.setItem(PACKAGE_MANAGER_STORAGE_KEY, manager);
  } catch {
    // Not persisted, but still applied for this visit.
  }
  for (const listener of listeners) listener();
}

/** The reader's package manager, shared by every install block and kept across visits. */
export function usePackageManager() {
  const manager = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return [manager, setPackageManager] as const;
}
