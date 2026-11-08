import { TOKEN_PREFIX, type Token } from "./manifest.ts";
import {
  changedDeclarations,
  themeFromDeclarations,
  type Theme,
} from "./theme.ts";

/**
 * A theme as a URL fragment, without the `#`: the declarations it changes,
 * as `name=value` pairs with each property's `--gridkit-` prefix left off.
 * The fragment never reaches the server, so the page stays prerendered and
 * a link still carries the whole theme. `""` for the defaults.
 */
export function themeToHash(theme: Theme, tokens: readonly Token[]): string {
  return tokens
    .flatMap((token) => changedDeclarations(theme, token))
    .map(
      ({ property, value }) =>
        `${encodeURIComponent(property.slice(TOKEN_PREFIX.length))}=${encodeURIComponent(value)}`,
    )
    .join("&");
}

/**
 * The theme a fragment holds, with or without its `#`, or `undefined` when
 * it sets no token, as an in-page link's `#main` doesn't.
 */
export function themeFromHash(
  hash: string,
  tokens: readonly Token[],
): Theme | undefined {
  const declarations = [...new URLSearchParams(hash.replace(/^#/, ""))].map(
    ([name, value]) => ({ property: `${TOKEN_PREFIX}${name}`, value }),
  );
  const { theme, ignored } = themeFromDeclarations(declarations, tokens);
  return ignored.length < declarations.length ? theme : undefined;
}
