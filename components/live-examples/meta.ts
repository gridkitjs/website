/**
 * What every `*.example.tsx` exports as `meta`, beside its component.
 * `scripts/gen-example-sources.mjs` reads it from the source text, so each
 * value must be a literal, not a reference or an expression.
 */
export interface ExampleMeta {
  /** Unique kebab-case key, e.g. `column-resizing`. */
  id: string;
  /** The frame's title when a doc page doesn't give one. */
  title: string;
  /** One sentence under the title: what to try in the example. */
  description: string;
  /**
   * A full project under `examples/<path>` in the gridkit repo, opened by
   * "Open in StackBlitz" instead of one built from this example's source.
   */
  stackblitz?: string;
  /**
   * Height in px the preview reserves before the grid mounts, which happens
   * only in the browser; match the example's rendered height.
   */
  minHeight?: number;
}
