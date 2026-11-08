"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/components/ui/cn";
import { ResetIcon } from "@/components/ui/icons";
import type { ColorReader, ContrastIssue } from "@/lib/theme-builder/contrast";
import {
  isColorToken,
  tokenLabel,
  type Token,
} from "@/lib/theme-builder/manifest";
import {
  changedDeclarations,
  tokenValue,
  type Theme,
  type TokenValue,
} from "@/lib/theme-builder/theme";
import { ColorControl } from "./ColorControl";
import { ValueEditor } from "./ValueEditor";

export interface TokenControlProps {
  token: Token;
  tokens: readonly Token[];
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  readColor: ColorReader;
  /** The contrast pairs of the theme that fall short. */
  issues: readonly ContrastIssue[];
  /** The ratio they fall short of. */
  minimum: number;
}

/**
 * One token: its name and description from the manifest, its field, a
 * marker while it differs from the default, and a button that resets it.
 */
export function TokenControl({
  token,
  tokens,
  theme,
  onThemeChange,
  readColor,
  issues,
  minimum,
}: TokenControlProps) {
  const t = useTranslations("themeBuilder.controls.tokens");
  const labelId = useId();
  const descriptionId = useId();
  const label = tokenLabel(token.name);
  const changed = changedDeclarations(theme, token).length > 0;

  function set(value: TokenValue) {
    onThemeChange({ ...theme, [token.name]: value });
  }

  return (
    <div className="px-3 py-3">
      <div className="flex min-h-6 items-center gap-2">
        <span
          id={labelId}
          className="text-site-ink font-mono text-xs font-medium"
        >
          {label}
        </span>
        {changed && (
          <>
            <span aria-hidden="true" className="bg-site-accent size-1.5" />
            <span className="sr-only">{t("changed")}</span>
          </>
        )}
        <button
          type="button"
          aria-label={t("reset", { token: label })}
          title={t("reset", { token: label })}
          onClick={() => {
            set(token.default);
          }}
          className={cn(
            "text-site-ink-muted hover:text-site-ink rounded-site-sm ml-auto p-1 transition-colors",
            !changed && "invisible",
          )}
        >
          <ResetIcon className="size-3.5" />
        </button>
      </div>
      <p id={descriptionId} className="text-site-ink-muted mb-2 text-xs">
        {token.description}
      </p>
      {isColorToken(token) ? (
        <ColorControl
          token={token}
          tokens={tokens}
          theme={theme}
          onChange={set}
          readColor={readColor}
          issues={issues.filter(
            ({ text, background }) =>
              text === token.name || background === token.name,
          )}
          minimum={minimum}
          labelledBy={labelId}
          describedBy={descriptionId}
        />
      ) : (
        <ValueEditor
          token={token}
          value={tokenValue(theme, token)}
          onChange={set}
          labelledBy={labelId}
          describedBy={descriptionId}
        />
      )}
    </div>
  );
}
