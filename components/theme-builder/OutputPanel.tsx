"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PlainCodeBlock } from "@/components/code/PlainCodeBlock";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { CheckIcon } from "@/components/ui/icons";
import {
  CONTRAST_LEVELS,
  type ContrastIssue,
  type ContrastLevel,
} from "@/lib/theme-builder/contrast";
import { THEME_FILE_NAME } from "@/lib/theme-builder/css";
import type { Token } from "@/lib/theme-builder/manifest";
import type { Preset } from "@/lib/theme-builder/package";
import type { Theme } from "@/lib/theme-builder/theme";
import { ContrastIssues } from "./ContrastIssues";
import { ImportForm } from "./ImportForm";
import { FLAVOURS, InstallSteps, type Flavour } from "./InstallSteps";
import { SegmentedControl } from "./SegmentedControl";
import { confirmReplace, usePresets } from "./usePresets";

const FLAVOUR_OPTIONS = Object.keys(FLAVOURS) as Flavour[];

interface OutputPanelProps {
  tokens: readonly Token[];
  presets: readonly Preset[];
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  /** The theme file, exactly as the page applies it. */
  css: string;
  /** The contrast pairs of the theme that fall short of `level`. */
  issues: readonly ContrastIssue[];
  level: ContrastLevel;
  className?: string;
}

/**
 * The theme file: how its contrast checks stand, the file itself to copy
 * or download, a way to load one back in, and the steps that put it on
 * top of either of the theme's stylesheets.
 */
export function OutputPanel({
  tokens,
  presets,
  theme,
  onThemeChange,
  css,
  issues,
  level,
  className,
}: OutputPanelProps) {
  const t = useTranslations("themeBuilder.output");
  const { current } = usePresets(presets, tokens, theme);
  const [flavour, setFlavour] = useState<Flavour>("tailwind");
  const [importing, setImporting] = useState(false);
  /** What the last import left out, once one has loaded. */
  const [ignored, setIgnored] = useState<readonly string[]>();

  return (
    <section
      aria-labelledby="theme-output"
      className={cn("min-w-0 space-y-4", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="theme-output"
          className="text-site-ink text-lg font-semibold tracking-tight"
        >
          {t("heading")}
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-expanded={importing}
            onClick={() => {
              setImporting(!importing);
              setIgnored(undefined);
            }}
            className={buttonClasses("secondary", "px-3 py-1.5")}
          >
            {t("import.open")}
          </button>
          <a
            href={`data:text/css;charset=utf-8,${encodeURIComponent(css)}`}
            download={THEME_FILE_NAME}
            className={buttonClasses("primary", "px-3 py-1.5")}
          >
            {t("download", { file: THEME_FILE_NAME })}
          </a>
        </div>
      </div>
      <p className="text-site-ink-muted text-sm">{t("intro")}</p>
      {issues.length === 0 ? (
        <p className="text-site-success flex gap-1.5 text-xs">
          <CheckIcon className="mt-px size-3.5 shrink-0" />
          {t("contrast.pass", { level })}
        </p>
      ) : (
        <div>
          <p className="text-site-warning text-xs font-medium">
            {t("contrast.fail", { count: issues.length, level })}
          </p>
          <ContrastIssues
            issues={issues}
            minimum={CONTRAST_LEVELS[level]}
            className="mt-1"
          />
        </div>
      )}
      {importing && (
        <ImportForm
          tokens={tokens}
          onImport={(parsed) => {
            if (confirmReplace(current, t("import.replace"))) {
              onThemeChange(parsed.theme);
              setImporting(false);
              setIgnored(parsed.ignored);
            }
          }}
          onCancel={() => {
            setImporting(false);
          }}
        />
      )}
      <p role="status" className="text-site-ink-muted text-xs empty:hidden">
        {ignored === undefined
          ? null
          : ignored.length === 0
            ? t("import.loaded")
            : t("import.ignored", {
                count: ignored.length,
                names: ignored.join(", "),
              })}
      </p>
      <PlainCodeBlock code={css} title={THEME_FILE_NAME} />
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-site-ink text-sm font-semibold">
            {t("steps.heading")}
          </h3>
          <SegmentedControl
            label={t("flavour")}
            options={FLAVOUR_OPTIONS.map((option) => ({
              value: option,
              label: t(`flavours.${option}`),
            }))}
            value={flavour}
            onChange={setFlavour}
          />
        </div>
        <InstallSteps flavour={flavour} />
      </div>
    </section>
  );
}
