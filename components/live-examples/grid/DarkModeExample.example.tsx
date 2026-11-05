"use client";

import { useState } from "react";
import { defineColumnsFromRows } from "@gridkitjs/core";
import { DataGrid, type ColumnDefinition } from "@gridkitjs/react";
import { cn } from "@/components/ui/cn";
import type { ExampleMeta } from "../meta";

export const meta: ExampleMeta = {
  id: "dark-mode",
  title: ".gridkit-light / .gridkit-dark",
  description:
    "Switch the app theme: only the first grid follows it, the other two stay pinned.",
  minHeight: 260,
};

const rows = [
  { Service: "checkout-api", Status: "healthy" },
  { Service: "billing-worker", Status: "degraded" },
  { Service: "notifications", Status: "down" },
] as const;

type Row = (typeof rows)[number];

const columns: readonly ColumnDefinition<Row>[] = [
  ...defineColumnsFromRows(rows),
];

function ThemeSwatch({
  caption,
  className,
}: {
  caption: string;
  className?: string;
}) {
  return (
    <div>
      <p className="text-site-ink-muted mb-2 text-xs font-medium">{caption}</p>
      <div
        className={cn(
          "border-line bg-surface text-fg rounded-lg border p-2",
          className,
        )}
      >
        <DataGrid
          columns={columns}
          dataSource={rows}
          borders="all"
          label={`Deployments — ${caption}`}
        />
      </div>
    </div>
  );
}

/**
 * Stands in for an app's theme by pinning a wrapper around all three grids,
 * rather than toggling `.dark` on `<html>`, which belongs to the site's own
 * theme toggle. The first grid follows the wrapper; the other two keep their
 * own, closer pin.
 */
const APP_THEME_CLASSES = {
  light: "gridkit-light",
  dark: "gridkit-dark",
} as const;

type AppTheme = keyof typeof APP_THEME_CLASSES;

const APP_THEMES: readonly AppTheme[] = ["light", "dark"];

export function DarkModeExample() {
  const [appTheme, setAppTheme] = useState<AppTheme>("light");

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="text-site-ink-muted text-xs font-medium">
          App theme:
        </span>
        <div className="border-site-line inline-flex overflow-hidden rounded-lg border text-xs">
          {APP_THEMES.map((theme) => (
            <button
              key={theme}
              type="button"
              aria-pressed={appTheme === theme}
              onClick={() => {
                setAppTheme(theme);
              }}
              className={cn(
                "px-3 py-1.5 capitalize transition-colors",
                appTheme === theme
                  ? "bg-site-accent text-site-accent-ink"
                  : "text-site-ink hover:bg-site-surface",
              )}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-3",
          APP_THEME_CLASSES[appTheme],
        )}
      >
        <ThemeSwatch caption="Follows app theme" />
        <ThemeSwatch caption=".gridkit-light" className="gridkit-light" />
        <ThemeSwatch caption=".gridkit-dark" className="gridkit-dark" />
      </div>
    </div>
  );
}
