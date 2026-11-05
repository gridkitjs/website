import type { ComponentType } from "react";
import type { ExampleMeta } from "@/components/live-examples/meta";
import { generatedExamples } from "./example-sources.generated";

/** One `*.example.tsx`, as `scripts/gen-example-sources.mjs` writes it. */
export interface GeneratedExample {
  Component: ComponentType;
  meta: ExampleMeta;
  /** The source's file name in a StackBlitz project, `<Tag>.tsx`. */
  fileName: string;
  /** What the Code tab shows: the file without its site-only lines. */
  source: string;
  /** Keys of `sharedSources` the source imports, directly or through each other. */
  localFiles: readonly string[];
  /** Every package the files import, with this site's version range. */
  dependencies: Readonly<Record<string, string>>;
}

/** Every live example, by the tag doc pages write: `<ColumnResizingExample />`. */
export const examples: Readonly<Record<string, GeneratedExample>> =
  generatedExamples;

/** An example without its component: what its frame shows about it. */
export type ExampleDetails = Omit<GeneratedExample, "Component">;
