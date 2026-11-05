"use client";

import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/components/ui/cn";
import { ResetIcon, StackblitzIcon } from "@/components/ui/icons";
import {
  githubProjectUrl,
  openExampleProject,
  type ExampleProject,
} from "@/components/live-examples/stackblitz";

const TABS = ["preview", "code"] as const;
type Tab = (typeof TABS)[number];

/** A gridkit `examples/<path>` project, or one built from the example. */
export type StackblitzTarget = { path: string } | { project: ExampleProject };

interface ExampleTabsProps {
  /** The highlighted source, on the Code tab. */
  code: ReactNode;
  stackblitz: StackblitzTarget;
  /** Height in px the preview reserves until the example mounts. */
  minHeight?: number;
  /** The live example, on the Preview tab. */
  children: ReactNode;
}

const TOOL_CLASS =
  "text-site-ink-muted hover:text-site-ink hover:bg-site-surface inline-flex items-center gap-1.5 rounded-site-sm px-2 py-1 text-xs font-medium transition-colors";

/**
 * Preview and Code tabs for a live example, with Reset and "Open in
 * StackBlitz". The preview stays mounted while the Code tab shows, so the
 * example keeps its state; Reset remounts it from scratch.
 */
export function ExampleTabs({
  code,
  stackblitz,
  minHeight,
  children,
}: ExampleTabsProps) {
  const t = useTranslations("docs.content.example");
  const id = useId();
  const [tab, setTab] = useState<Tab>("preview");
  const [generation, setGeneration] = useState(0);
  const tabRefs = useRef<Partial<Record<Tab, HTMLButtonElement>>>({});

  function select(next: Tab) {
    setTab(next);
    tabRefs.current[next]?.focus();
  }

  // Arrow keys, Home and End move between tabs, per the WAI-ARIA tabs pattern.
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = TABS.indexOf(tab);
    const targets: Record<string, Tab | undefined> = {
      ArrowRight: TABS[(index + 1) % TABS.length],
      ArrowLeft: TABS[(index - 1 + TABS.length) % TABS.length],
      Home: TABS[0],
      End: TABS[TABS.length - 1],
    };
    const next = targets[event.key];
    if (!next) return;
    event.preventDefault();
    select(next);
  }

  function reset() {
    setGeneration(generation + 1);
    setTab("preview");
  }

  return (
    <>
      <div className="border-site-line flex flex-wrap items-center justify-between gap-2 border-b px-2 py-1.5">
        <div
          role="tablist"
          aria-label={t("views")}
          onKeyDown={handleKeyDown}
          className="flex gap-1"
        >
          {TABS.map((name) => (
            <button
              key={name}
              ref={(button) => {
                if (button) tabRefs.current[name] = button;
              }}
              type="button"
              role="tab"
              id={`${id}-${name}-tab`}
              aria-controls={`${id}-${name}-panel`}
              aria-selected={tab === name}
              tabIndex={tab === name ? 0 : -1}
              onClick={() => setTab(name)}
              className={cn(
                "rounded-site-sm px-2.5 py-1 text-sm font-medium transition-colors",
                tab === name
                  ? "bg-site-surface text-site-ink ring-site-line ring-1"
                  : "text-site-ink-muted hover:text-site-ink",
              )}
            >
              {t(name)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={reset} className={TOOL_CLASS}>
            <ResetIcon className="size-3.5" />
            {t("reset")}
          </button>
          <StackblitzButton target={stackblitz} label={t("openInStackblitz")} />
        </div>
      </div>
      <div
        role="tabpanel"
        id={`${id}-preview-panel`}
        aria-labelledby={`${id}-preview-tab`}
        hidden={tab !== "preview"}
        className="overflow-x-auto p-4"
        style={{ minHeight }}
      >
        <div key={generation}>{children}</div>
      </div>
      <div
        role="tabpanel"
        id={`${id}-code-panel`}
        aria-labelledby={`${id}-code-tab`}
        hidden={tab !== "code"}
      >
        {code}
      </div>
    </>
  );
}

function StackblitzButton({
  target,
  label,
}: {
  target: StackblitzTarget;
  label: string;
}) {
  const content = (
    <>
      <StackblitzIcon className="size-3.5" />
      {label}
    </>
  );

  if ("path" in target) {
    return (
      <a
        href={githubProjectUrl(target.path)}
        target="_blank"
        rel="noreferrer noopener"
        className={TOOL_CLASS}
      >
        {content}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={() => openExampleProject(target.project)}
      className={TOOL_CLASS}
    >
      {content}
    </button>
  );
}
