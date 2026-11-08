"use client";

import { useState } from "react";
import {
  CONTRAST_LEVELS,
  contrastIssues,
  type ContrastLevel,
} from "@/lib/theme-builder/contrast";
import { themeToCss } from "@/lib/theme-builder/css";
import type { ThemeBuilderData } from "@/lib/theme-builder/package";
import { ControlPanel } from "./ControlPanel";
import { OutputPanel } from "./OutputPanel";
import { ThemePreview } from "./ThemePreview";
import { useColorReader } from "./useColorReader";
import { useTheme } from "./useTheme";

interface ThemeBuilderProps {
  data: ThemeBuilderData;
  /** The builder's absolute URL, which the theme file links back to. */
  pageUrl: string;
}

/**
 * The theme builder. Its theme lives in the URL hash, and the theme file it
 * makes is written into the page as a `<style>` after the site's
 * stylesheet, so the preview shows exactly the file you download. The style
 * goes away with the page: overlays render into `document.body` and read
 * tokens from `:root`, so the file sets them there, for the whole page.
 *
 * On wide screens the controls are a column of their own beside the
 * preview and the theme file under it, scrolling on their own so the
 * preview stays in view.
 */
export function ThemeBuilder({ data, pageUrl }: ThemeBuilderProps) {
  const { tokens, presets, version } = data;
  const [theme, setTheme] = useTheme(tokens);
  const [level, setLevel] = useState<ContrastLevel>("AA");
  const readColor = useColorReader();
  const css = themeToCss(theme, tokens, { version, pageUrl });
  const issues = contrastIssues(
    theme,
    tokens,
    CONTRAST_LEVELS[level],
    readColor,
  );

  return (
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <style>{css}</style>
      <ThemePreview />
      <ControlPanel
        tokens={tokens}
        presets={presets}
        theme={theme}
        onThemeChange={setTheme}
        readColor={readColor}
        issues={issues}
        level={level}
        onLevelChange={setLevel}
        className="lg:sticky lg:top-20 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:-m-2 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:overscroll-contain lg:p-2"
      />
      <OutputPanel
        tokens={tokens}
        presets={presets}
        theme={theme}
        onThemeChange={setTheme}
        css={css}
        issues={issues}
        level={level}
        className="lg:col-start-1 lg:row-start-2"
      />
    </div>
  );
}
