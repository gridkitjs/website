"use client";

import { useSyncExternalStore } from "react";
import { preloadSearchIndex } from "./useSearchIndex";

// Whether the search dialog is open, shared by the header trigger, the docs
// bar's trigger and the keyboard shortcut, which all open the one dialog.
let open = false;
const listeners = new Set<() => void>();

function setOpen(next: boolean) {
  if (open === next) return;
  open = next;
  if (open) preloadSearchIndex();
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function openSearchDialog() {
  setOpen(true);
}

export function closeSearchDialog() {
  setOpen(false);
}

export function toggleSearchDialog() {
  setOpen(!open);
}

export function useSearchDialogOpen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => open,
    () => false,
  );
}
