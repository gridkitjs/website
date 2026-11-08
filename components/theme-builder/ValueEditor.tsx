"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import type { ValueToken } from "@/lib/theme-builder/manifest";
import { DimensionField } from "./fields/DimensionField";
import { SelectField } from "./fields/SelectField";
import { ShadowField } from "./fields/ShadowField";
import { cssValue, TextField } from "./fields/TextField";

const LENGTH_UNITS = ["px", "rem", "em"];

const DURATION_UNITS = ["ms", "s"];

const FONT_WEIGHTS = [
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
];

const TEXT_TRANSFORMS = ["none", "uppercase", "lowercase", "capitalize"];

/** Font stacks to suggest, each ending in a generic family. */
const FONT_STACKS = [
  "system-ui, sans-serif",
  "ui-serif, Georgia, serif",
  "ui-monospace, SFMono-Regular, Menlo, monospace",
];

interface ValueEditorProps {
  token: ValueToken;
  value: string;
  onChange: (value: string) => void;
  /** The ids of what labels and describes the token. */
  labelledBy: string;
  describedBy: string;
}

interface TextValueFieldProps extends ValueEditorProps {
  /** The property the browser checks the value against, if any. */
  property?: string;
  suggestions?: readonly string[];
}

/**
 * A text field for any value. A token whose default is `inherit` takes the
 * page's value when the field is emptied, and shows it empty.
 */
function TextValueField({
  token,
  value,
  onChange,
  labelledBy,
  describedBy,
  property,
  suggestions = [],
}: TextValueFieldProps) {
  const t = useTranslations("themeBuilder.controls.fields");
  const listId = useId();
  const inheritable = token.default === "inherit";

  return (
    <>
      <TextField
        value={inheritable && value === "inherit" ? "" : value}
        placeholder={inheritable ? t("pageValue") : undefined}
        list={suggestions.length > 0 ? listId : undefined}
        onCommit={(text) => {
          const typed =
            inheritable && text.trim() === ""
              ? "inherit"
              : cssValue(text, property);
          if (typed !== undefined) onChange(typed);
          return typed !== undefined;
        }}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
      />
      {suggestions.length > 0 && (
        <datalist id={listId}>
          {suggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      )}
    </>
  );
}

/**
 * The field for a token that isn't a colour, picked by the manifest's
 * `type`. A type this doesn't know yet gets a text field, so every token
 * has a control.
 */
export function ValueEditor(props: ValueEditorProps) {
  const { token, value, onChange, labelledBy, describedBy } = props;
  const inheritable = token.default === "inherit";
  const labels = {
    "aria-labelledby": labelledBy,
    "aria-describedby": describedBy,
  };

  /** Keywords to choose from, with the page's value for an `inherit` token. */
  function keywords(options: readonly string[]): readonly string[] {
    return inheritable && !options.includes("inherit")
      ? ["inherit", ...options]
      : options;
  }

  function dimension(units: readonly string[]) {
    return (
      <DimensionField
        value={value}
        units={units}
        inheritable={inheritable}
        onChange={onChange}
        labelledBy={labelledBy}
        describedBy={describedBy}
      />
    );
  }

  switch (token.type) {
    case "length":
      return dimension(LENGTH_UNITS);
    case "duration":
      return dimension(DURATION_UNITS);
    case "number":
      return dimension([]);
    case "font-weight":
      return (
        <SelectField
          value={value}
          options={keywords(FONT_WEIGHTS)}
          onChange={onChange}
          {...labels}
        />
      );
    case "text-transform":
      return (
        <SelectField
          value={value}
          options={keywords(TEXT_TRANSFORMS)}
          onChange={onChange}
          {...labels}
        />
      );
    case "enum":
      return (
        <SelectField
          value={value}
          options={keywords(token.options ?? [])}
          onChange={onChange}
          {...labels}
        />
      );
    case "shadow":
      return (
        <ShadowField
          value={value}
          onChange={onChange}
          labelledBy={labelledBy}
          describedBy={describedBy}
        />
      );
    case "font-family":
      return (
        <TextValueField
          {...props}
          property="font-family"
          suggestions={FONT_STACKS}
        />
      );
    default:
      return <TextValueField {...props} />;
  }
}
