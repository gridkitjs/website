"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { ResetIcon } from "@/components/ui/icons";
import type { Token } from "@/lib/theme-builder/manifest";
import { changedDeclarations, defaultTheme } from "@/lib/theme-builder/theme";
import { TokenControl, type TokenControlProps } from "./TokenControl";

interface TokenGroupProps extends Omit<TokenControlProps, "token"> {
  /** The manifest's name for the group, such as `colors`. */
  group: string;
  /** Every token in the group, shown or not. */
  members: readonly Token[];
  /** The ones the chosen tier shows. */
  shown: readonly Token[];
}

/**
 * One group of the manifest, under its name. It counts and resets every
 * token in the group, including those the chosen tier hides.
 */
export function TokenGroup({
  group,
  members,
  shown,
  ...controlProps
}: TokenGroupProps) {
  const t = useTranslations("themeBuilder.controls.tokens");
  const headingId = useId();
  const { theme, onThemeChange } = controlProps;
  const heading = group.charAt(0).toUpperCase() + group.slice(1);
  const changed = members.filter(
    (token) => changedDeclarations(theme, token).length > 0,
  ).length;

  return (
    <section
      aria-labelledby={headingId}
      className="border-site-line rounded-site overflow-hidden border"
    >
      <div className="bg-site-surface border-site-line flex min-h-10 items-center gap-2 border-b px-3 py-1.5">
        <h3 id={headingId} className="text-site-ink text-sm font-semibold">
          {heading}
        </h3>
        {changed > 0 && (
          <>
            <span className="text-site-ink-muted text-xs tabular-nums">
              {t("changedCount", { count: changed })}
            </span>
            <button
              type="button"
              aria-label={t("resetGroup", { group: heading })}
              onClick={() => {
                onThemeChange({ ...theme, ...defaultTheme(members) });
              }}
              className="text-site-ink-muted hover:text-site-ink rounded-site-sm ml-auto inline-flex items-center gap-1 px-1 py-0.5 text-xs transition-colors"
            >
              <ResetIcon className="size-3.5" />
              {t("resetButton")}
            </button>
          </>
        )}
      </div>
      <ul className="divide-site-line divide-y">
        {shown.map((token) => (
          <li key={token.name}>
            <TokenControl token={token} {...controlProps} />
          </li>
        ))}
      </ul>
    </section>
  );
}
