# Theme builder (`components/theme-builder/`)

The page at `/[locale]/theme-builder`: pick a preset, tune the grid's theme
tokens on a live preview in light and dark, and copy or download
`gridkit-theme.css`, the tokens you changed on `:root`. The route,
`app/[locale]/theme-builder/page.tsx`, reads `@gridkitjs/theme-tailwind`'s
`tokens.json`, `presets/index.json`, each preset file and the package
version from `node_modules` at build time (`readThemePackage`), and hands
them to `ThemeBuilder`. Everything here is a client component; the page
stays prerendered because the theme lives in the URL hash, which never
reaches the server.

Nothing here lists a token or a preset by name. A token gridkit adds, or a
preset, appears with the next package version and no change here; a new
token `type` shows as a text field until it gets a control of its own.

## The parts

| File                                      | What it does                                                                                                                                         |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ThemeBuilder.tsx`                        | Holds the state, writes the theme file into a `<style>`, and lays out the preview, the controls and the output.                                      |
| `useTheme.ts`                             | The theme, kept in the URL hash: read once the page hydrates, written back after a short pause.                                                      |
| `ThemePreview.tsx`, `PreviewGrid.tsx`     | Two demo grids pinned with `.gridkit-light` and `.gridkit-dark`, with a part for nearly every token.                                                 |
| `ControlPanel.tsx`                        | The sidebar: `PresetPicker`, `PaletteHelper`, and a `TokenGroup` per manifest group, with the Basic/Advanced and AA/AAA toggles.                     |
| `TokenGroup.tsx`, `TokenControl.tsx`      | A group's heading, change count and reset; one token's name, description, changed marker, reset and field.                                           |
| `ColorControl.tsx`                        | A colour token: a swatch and text field per palette, oklch sliders (`fields/OklchSliders.tsx`), and its contrast warnings.                           |
| `ValueEditor.tsx`                         | Every other token: picks a field from `fields/` by the manifest's `type`.                                                                            |
| `fields/`                                 | The fields themselves: `TextField` (and `cssValue`, which validates typed text), `DimensionField`, `AmountInput`, `SelectField`, `ShadowField`.      |
| `PresetPicker.tsx`, `usePresets.ts`       | The presets, in the package's order. `usePresets` finds the one the theme matches; `confirmReplace` asks before replacing a theme that matches none. |
| `PaletteHelper.tsx`                       | Proposes the accent, selection and hover colours of both palettes from one accent.                                                                   |
| `ContrastIssues.tsx`, `useColorReader.ts` | The contrast warnings, and the browser-backed colour reader they are measured with.                                                                  |
| `OutputPanel.tsx`                         | The theme file to copy or download, the contrast summary, `ImportForm` (paste a theme file back in) and `InstallSteps` (Tailwind or plain CSS).      |

## Controls come from the manifest

`ControlPanel` groups the manifest's tokens by `group`, in the manifest's
order, and shows the `basic` tier or every token. `TokenControl` gives a
colour token (`type: "color"`, a `{ light, dark }` default) to
`ColorControl`, and any other token to `ValueEditor`.

**To change the control for a token type, or add one, edit the `switch` in
`ValueEditor.tsx`**: each `case` is a manifest `type`, and the default is a
text field. Build a new field in `fields/` from `TextField`'s
`FIELD_CLASSES`, and pass typed text through `cssValue` before it reaches
the theme: values reach the page's styles, from links and pasted files as
well as from the fields, so anything `isSafeValue` refuses must never be
set. A token whose default is `inherit` takes the page's value, and its
field offers that as an option.

Labels are the token's name without `--gridkit-` (`tokenLabel`) and its
manifest `description`; they are not translated, like any other content
that comes from gridkit. The builder's own copy is in
`messages/en/themeBuilder.json`.

## The preview renders the download

`ThemeBuilder` makes one string, `themeToCss(theme, …)`, and both writes it
into a `<style>` and hands it to `OutputPanel` to show, copy and download.
Nothing else styles the preview, so what you see is exactly the file you
get, and a bug in the file shows on the page. The style sets the tokens on
`:root`, as the file does, because the grid's menus render into
`document.body` and read the tokens there; the two preview grids differ
only by the grid's own `.gridkit-light` and `.gridkit-dark`, which the grid
copies onto the menus it opens. The `<style>` goes with the page, so the
rest of the site never sees the theme.

The file is unlayered and comes after the site's stylesheet, which imports
the theme, so it wins over the package's defaults as it would in an app.

## `lib/theme-builder/`

The logic, with no React, and tested with `node --test` beside each module
(see [Standards](../../AGENTS.md#standards) for why imports there are
relative and end in `.ts`):

| Module        | What it holds                                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `manifest.ts` | Reads `tokens.json` and `presets/index.json`, refusing a `schemaVersion` it doesn't know; the `Token` types.               |
| `package.ts`  | `readThemePackage`: the manifest, the presets and the version, through the package's `exports`.                            |
| `theme.ts`    | The theme model (token name to value, a colour's a `{ light, dark }` pair), what differs from the defaults, `isSafeValue`. |
| `css.ts`      | `parseThemeCss` (a preset or pasted file into a theme) and `themeToCss` (the theme file).                                  |
| `hash.ts`     | The theme as a URL hash and back.                                                                                          |
| `color.ts`    | oklch parsing and formatting, and WCAG contrast ratios.                                                                    |
| `resolve.ts`  | A colour token's value with every token it reads written out.                                                              |
| `contrast.ts` | The text and background pairs a theme must keep readable, and the ones that fall short.                                    |
| `palette.ts`  | The palette helper's proposal from one accent.                                                                             |
| `values.ts`   | Lengths with their unit, and the overlay shadow's geometry.                                                                |

The contrast pairs and ratios are the ones gridkit's preset test holds its
presets to; keep the two in step.
