"use client";

import { themeToCss } from "@/lib/theme-builder/css";
import type { ThemeBuilderData } from "@/lib/theme-builder/package";
import { ThemePreview } from "./ThemePreview";
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
 */
export function ThemeBuilder({ data, pageUrl }: ThemeBuilderProps) {
  const { tokens, version } = data;
  const [theme] = useTheme(tokens);
  const css = themeToCss(theme, tokens, { version, pageUrl });

  return (
    <div className="mt-8">
      <style>{css}</style>
      <ThemePreview />
    </div>
  );
}
