"use client";

import type { ComponentProps } from "react";
import { useTranslations } from "next-intl";
import { CopyButton } from "@/components/code/CopyButton";
import { cn } from "@/components/ui/cn";
import {
  PACKAGE_MANAGERS,
  usePackageManager,
  type PackageManager,
} from "./usePackageManager";

const INSTALL_COMMANDS: Record<
  PackageManager,
  { add: string; addDev: string }
> = {
  npm: { add: "npm install", addDev: "npm install -D" },
  pnpm: { add: "pnpm add", addDev: "pnpm add -D" },
  yarn: { add: "yarn add", addDev: "yarn add -D" },
  bun: { add: "bun add", addDev: "bun add -d" },
};

interface PackageInstallProps extends ComponentProps<"div"> {
  /** One or more package names, space-separated. */
  pkg: string;
  /** `"true"` installs them as dev dependencies. A string: MDX props are. */
  dev?: string;
}

/**
 * An install command with a tab per package manager:
 * `<PackageInstall pkg="@gridkitjs/react" />`.
 */
export function PackageInstall({
  pkg,
  dev,
  className,
  ...props
}: PackageInstallProps) {
  const t = useTranslations("docs.content");
  const [manager, setManager] = usePackageManager();
  const { add, addDev } = INSTALL_COMMANDS[manager];
  const command = `${dev === "true" ? addDev : add} ${pkg}`;

  return (
    <div
      className={cn(
        "border-site-code-border bg-site-code-bg my-4 overflow-hidden rounded-xl border text-sm",
        className,
      )}
      {...props}
    >
      <div className="border-site-code-border flex items-center justify-between gap-2 border-b py-1.5 pr-2.5 pl-2">
        <div
          role="group"
          aria-label={t("packageManager")}
          className="flex gap-1"
        >
          {PACKAGE_MANAGERS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={option === manager}
              onClick={() => setManager(option)}
              className={cn(
                "rounded-site-sm px-2 py-1 font-mono text-xs transition-colors",
                option === manager
                  ? "bg-site-surface-raised text-site-ink shadow-xs"
                  : "text-site-ink-muted hover:text-site-ink",
              )}
            >
              {option}
            </button>
          ))}
        </div>
        <CopyButton code={command} className="static" />
      </div>
      <pre className="overflow-x-auto p-4 leading-relaxed">
        <code className="text-site-ink font-mono">{command}</code>
      </pre>
    </div>
  );
}
