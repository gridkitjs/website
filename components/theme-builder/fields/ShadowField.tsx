"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import {
  formatShadow,
  parseShadow,
  SHADOW_PARTS,
} from "@/lib/theme-builder/values";
import { AmountInput } from "./AmountInput";

const NO_SHADOW = { x: "0", y: "0", blur: "0", spread: "0" };

interface ShadowFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** The ids of what labels and describes the field. */
  labelledBy: string;
  describedBy: string;
}

/**
 * A shadow's offsets, blur and spread in pixels; the colour is a token of
 * its own. A value in other units shows below the fields until you type a
 * number in its place.
 */
export function ShadowField({
  value,
  onChange,
  labelledBy,
  describedBy,
}: ShadowFieldProps) {
  const t = useTranslations("themeBuilder.controls.fields");
  const expressionId = useId();
  const shadow = parseShadow(value);

  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
    >
      <div className="grid grid-cols-4 gap-2">
        {SHADOW_PARTS.map((part) => (
          <label key={part} className="text-site-ink-muted text-xs">
            {t(`shadow.${part}`)}
            <AmountInput
              amount={shadow?.[part] ?? ""}
              min={part === "blur" ? 0 : undefined}
              aria-describedby={shadow === undefined ? expressionId : undefined}
              onAmount={(amount) => {
                onChange(
                  formatShadow({
                    ...(shadow ?? NO_SHADOW),
                    [part]: amount === "" ? "0" : amount,
                  }),
                );
              }}
              className="mt-1"
            />
          </label>
        ))}
      </div>
      {shadow === undefined && (
        <p
          id={expressionId}
          className="text-site-ink-muted mt-1 font-mono text-xs break-all"
        >
          {value}
        </p>
      )}
    </div>
  );
}
