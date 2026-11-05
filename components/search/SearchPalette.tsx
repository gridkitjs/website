"use client";

import {
  useEffect,
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { revealInScrollParent } from "@/components/docs/revealInScrollParent";
import { cn } from "@/components/ui/cn";
import { Kbd } from "@/components/ui/Kbd";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import { Highlighted } from "./Highlighted";
import { closeSearchDialog } from "./useSearchDialog";
import { preloadSearchIndex, useSearchIndex } from "./useSearchIndex";
import {
  clearRecentResults,
  rememberResult,
  useRecentResults,
  type RecentResult,
} from "./useRecentResults";

/** A row in the listbox: a search hit, or a recently opened result. */
interface SearchOption extends RecentResult {
  snippet?: string;
  matches?: string[];
}

interface OptionGroup {
  label: string;
  options: SearchOption[];
}

/** Hits grouped by docs section, sections in the order their best hit ranks. */
function groupBySection(options: SearchOption[]): OptionGroup[] {
  const groups = new Map<string, SearchOption[]>();
  for (const option of options) {
    const group = groups.get(option.section);
    if (group) group.push(option);
    else groups.set(option.section, [option]);
  }
  return [...groups].map(([label, grouped]) => ({ label, options: grouped }));
}

/** Where each group's first option sits in the flat order the arrow keys walk. */
function groupOffsets(groups: OptionGroup[]): number[] {
  let next = 0;
  return groups.map((group) => {
    const offset = next;
    next += group.options.length;
    return offset;
  });
}

/**
 * The search dialog's contents: a combobox input over a listbox of results.
 * Focus stays in the input; the arrow keys move the active option and Enter
 * opens it. Mounted only while the dialog is open, so each opening starts
 * from an empty query.
 */
export function SearchPalette() {
  const t = useTranslations("search");
  const router = useRouter();
  const index = useSearchIndex();
  const recent = useRecentResults();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const id = useId();
  const listboxId = `${id}-results`;
  const optionId = (position: number) => `${id}-option-${position}`;

  const trimmed = query.trim();
  const groups = useMemo((): OptionGroup[] => {
    if (!trimmed) {
      return recent.length > 0
        ? [{ label: t("recent"), options: [...recent] }]
        : [];
    }
    if (index.status !== "ready") return [];
    return groupBySection(
      index
        .search(trimmed)
        .map(({ record, matches }) => ({ ...record, matches })),
    );
  }, [trimmed, recent, index, t]);

  const options = groups.flatMap((group) => group.options);
  const offsets = groupOffsets(groups);
  const active = Math.min(activeIndex, options.length - 1);
  const activeId = options.length > 0 ? optionId(active) : undefined;

  useEffect(() => {
    const element = activeId && document.getElementById(activeId);
    if (element) revealInScrollParent(element);
  }, [activeId]);

  function leaveFor(option: SearchOption) {
    rememberResult(option);
    closeSearchDialog();
  }

  function choose(option: SearchOption) {
    leaveFor(option);
    router.push(option.url);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (options.length === 0 || event.nativeEvent.isComposing) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((active + step + options.length) % options.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = options[active];
      if (option) choose(option);
    }
  }

  let status = "";
  let body: ReactNode = null;
  if (!trimmed) {
    if (options.length === 0) body = <Message>{t("hint")}</Message>;
  } else if (index.status === "error") {
    status = t("error");
    body = (
      <Message>
        {t("error")}{" "}
        <button
          type="button"
          onClick={preloadSearchIndex}
          className="text-site-accent hover:text-site-accent-hover font-medium underline underline-offset-2"
        >
          {t("retry")}
        </button>
      </Message>
    );
  } else if (index.status !== "ready") {
    status = t("loading");
    body = <Message>{t("loading")}</Message>;
  } else {
    status = t("resultCount", { count: options.length });
    if (options.length === 0) {
      body = <Message>{t("noResults", { query: trimmed })}</Message>;
    }
  }

  return (
    <>
      <div className="border-site-line flex items-center gap-3 border-b px-4">
        <SearchIcon className="text-site-ink-muted size-5 shrink-0" />
        <input
          type="text"
          role="combobox"
          aria-label={t("label")}
          aria-expanded={options.length > 0}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          placeholder={t("placeholder")}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={onKeyDown}
          className="text-site-ink placeholder:text-site-ink-muted h-14 min-w-0 flex-1 bg-transparent text-base outline-none"
        />
        <button
          type="button"
          onClick={closeSearchDialog}
          aria-label={t("close")}
          className="text-site-ink-muted hover:text-site-ink rounded-site -mr-1.5 p-1.5 transition-colors"
        >
          <CloseIcon className="size-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {body}
        {!trimmed && options.length > 0 && (
          <div className="flex justify-end px-3 pt-1">
            <button
              type="button"
              onClick={clearRecentResults}
              className="text-site-ink-muted hover:text-site-ink text-xs transition-colors"
            >
              {t("clearRecent")}
            </button>
          </div>
        )}
        <ul
          id={listboxId}
          role="listbox"
          aria-label={t("results")}
          className={cn(options.length === 0 && "hidden")}
        >
          {groups.map((group, groupIndex) => (
            <li key={group.label} role="presentation">
              <div
                id={`${id}-group-${groupIndex}`}
                className="text-site-ink-muted px-3 pt-3 pb-1 text-xs font-semibold tracking-wide uppercase"
              >
                {group.label}
              </div>
              <ul role="group" aria-labelledby={`${id}-group-${groupIndex}`}>
                {group.options.map((option, optionIndex) => {
                  const position = (offsets[groupIndex] ?? 0) + optionIndex;
                  return (
                    <ResultOption
                      key={option.url}
                      id={optionId(position)}
                      option={option}
                      active={position === active}
                      onHover={() => {
                        setActiveIndex(position);
                      }}
                      onChoose={() => {
                        leaveFor(option);
                      }}
                    />
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      <p role="status" className="sr-only">
        {status}
      </p>

      <div className="border-site-line text-site-ink-muted hidden items-center gap-4 border-t px-4 py-2.5 text-xs sm:flex">
        <KeyHint
          keys={[t("keys.up"), t("keys.down")]}
          label={t("keys.navigate")}
        />
        <KeyHint keys={[t("keys.enter")]} label={t("keys.open")} />
        <KeyHint keys={[t("keys.escape")]} label={t("keys.close")} />
      </div>
    </>
  );
}

function Message({ children }: { children: ReactNode }) {
  return (
    <p className="text-site-ink-muted px-3 py-8 text-center text-sm">
      {children}
    </p>
  );
}

function KeyHint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {keys.map((key) => (
        <Kbd key={key}>{key}</Kbd>
      ))}
      {label}
    </span>
  );
}

interface ResultOptionProps {
  id: string;
  option: SearchOption;
  active: boolean;
  onHover: () => void;
  onChoose: () => void;
}

/**
 * One result. The link inside is for the pointer (and opening in a new
 * tab); it takes no focus, since the keyboard drives the list from the input.
 */
function ResultOption({
  id,
  option,
  active,
  onHover,
  onChoose,
}: ResultOptionProps) {
  return (
    <li id={id} role="option" aria-selected={active} onPointerMove={onHover}>
      <Link
        href={option.url}
        tabIndex={-1}
        onClick={onChoose}
        className={cn(
          "rounded-site block px-3 py-2",
          active && "bg-site-surface",
        )}
      >
        <span className="text-site-ink block text-sm font-medium">
          {option.heading ?? option.page}
        </span>
        {option.heading && (
          <span className="text-site-ink-muted block text-xs">
            {option.page}
          </span>
        )}
        {option.snippet && (
          <span className="text-site-ink-muted mt-1 line-clamp-2 block text-xs">
            <Highlighted text={option.snippet} matches={option.matches ?? []} />
          </span>
        )}
      </Link>
    </li>
  );
}
