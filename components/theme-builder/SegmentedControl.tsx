"use client";

import { cn } from "@/components/ui/cn";

interface SegmentedControlProps<Value extends string> {
  /** Names the group for assistive tech. */
  label: string;
  options: readonly { value: Value; label: string }[];
  value: Value;
  onChange: (value: Value) => void;
  className?: string;
}

/** A row of buttons that picks one of a few values. */
export function SegmentedControl<Value extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<Value>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "border-site-line rounded-site inline-flex overflow-hidden border text-xs",
        className,
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => {
            onChange(option.value);
          }}
          className={cn(
            "px-3 py-1.5 transition-colors",
            value === option.value
              ? "bg-site-accent text-site-accent-ink"
              : "text-site-ink hover:bg-site-surface",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
