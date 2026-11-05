"use client";

import { useSyncExternalStore, type ReactNode } from "react";

interface ClientOnlyProps {
  children: ReactNode;
  /** Rendered on the server and during hydration, before `children` mount. */
  fallback?: ReactNode;
}

// Nothing changes once mounted, so there is nothing to subscribe to.
const subscribe = () => () => {};

/**
 * Renders `children` only in the browser. The server snapshot (`false`) is
 * what hydration sees too, so the switch to `children` happens after
 * hydration without a mismatch.
 */
function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return isClient ? children : fallback;
}

export { ClientOnly };
