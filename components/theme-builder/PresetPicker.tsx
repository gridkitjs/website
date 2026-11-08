"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/components/ui/cn";
import { parseThemeCss } from "@/lib/theme-builder/css";
import { themeToHash } from "@/lib/theme-builder/hash";
import type { Token } from "@/lib/theme-builder/manifest";
import type { Preset } from "@/lib/theme-builder/package";
import type { Theme } from "@/lib/theme-builder/theme";

interface PresetPickerProps {
  presets: readonly Preset[];
  tokens: readonly Token[];
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

/**
 * The theme package's presets, in its order. The one the theme matches is
 * pressed; while it matches none, it holds changes kept nowhere but the
 * address bar, so picking a preset asks first.
 */
export function PresetPicker({
  presets,
  tokens,
  theme,
  onThemeChange,
}: PresetPickerProps) {
  const t = useTranslations("themeBuilder.controls.presets");
  const choices = useMemo(
    () =>
      presets.map((preset) => {
        const presetTheme = parseThemeCss(preset.css, tokens).theme;
        return {
          preset,
          theme: presetTheme,
          hash: themeToHash(presetTheme, tokens),
        };
      }),
    [presets, tokens],
  );
  const hash = themeToHash(theme, tokens);
  const current = choices.find((choice) => choice.hash === hash);

  return (
    <section aria-labelledby="theme-presets">
      <h2
        id="theme-presets"
        className="text-site-ink mb-3 text-lg font-semibold tracking-tight"
      >
        {t("heading")}
      </h2>
      <ul className="border-site-line rounded-site divide-site-line divide-y overflow-hidden border">
        {choices.map((choice) => (
          <li key={choice.preset.id}>
            <button
              type="button"
              aria-pressed={choice === current}
              onClick={() => {
                if (
                  current === undefined &&
                  !window.confirm(t("replace", { preset: choice.preset.label }))
                ) {
                  return;
                }
                onThemeChange(choice.theme);
              }}
              className={cn(
                "w-full px-3 py-2 text-left transition-colors",
                choice === current
                  ? "bg-site-accent-soft"
                  : "hover:bg-site-surface",
              )}
            >
              <span className="text-site-ink block text-sm font-medium">
                {choice.preset.label}
              </span>
              <span className="text-site-ink-muted block text-xs">
                {choice.preset.description}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
