"use client";

import { useSyncExternalStore, type ComponentProps } from "react";
import { useFormatter } from "next-intl";

// Read once per page load: "synced 3 hours ago" doesn't need to tick, and one
// value keeps every render of the page agreeing.
let pageLoadedAt: number | undefined;

// Nothing changes once read, so there is nothing to subscribe to.
const subscribe = () => () => {};

function getNow(): number {
  pageLoadedAt ??= Date.now();
  return pageLoadedAt;
}

function getServerNow(): null {
  return null;
}

interface RelativeTimeProps extends Omit<ComponentProps<"time">, "dateTime"> {
  /** ISO 8601. */
  dateTime: string;
}

/**
 * A `<time>` that reads as "3 hours ago" in the browser. The server and
 * hydration render `children`, an absolute date, instead: a static page can
 * be served long after it was rendered, so a relative time worked out on the
 * server would drift.
 */
export function RelativeTime({
  dateTime,
  children,
  ...props
}: RelativeTimeProps) {
  const format = useFormatter();
  const now = useSyncExternalStore(subscribe, getNow, getServerNow);
  return (
    <time dateTime={dateTime} {...props}>
      {now === null ? children : format.relativeTime(new Date(dateTime), now)}
    </time>
  );
}
