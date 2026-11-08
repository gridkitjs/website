"use client";

import type { ComponentProps } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/components/ui/cn";
import { FIELD_CLASSES } from "./TextField";

interface SelectFieldProps extends Omit<
  ComponentProps<"select">,
  "value" | "onChange"
> {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}

/**
 * A choice of keywords. `inherit` reads as the page's value, and a value
 * that isn't among the options, as an imported file may hold, is added so
 * the field still shows it.
 */
export function SelectField({
  value,
  options,
  onChange,
  className,
  ...props
}: SelectFieldProps) {
  const t = useTranslations("themeBuilder.controls.fields");

  return (
    <select
      {...props}
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
      className={cn(FIELD_CLASSES, "w-full", className)}
    >
      {(options.includes(value) ? options : [...options, value]).map(
        (option) => (
          <option key={option} value={option}>
            {option === "inherit" ? t("pageValue") : option}
          </option>
        ),
      )}
    </select>
  );
}
