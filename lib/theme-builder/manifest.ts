/**
 * The token manifest and the preset index of `@gridkitjs/theme-tailwind`, as
 * the builder reads them: `tokens.json` lists every theme token and
 * `presets/index.json` the presets, in the order to show them. Each carries
 * a `schemaVersion` that the package bumps when a field changes meaning or
 * goes away, so a version this file doesn't know fails the build rather
 * than drawing a broken builder.
 *
 * Imports in this folder are relative and end in `.ts`, so `node --test`
 * runs its tests without a bundler.
 */

/** Every token's name starts with it. */
export const TOKEN_PREFIX = "--gridkit-";

export interface ColorPair {
  readonly light: string;
  readonly dark: string;
}

export const COLOR_SIDES = ["light", "dark"] as const;

export type ColorSide = (typeof COLOR_SIDES)[number];

export const TIERS = ["basic", "advanced"] as const;

export type Tier = (typeof TIERS)[number];

interface TokenFields {
  /** The custom property, `--gridkit-<name>`; a colour's live name. */
  name: string;
  /** The section it belongs to, such as `colors` or `density`. */
  group: string;
  tier: Tier;
  /** One sentence, to show beside its control. */
  description: string;
}

export interface ColorToken extends TokenFields {
  type: "color";
  /** Each side as the stylesheet declares it, which may read another token. */
  default: ColorPair;
}

export interface ValueToken extends TokenFields {
  /** The kind of value it takes, such as `length`, `enum` or `font-family`. */
  type: string;
  default: string;
  /** The values an `enum` takes. */
  options?: string[];
}

export type Token = ColorToken | ValueToken;

export interface PresetEntry {
  id: string;
  label: string;
  /** One sentence, to show beside it. */
  description: string;
  /** The stylesheet, `<id>.css`, beside the index. */
  file: string;
}

export function isColorToken(token: Token): token is ColorToken {
  return token.type === "color";
}

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTier(value: string): value is Tier {
  return TIERS.some((tier) => tier === value);
}

function stringField(object: JsonObject, key: string, where: string): string {
  const value = object[key];
  if (typeof value !== "string") {
    throw new Error(`${where}: "${key}" is not a string`);
  }
  return value;
}

/** The list under `key`, once the file's `schemaVersion` is the one expected. */
function entriesOf(
  json: unknown,
  key: string,
  schemaVersion: number,
  file: string,
): JsonObject[] {
  if (!isObject(json) || json.schemaVersion !== schemaVersion) {
    throw new Error(`${file}: expected schemaVersion ${schemaVersion}`);
  }
  const entries = json[key];
  if (!Array.isArray(entries) || !entries.every(isObject)) {
    throw new Error(`${file}: "${key}" is not a list of objects`);
  }
  return entries;
}

function readToken(entry: JsonObject, index: number): Token {
  const where = `tokens.json, token ${index}`;
  const name = stringField(entry, "name", where);
  const tier = stringField(entry, "tier", where);
  if (!name.startsWith(TOKEN_PREFIX)) {
    throw new Error(`${where}: "${name}" doesn't start with ${TOKEN_PREFIX}`);
  }
  if (!isTier(tier)) {
    throw new Error(`${where}: unknown tier "${tier}"`);
  }
  const fields = {
    name,
    group: stringField(entry, "group", where),
    tier,
    description: stringField(entry, "description", where),
  };

  const type = stringField(entry, "type", where);
  if (type === "color") {
    const pair = entry.default;
    if (!isObject(pair)) {
      throw new Error(`${where}: a colour's default is not a light/dark pair`);
    }
    const light = stringField(pair, "light", where);
    const dark = stringField(pair, "dark", where);
    return { ...fields, type, default: { light, dark } };
  }

  const token: ValueToken = {
    ...fields,
    type,
    default: stringField(entry, "default", where),
  };
  const { options } = entry;
  if (options !== undefined) {
    if (
      !Array.isArray(options) ||
      !options.every((option) => typeof option === "string")
    ) {
      throw new Error(`${where}: "options" is not a list of strings`);
    }
    token.options = options;
  }
  return token;
}

/** The tokens of a parsed `tokens.json`, in the manifest's order. */
export function readTokenManifest(json: unknown): Token[] {
  return entriesOf(json, "tokens", 1, "tokens.json").map(readToken);
}

/** The presets of a parsed `presets/index.json`, in display order. */
export function readPresetIndex(json: unknown): PresetEntry[] {
  return entriesOf(json, "presets", 1, "presets/index.json").map(
    (entry, index) => {
      const where = `presets/index.json, preset ${index}`;
      return {
        id: stringField(entry, "id", where),
        label: stringField(entry, "label", where),
        description: stringField(entry, "description", where),
        file: stringField(entry, "file", where),
      };
    },
  );
}
