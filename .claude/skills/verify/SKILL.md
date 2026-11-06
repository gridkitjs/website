---
name: verify
description: Run the website's local check sequence, in order, before pushing or opening a pull request. Use when asked to verify, check or validate a change, and before any push or PR.
---

# Run the local checks

This repo has no CI workflow of its own: Vercel builds every push, and a
broken build fails the deploy. Run the same checks here first. What each one
enforces is under [Standards](../../../AGENTS.md#standards) in the root
`AGENTS.md`.

## 1. The sequence

From the repo root, in this order. Each step stops the chain on failure:

```bash
npm run format:check && npm run lint && npx tsc --noEmit && npm run build
```

`npm run build` needs `GITHUB_TOKEN` in `.env` (see
[Development](../../../AGENTS.md#development)). Its `prebuild` step runs
three scripts first: `gen-example-sources.mjs`, `export-mdx-tags.mjs` and
`check-feature-slugs.mjs`.

If you changed `package.json`, run `npm install` first and commit the
updated `package-lock.json`.

## 2. Read the route table

When the build passes, check its route table: `/[locale]/docs/[[...slug]]`
and `/[locale]/changelog/[[...slug]]` must be marked `●` (prerendered). A
`ƒ` there means a layout or page reads request headers, so every visit
renders on demand behind the loading skeleton. The build still succeeds, so
this is the step most often missed. The fix is in
[app/[locale]/AGENTS.md](../../../app/[locale]/AGENTS.md#keep-the-routes-prerendered).

## 3. Reading a failure

| Step                     | Fix                                                                                                                                                                                          |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format:check`           | Run `npx prettier --write <file>` on the files it names, then review the diff. Line endings must be LF.                                                                                      |
| `lint`                   | Fix the code; don't add a disable comment.                                                                                                                                                   |
| `tsc`                    | Fix the type rather than reaching for `any` or `!`. An error in `lib/docs/example-sources.generated.ts` means it is stale: run `node scripts/gen-example-sources.mjs` and commit the result. |
| `gen-example-sources`    | It names the example file and what is wrong; see [components/live-examples/AGENTS.md](../../../components/live-examples/AGENTS.md).                                                          |
| `check-feature-slugs`    | A feature-matrix link points at a doc page that doesn't exist, or a label is missing; see [components/marketing/AGENTS.md](../../../components/marketing/AGENTS.md).                         |
| `next build`             | Read the first error; a fetch or rate-limit error usually means `GITHUB_TOKEN` is missing or expired.                                                                                        |
| `ƒ` on a docs route      | See step 2.                                                                                                                                                                                  |
| `next build`, docs pages | A doc page that fails to compile is MDX from `gridkit`: fix it there, never with a local `.mdx` here (see [lib/docs/AGENTS.md](../../../lib/docs/AGENTS.md)).                                |

`npm run build` and `npm run dev` both regenerate
`lib/docs/example-sources.generated.ts`. If it shows up changed and no
example changed, restore it with
`git checkout -- lib/docs/example-sources.generated.ts`.

Report each step as passed or failed with its real output. Don't call a step
passed that you didn't run.
