"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/components/ui/cn";
import { parseDimension } from "@/lib/theme-builder/values";
import { AmountInput } from "./AmountInput";
import { FIELD_CLASSES } from "./TextField";

/** How far the arrow keys move a number, by its unit. */
const STEPS: Readonly<Record<string, number>> = {
  px: 1,
  rem: 0.125,
  em: 0.05,
  ms: 10,
  s: 0.05,
};

interface DimensionFieldProps {
  value: string;
  /** The units to offer, the first for a new number; none for a plain number. */
  units: readonly string[];
  /** Whether emptying the field sets the page's value, `inherit`. */
  inheritable: boolean;
  onChange: (value: string) => void;
  /** The ids of what labels and describes the field. */
  labelledBy: string;
  describedBy: string;
}

/**
 * A number and its unit, for a length, a duration or a plain number. A
 * value that isn't one number, such as a `calc()` that reads another token,
 * shows below the field until you type a number in its place.
 */
export function DimensionField({
  value,
  units,
  inheritable,
  onChange,
  labelledBy,
  describedBy,
}: DimensionFieldProps) {
  const t = useTranslations("themeBuilder.controls.fields");
  const expressionId = useId();
  const [newUnit, setNewUnit] = useState(units[0] ?? "");
  const dimension = parseDimension(value);
  const unit =
    dimension === undefined || dimension.unit === "" ? newUnit : dimension.unit;
  const inherited = value === "inherit";
  const expression = dimension === undefined && !inherited;

  return (
    <div>
      <div className="flex gap-2">
        <AmountInput
          amount={dimension?.amount ?? ""}
          step={STEPS[unit] ?? 1}
          placeholder={inherited ? t("pageValue") : undefined}
          aria-labelledby={labelledBy}
          aria-describedby={
            expression ? `${describedBy} ${expressionId}` : describedBy
          }
          onAmount={(amount) => {
            if (amount !== "") {
              onChange(`${amount}${unit}`);
            } else if (inheritable) {
              onChange("inherit");
            }
          }}
        />
        {units.length > 0 && (
          <select
            value={unit}
            aria-label={t("unit")}
            onChange={(event) => {
              setNewUnit(event.target.value);
              if (dimension !== undefined) {
                onChange(`${dimension.amount}${event.target.value}`);
              }
            }}
            className={cn(FIELD_CLASSES, "w-20 shrink-0")}
          >
            {(units.includes(unit) ? units : [...units, unit]).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
      </div>
      {expression && (
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
