"use client";

import { useSyncExternalStore } from "react";
import MiniSearch from "minisearch";
import type { SearchIndex, SearchRecord } from "@/lib/docs/search-index";

const INDEX_URL = "/api/search-index";
const MAX_RESULTS = 20;
/**
 * A page record outranks its own sections when both match: a query naming a
 * page should land on the page, not on whichever section repeats the word.
 */
const PAGE_RECORD_BOOST = 3;

export interface SearchHit {
  record: SearchRecord;
  /** The indexed words the query matched, lowercased, for highlighting. */
  matches: string[];
}

export type SearchIndexState =
  | { status: "idle" | "loading" | "error" }
  | { status: "ready"; search: (query: string) => SearchHit[] };

const IDLE: SearchIndexState = { status: "idle" };

const tokenize: (text: string) => string[] = MiniSearch.getDefault("tokenize");

function fieldText(record: SearchRecord, field: string): string {
  switch (field) {
    case "id":
      return record.id;
    case "page":
      return record.page;
    case "heading":
      return record.heading ?? "";
    case "terms":
      return record.terms.join(" ");
    default:
      return record.snippet;
  }
}

function createSearch(records: SearchRecord[]): (query: string) => SearchHit[] {
  const byId = new Map(records.map((record) => [record.id, record]));
  const miniSearch = new MiniSearch<SearchRecord>({
    fields: ["page", "heading", "terms", "snippet"],
    extractField: fieldText,
    // A props table names its prop family over and over (`filterMenuLabel`,
    // `filterValueLabel`, …); counting each name once keeps such a table
    // from outranking the page about the feature.
    tokenize: (text, field) =>
      field === "terms" ? [...new Set(tokenize(text))] : tokenize(text),
    searchOptions: {
      boost: { page: 4, heading: 3, terms: 1.5, snippet: 1 },
      prefix: true,
      fuzzy: 0.2,
      combineWith: "AND",
      boostDocument: (id: string) =>
        byId.get(id)?.level === 1 ? PAGE_RECORD_BOOST : 1,
    },
  });
  miniSearch.addAll(records);

  return (query) =>
    miniSearch
      .search(query)
      .slice(0, MAX_RESULTS)
      .flatMap((result) => {
        const record = byId.get(result.id as string);
        return record ? [{ record, matches: result.terms }] : [];
      });
}

// One index for the whole page, shared by every trigger and the dialog, and
// fetched once per visit.
let state: SearchIndexState = IDLE;
const listeners = new Set<() => void>();

function setState(next: SearchIndexState) {
  state = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

async function loadIndex() {
  try {
    const res = await fetch(INDEX_URL);
    if (!res.ok) throw new Error(`${INDEX_URL} answered ${res.status}`);
    const { records } = (await res.json()) as SearchIndex;
    setState({ status: "ready", search: createSearch(records) });
  } catch (error) {
    console.error(`[search] Couldn't load the index: ${String(error)}`);
    setState({ status: "error" });
  }
}

/**
 * Starts fetching the index unless it's loaded or on its way. Triggers call
 * it on hover and focus, so the index is usually ready by the time the
 * dialog opens, and nothing is fetched for a visitor who never searches.
 * After a failure it tries again.
 */
export function preloadSearchIndex() {
  if (state.status === "loading" || state.status === "ready") return;
  setState({ status: "loading" });
  void loadIndex();
}

export function useSearchIndex(): SearchIndexState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => IDLE,
  );
}
