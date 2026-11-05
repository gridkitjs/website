"use client";

import {
  useEffect,
  useSyncExternalStore,
  type ComponentType,
  type SVGProps,
} from "react";
import { useTranslations } from "next-intl";
import { MonitorIcon, MoonIcon, SunIcon } from "@/components/ui/icons";
import {
  applyTheme,
  isTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/lib/theme";

const NEXT_THEME: Record<Theme, Theme> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const THEME_ICONS: Record<Theme, ComponentType<SVGProps<SVGSVGElement>>> = {
  light: SunIcon,
  dark: MoonIcon,
  system: MonitorIcon,
};

// The choice lives here once read, so a blocked `localStorage` still lets
// the toggle work for the rest of the visit.
let currentTheme: Theme | undefined;
const listeners = new Set<() => void>();

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Theme {
  currentTheme ??= readStoredTheme();
  return currentTheme;
}

// The server can't know the stored choice; the toggle renders a placeholder
// until hydration reads it.
function getServerSnapshot(): null {
  return null;
}

function setTheme(theme: Theme) {
  currentTheme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Not persisted, but still applied for this visit.
  }
  applyTheme(theme);
  for (const listener of listeners) listener();
}

/** Cycles the site theme: light, dark, then back to following the OS. */
export function ThemeToggle() {
  const t = useTranslations("common.theme");
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (theme !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const followSystem = () => {
      applyTheme("system");
    };
    query.addEventListener("change", followSystem);
    return () => {
      query.removeEventListener("change", followSystem);
    };
  }, [theme]);

  if (theme === null) {
    return <span aria-hidden="true" className="size-5" />;
  }

  const Icon = THEME_ICONS[theme];
  const label = t("label", { current: t(theme), next: t(NEXT_THEME[theme]) });

  return (
    <button
      type="button"
      onClick={() => {
        setTheme(NEXT_THEME[theme]);
      }}
      aria-label={label}
      title={label}
      className="text-site-ink transition-opacity hover:opacity-70"
    >
      <Icon className="size-5" />
    </button>
  );
}
