/** A visitor's theme choice; `system` follows the OS preference. */
export const THEMES = ["light", "dark", "system"] as const;

export type Theme = (typeof THEMES)[number];

/** The `localStorage` key holding the visitor's {@link Theme}. */
export const THEME_STORAGE_KEY = "gk-theme";

export function isTheme(value: unknown): value is Theme {
  return THEMES.some((theme) => theme === value);
}

/**
 * Marks `<html>` with `.dark` or `.light`, which the `dark:` variant in
 * `globals.css` reads, and the matching `color-scheme`. `system`, and any
 * value that isn't a theme, resolve through the OS preference.
 *
 * Inlined into {@link themeBootstrapScript} via `toString()`, so it must
 * stay self-contained: no imports, no closures.
 */
export function applyTheme(theme: string | null): void {
  const dark =
    theme === "dark" ||
    (theme !== "light" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.classList.toggle("light", !dark);
  root.style.colorScheme = dark ? "dark" : "light";
}

/**
 * Applies the stored theme from `<head>`, before first paint, so a dark
 * visitor never sees a light flash. Reading storage throws when it is
 * blocked; the OS preference applies then.
 */
export const themeBootstrapScript = `(function(){var theme=null;try{theme=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})}catch(e){}(${applyTheme.toString()})(theme)})()`;
