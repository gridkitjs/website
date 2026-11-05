"use client";

import { useSyncExternalStore } from "react";
import type { SearchRecord } from "@/lib/docs/search-index";

/** The `localStorage` key holding the results a reader last opened from search. */
export const RECENT_STORAGE_KEY = "gk-search-recent";
const MAX_RECENT = 5;

/** A result opened from search, as much as the empty dialog lists. */
export type RecentResult = Pick<
  SearchRecord,
  "url" | "section" | "page" | "heading"
>;

const NONE: readonly RecentResult[] = [];

function isRecentResult(value: unknown): value is RecentResult {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.url === "string" &&
    typeof entry.section === "string" &&
    typeof entry.page === "string" &&
    (typeof entry.heading === "string" || entry.heading === null)
  );
}

// Held here once read, so a blocked `localStorage` still keeps the list for
// the rest of the visit.
let recent: readonly RecentResult[] | undefined;
const listeners = new Set<() => void>();

function readStored(): readonly RecentResult[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(RECENT_STORAGE_KEY) ?? "[]",
    );
    return Array.isArray(parsed)
      ? parsed.filter(isRecentResult).slice(0, MAX_RECENT)
      : NONE;
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

function getSnapshot(): readonly RecentResult[] {
  recent ??= readStored();
  return recent;
}

function setRecent(next: readonly RecentResult[]) {
  recent = next;
  try {
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Not persisted, but still listed for this visit.
  }
  for (const listener of listeners) listener();
}

/** Puts `result` first, dropping an older visit to the same place. */
export function rememberResult({ url, section, page, heading }: RecentResult) {
  const others = getSnapshot().filter((entry) => entry.url !== url);
  setRecent([{ url, section, page, heading }, ...others].slice(0, MAX_RECENT));
}

export function clearRecentResults() {
  setRecent(NONE);
}

export function useRecentResults(): readonly RecentResult[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => NONE);
}
