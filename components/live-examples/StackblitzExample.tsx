"use client";

import { useState } from "react";

const REPO = "gridkitjs/gridkitjs";
const BRANCH = "main";

function projectUrl(path: string): string {
  return `https://stackblitz.com/github/${REPO}/tree/${BRANCH}/examples/${path}`;
}

/**
 * Embeds a live example hosted as a real, standalone project under
 * `examples/<path>` in the gridkitjs repo, via StackBlitz's GitHub import.
 * `path`/`title` are plain strings on purpose — next-mdx-remote strips every
 * `{expression}` JSX attribute from doc content fetched over the network, so
 * a live example can only be addressed by a literal string, not passed a
 * prop/event configuration object.
 */
export function StackblitzExample({
  path,
  title,
}: {
  path: string;
  title: string;
}) {
  const [shown, setShown] = useState(false);

  if (shown) {
    return (
      <iframe
        src={`${projectUrl(path)}?embed=1&file=src/App.tsx&view=preview&hideNavigation=1`}
        title={title}
        className="h-[500px] w-full rounded-lg border-0"
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      />
    );
  }

  return (
    <div className="border-site-line bg-site-surface flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center">
      <p className="text-site-ink-muted text-sm">
        This example runs as a real project on StackBlitz.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            setShown(true);
          }}
          className="bg-site-accent rounded-md px-4 py-2 text-sm font-medium text-white"
        >
          Show example
        </button>
        <a
          href={projectUrl(path)}
          target="_blank"
          rel="noreferrer noopener"
          className="border-site-line text-site-ink rounded-md border px-4 py-2 text-sm font-medium"
        >
          Open in StackBlitz
        </a>
      </div>
    </div>
  );
}
