"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { parseThemeCss } from "@/lib/theme-builder/css";
import type { Token } from "@/lib/theme-builder/manifest";
import type { ParsedTheme } from "@/lib/theme-builder/theme";
import { FIELD_CLASSES } from "./fields/TextField";

interface ImportFormProps {
  tokens: readonly Token[];
  /** Takes what the pasted file sets, once it reads as a stylesheet. */
  onImport: (parsed: ParsedTheme) => void;
  onCancel: () => void;
}

/**
 * A field to paste a theme file into, such as one downloaded here or a
 * preset, and load it in place of the theme. Only what the file sets on
 * `:root` is read, as the theme's stylesheet reads tokens there.
 */
export function ImportForm({ tokens, onImport, onCancel }: ImportFormProps) {
  const t = useTranslations("themeBuilder.output.import");
  const fieldId = useId();
  const hintId = useId();
  const errorId = useId();
  const [text, setText] = useState("");
  const [invalid, setInvalid] = useState(false);

  return (
    <form
      aria-label={t("label")}
      onSubmit={(event) => {
        event.preventDefault();
        let parsed: ParsedTheme;
        try {
          parsed = parseThemeCss(text, tokens);
        } catch {
          setInvalid(true);
          return;
        }
        onImport(parsed);
      }}
      className="border-site-line bg-site-surface rounded-site space-y-2 border p-3"
    >
      <label htmlFor={fieldId} className="text-site-ink text-sm font-medium">
        {t("label")}
      </label>
      <p id={hintId} className="text-site-ink-muted text-xs">
        {t("hint")}
      </p>
      <textarea
        id={fieldId}
        value={text}
        required
        rows={8}
        spellCheck={false}
        aria-describedby={invalid ? `${hintId} ${errorId}` : hintId}
        aria-invalid={invalid || undefined}
        onChange={(event) => {
          setText(event.target.value);
          setInvalid(false);
        }}
        className={cn(
          FIELD_CLASSES,
          "block h-auto w-full py-1.5 font-mono",
          invalid && "border-site-danger",
        )}
      />
      {invalid && (
        <p id={errorId} className="text-site-danger text-xs">
          {t("invalid")}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className={buttonClasses("secondary", "px-3 py-1.5")}
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          className={buttonClasses("primary", "px-3 py-1.5")}
        >
          {t("submit")}
        </button>
      </div>
    </form>
  );
}
