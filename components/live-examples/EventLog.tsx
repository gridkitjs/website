"use client";

import { useState } from "react";

/**
 * A small ring buffer of human-readable strings, for a live example to show
 * which callback just fired and with what — the same role App.tsx's own
 * `log`/`record` state plays, pulled out once so five examples don't each
 * redeclare it.
 */
export function useEventLog(limit = 6) {
  const [entries, setEntries] = useState<readonly string[]>([]);

  function record(entry: string): void {
    setEntries((previous) => [entry, ...previous].slice(0, limit));
  }

  return { entries, record };
}

export function EventLog({ entries }: { entries: readonly string[] }) {
  return (
    <ol className="border-site-line mt-4 min-h-24 space-y-1 rounded-lg border p-3 text-xs">
      {entries.length === 0 ? (
        <li className="text-site-ink-muted">
          Interact with the grid above to see its callbacks fire.
        </li>
      ) : (
        entries.map((entry, index) => (
          <li key={`${entry}-${String(index)}`}>
            <code className="text-site-ink">{entry}</code>
          </li>
        ))
      )}
    </ol>
  );
}
