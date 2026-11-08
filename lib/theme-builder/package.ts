import {
  readPresetIndex,
  readTokenManifest,
  type PresetEntry,
  type Token,
} from "./manifest.ts";

/** Reads a file of the installed `@gridkitjs/theme-tailwind`, by its path in the package. */
export type PackageFileReader = (path: string) => Promise<string>;

export interface Preset extends PresetEntry {
  /** The preset's stylesheet, as the package ships it. */
  css: string;
}

/** What the builder is made from, all of it read from the theme package. */
export interface ThemeBuilderData {
  /** The package's version, named in the theme file's header. */
  version: string;
  tokens: Token[];
  presets: Preset[];
}

/**
 * The file a subpath of the package's `exports` maps to, such as
 * `./presets/*` for `./presets/index.json`, so the builder reads what the
 * package publishes rather than where its files happen to sit.
 */
function exportedPath(exports: unknown, subpath: string): string {
  if (typeof exports === "object" && exports !== null) {
    for (const [key, target] of Object.entries(exports)) {
      if (typeof target !== "string") continue;
      if (key === subpath) return target;

      const [prefix, suffix] = key.split("*");
      if (
        suffix !== undefined &&
        subpath.startsWith(prefix) &&
        subpath.endsWith(suffix)
      ) {
        const match = subpath.slice(
          prefix.length,
          subpath.length - suffix.length,
        );
        return target.replace("*", match);
      }
    }
  }
  throw new Error(`@gridkitjs/theme-tailwind doesn't export ${subpath}`);
}

/** The token manifest, the presets and the version of the theme package. */
export async function readThemePackage(
  readFile: PackageFileReader,
): Promise<ThemeBuilderData> {
  const { version, exports } = JSON.parse(await readFile("package.json"));
  if (typeof version !== "string") {
    throw new Error("@gridkitjs/theme-tailwind's package.json has no version");
  }
  const readExport = (subpath: string) =>
    readFile(exportedPath(exports, subpath));

  const [manifest, index] = await Promise.all([
    readExport("./tokens.json"),
    readExport("./presets/index.json"),
  ]);
  const presets = await Promise.all(
    readPresetIndex(JSON.parse(index)).map(async (entry) => ({
      ...entry,
      css: await readExport(`./presets/${entry.file}`),
    })),
  );
  return {
    version,
    tokens: readTokenManifest(JSON.parse(manifest)),
    presets,
  };
}
