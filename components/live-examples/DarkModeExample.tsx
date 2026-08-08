"use client";

import { useEffect, useState } from "react";
import { defineColumnsFromRows } from "@gridkitjs/core";
import { DataGridComponent, type ColumnDefinition } from "@gridkitjs/react";
import { cn } from "@/components/ui/cn";

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
        <DataGridComponent
          columns={columns}
          dataSource={rows}
          borders="all"
          label={`Deployments — ${caption}`}
        />
      </div>
    </div>
  );
}

const THEMES = ["light", "dark"] as const;

/**
 * A `.dark` toggle on `<html>` is the real integration (see the snippet
 * below the frame this mounts in) — nothing on this site reads `dark:` yet,
 * so it only affects the grids here.
 */
export function DarkModeExample() {
  const [appTheme, setAppTheme] = useState<(typeof THEMES)[number]>("light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", appTheme === "dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, [appTheme]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="text-site-ink-muted text-xs font-medium">
          App theme:
        </span>
        <div className="border-site-line inline-flex overflow-hidden rounded-lg border text-xs">
          {THEMES.map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => {
                setAppTheme(theme);
              }}
              className={cn(
                "px-3 py-1.5 capitalize transition-colors",
                appTheme === theme
                  ? "bg-site-accent text-white"
                  : "text-site-ink hover:bg-site-surface",
              )}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ThemeSwatch caption="Follows app theme" />
        <ThemeSwatch caption=".gridkit-light" className="gridkit-light" />
        <ThemeSwatch caption=".gridkit-dark" className="gridkit-dark" />
      </div>
    </div>
  );
}
