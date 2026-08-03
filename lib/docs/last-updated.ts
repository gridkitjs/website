import { execFileSync } from "node:child_process";
import { join } from "node:path";

/**
 * The commit date of the last change to `absoluteFilePath`, straight from
 * git rather than a hand-maintained date on each page — so it cannot go
 * stale the way a copied-in date would.
 *
 * `null` outside a git checkout (an npm-installed copy, a shallow clone
 * missing the file's history) rather than throwing, since a doc page reads
 * fine without the date.
 */
export function getLastUpdated(absoluteFilePath: string): Date | null {
  try {
    const output = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", absoluteFilePath],
      { encoding: "utf8" },
    ).trim();
    return output ? new Date(output) : null;
  } catch {
    return null;
  }
}

/**
 * The commit date of the doc page rendered at `docPath` (the same
 * locale-less path passed to `DocPage`, e.g. `"react/data-grid"`), read off
 * the `page.tsx` that renders it. Lets `DocPage` show a last-updated date
 * without every page having to locate and pass its own file.
 */
export function getDocPageLastUpdated(docPath: string): Date | null {
  const file = join(
    process.cwd(),
    "app",
    "[locale]",
    "docs",
    ...docPath.split("/"),
    "page.tsx",
  );
  return getLastUpdated(file);
}
