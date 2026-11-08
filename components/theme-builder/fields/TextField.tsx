"use client";

import { useState, type ComponentProps } from "react";
import { cn } from "@/components/ui/cn";
import { collapseWhitespace, isSafeValue } from "@/lib/theme-builder/theme";

/** The look every field of the builder shares. */
export const FIELD_CLASSES =
  "border-site-line bg-site-bg text-site-ink rounded-site h-8 min-w-0 border px-2 text-xs";

/**
 * The value typed text sets, if it is one the theme file can hold and, when
 * `property` is given, one the browser takes for it.
 */
export function cssValue(text: string, property?: string): string | undefined {
  const value = collapseWhitespace(text);
  return isSafeValue(value) &&
    (property === undefined || CSS.supports(property, value))
    ? value
    : undefined;
}

interface TextFieldProps extends Omit<
  ComponentProps<"input">,
  "value" | "onChange"
> {
  value: string;
  /** Takes the text if it is a value the field accepts, and says if it was. */
  onCommit: (text: string) => boolean;
}

/**
 * A text field for a CSS value. While you type, it keeps your text and
 * passes each version on as soon as it's valid; until it is, the field is
 * marked invalid. Leaving the field shows the value again.
 */
export function TextField({
  value,
  onCommit,
  onBlur,
  className,
  ...props
}: TextFieldProps) {
  const [draft, setDraft] = useState<string>();
  const [invalid, setInvalid] = useState(false);

  return (
    <input
      type="text"
      spellCheck={false}
      autoComplete="off"
      {...props}
      value={draft ?? value}
      aria-invalid={invalid || undefined}
      onChange={(event) => {
        setDraft(event.target.value);
        setInvalid(!onCommit(event.target.value));
      }}
      onBlur={(event) => {
        setDraft(undefined);
        setInvalid(false);
        onBlur?.(event);
      }}
      className={cn(
        FIELD_CLASSES,
        "w-full font-mono",
        invalid && "border-site-danger",
        className,
      )}
    />
  );
}
