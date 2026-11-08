"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/components/ui/cn";
import {
  CONTRAST_LEVELS,
  type ColorReader,
  type ContrastIssue,
  type ContrastLevel,
} from "@/lib/theme-builder/contrast";
import { TIERS, type Tier, type Token } from "@/lib/theme-builder/manifest";
import type { Preset } from "@/lib/theme-builder/package";
import type { Theme } from "@/lib/theme-builder/theme";
import { PaletteHelper } from "./PaletteHelper";
import { PresetPicker } from "./PresetPicker";
import { SegmentedControl } from "./SegmentedControl";
import { TokenGroup } from "./TokenGroup";

const LEVELS = Object.keys(CONTRAST_LEVELS) as ContrastLevel[];

interface ControlPanelProps {
  tokens: readonly Token[];
  presets: readonly Preset[];
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  readColor: ColorReader;
  /** The contrast pairs of the theme that fall short of `level`. */
  issues: readonly ContrastIssue[];
  level: ContrastLevel;
  onLevelChange: (level: ContrastLevel) => void;
  className?: string;
}

/** The manifest's tokens by group, in the manifest's order. */
function groupsOf(tokens: readonly Token[]): [string, Token[]][] {
  const groups = new Map<string, Token[]>();
  for (const token of tokens) {
    groups.set(token.group, [...(groups.get(token.group) ?? []), token]);
  }
  return [...groups];
}

/**
 * Everything that changes the theme: the presets, the palette helper, and
 * a field for every token of the manifest, grouped as it groups them.
 * Basic shows the palette and the base knobs; Advanced adds every token
 * that tunes one part of the grid.
 */
export function ControlPanel({
  tokens,
  presets,
  theme,
  onThemeChange,
  readColor,
  issues,
  level,
  onLevelChange,
  className,
}: ControlPanelProps) {
  const t = useTranslations("themeBuilder.controls");
  const [tier, setTier] = useState<Tier>("basic");

  return (
    <aside aria-label={t("label")} className={cn("space-y-8", className)}>
      <PresetPicker
        presets={presets}
        tokens={tokens}
        theme={theme}
        onThemeChange={onThemeChange}
      />
      <PaletteHelper
        tokens={tokens}
        theme={theme}
        onThemeChange={onThemeChange}
        readColor={readColor}
      />
      <section aria-labelledby="theme-tokens" className="space-y-3">
        <h2
          id="theme-tokens"
          className="text-site-ink text-lg font-semibold tracking-tight"
        >
          {t("tokens.heading")}
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SegmentedControl
            label={t("tokens.tier")}
            options={TIERS.map((option) => ({
              value: option,
              label: t(`tokens.${option}`),
            }))}
            value={tier}
            onChange={setTier}
          />
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-site-ink-muted text-xs">
              {t("contrast.target")}
            </span>
            <SegmentedControl
              label={t("contrast.target")}
              options={LEVELS.map((option) => ({
                value: option,
                label: t(`contrast.${option}`),
              }))}
              value={level}
              onChange={onLevelChange}
            />
          </div>
        </div>
        {groupsOf(tokens).map(([group, members]) => {
          const shown =
            tier === "advanced"
              ? members
              : members.filter((token) => token.tier === tier);
          return (
            shown.length > 0 && (
              <TokenGroup
                key={group}
                group={group}
                members={members}
                shown={shown}
                tokens={tokens}
                theme={theme}
                onThemeChange={onThemeChange}
                readColor={readColor}
                issues={issues}
                minimum={CONTRAST_LEVELS[level]}
              />
            )
          );
        })}
      </section>
    </aside>
  );
}
