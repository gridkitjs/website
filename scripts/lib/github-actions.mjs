/**
 * Hands values from a script to the steps after it in a GitHub Actions job,
 * and Markdown to the run's summary page. Outside Actions, the values are printed instead, so the scripts that use
 * this run locally too.
 */
import { appendFile } from "node:fs/promises";

/**
 * Appends `name=value` lines to the file Actions names in `variable`:
 * `GITHUB_OUTPUT` for step outputs, `GITHUB_ENV` for environment variables of
 * the later steps. Prints the lines when that variable is unset.
 *
 * @param {"GITHUB_OUTPUT" | "GITHUB_ENV"} variable
 * @param {Record<string, string>} values Single-line values only.
 */
export async function writeActionsFile(variable, values) {
  const lines = Object.entries(values).map(([name, value]) => {
    if (/[\r\n]/.test(value)) {
      throw new Error(`${name} must be a single line, got ${value}`);
    }
    return `${name}=${value}\n`;
  });
  const file = process.env[variable];
  if (file) {
    await appendFile(file, lines.join(""));
  } else {
    process.stdout.write(lines.join(""));
  }
}

/**
 * Appends Markdown to the job's summary, the page a workflow run shows. Prints
 * it when `GITHUB_STEP_SUMMARY` is unset.
 *
 * @param {string} markdown
 */
export async function appendSummary(markdown) {
  const file = process.env.GITHUB_STEP_SUMMARY;
  if (file) {
    await appendFile(file, `${markdown}\n`);
  } else {
    process.stdout.write(`${markdown}\n`);
  }
}
