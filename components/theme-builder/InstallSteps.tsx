"use client";

import { useTranslations } from "next-intl";
import { PlainCodeBlock } from "@/components/code/PlainCodeBlock";
import { PackageInstall } from "@/components/docs/PackageInstall";
import { THEME_FILE_NAME } from "@/lib/theme-builder/css";

/**
 * The stylesheets a theme file goes on top of. The file is the same for
 * both; what differs is the package and the imports before it.
 */
export const FLAVOURS = {
  tailwind: {
    pkg: "@gridkitjs/theme-tailwind",
    imports: ["tailwindcss", "@gridkitjs/theme-tailwind/styles.css"],
  },
  css: {
    pkg: "@gridkitjs/theme-css",
    imports: ["@gridkitjs/theme-css/styles.css"],
  },
} as const;

export type Flavour = keyof typeof FLAVOURS;

/** How to use the theme file with one of the theme's stylesheets. */
export function InstallSteps({ flavour }: { flavour: Flavour }) {
  const t = useTranslations("themeBuilder.output.steps");
  const { pkg, imports } = FLAVOURS[flavour];
  const entry = [...imports, `./${THEME_FILE_NAME}`]
    .map((path) => `@import "${path}";`)
    .join("\n");

  return (
    <ol className="marker:text-site-ink-muted list-decimal space-y-4 pl-5 text-sm">
      <li>
        <p className="text-site-ink mb-2">{t("install", { pkg })}</p>
        <PackageInstall pkg={pkg} className="my-0" />
      </li>
      <li>
        <p className="text-site-ink mb-2">
          {t("import", { file: THEME_FILE_NAME })}
        </p>
        <PlainCodeBlock code={entry} title="src/index.css" />
      </li>
    </ol>
  );
}
