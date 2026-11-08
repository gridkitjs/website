"use client";

import { useState, type ComponentProps } from "react";
import { cn } from "@/components/ui/cn";
import { FIELD_CLASSES } from "./TextField";

interface AmountInputProps extends Omit<
  ComponentProps<"input">,
  "value" | "onChange" | "type"
> {
  /** The number as written, or `""` for none. */
  amount: string;
  /** Takes the number as typed, or `""` once the field is emptied. */
  onAmount: (amount: string) => void;
}

/**
 * A number field. It keeps what you type while you type it, since a
 * half-typed number such as `0.` reads as no number at all, and passes on
 * each complete one.
 */
export function AmountInput({
  amount,
  onAmount,
  onBlur,
  className,
  ...props
}: AmountInputProps) {
  const [draft, setDraft] = useState<string>();

  return (
    <input
      type="number"
      {...props}
      value={draft ?? amount}
      onChange={(event) => {
        setDraft(event.target.value);
        if (!event.target.validity.badInput) {
          onAmount(event.target.value);
        }
      }}
      onBlur={(event) => {
        setDraft(undefined);
        onBlur?.(event);
      }}
      className={cn(FIELD_CLASSES, "w-full font-mono tabular-nums", className)}
    />
  );
}
