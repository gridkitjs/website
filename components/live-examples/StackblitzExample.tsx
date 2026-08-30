import { StackblitzIcon } from "@/components/ui/icons";

const REPO = "gridkitjs/gridkitjs";
const BRANCH = "main";

function projectUrl(path: string): string {
  return `https://stackblitz.com/github/${REPO}/tree/${BRANCH}/examples/${path}`;
}

/**
 * Links out to a live example hosted as a real, standalone project under
 * `examples/<path>` in the gridkitjs repo, via StackBlitz's GitHub import.
 * `path`/`title` are plain strings on purpose — next-mdx-remote strips every
 * `{expression}` JSX attribute from doc content fetched over the network, so
 * a live example can only be addressed by a literal string, not passed a
 * prop/event configuration object.
 *
 * This only ever links out rather than embedding the project inline: an
 * embedded StackBlitz iframe needs SharedArrayBuffer, which StackBlitz used
 * to unlock for third-party embeds via an origin trial that has since
 * expired, so the inline embed now reliably fails in every browser.
 */
export function StackblitzExample({
  path,
  title,
}: {
  path: string;
  title: string;
}) {
  return (
    <div className="border-site-line bg-site-surface flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center">
      <p className="text-site-ink-muted text-sm">
        This example runs as a real project on StackBlitz.
      </p>
      <a
        href={projectUrl(path)}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={`Open ${title} on StackBlitz`}
        className="bg-site-accent inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
      >
        <StackblitzIcon className="h-4 w-4" />
        Open in StackBlitz
      </a>
    </div>
  );
}
