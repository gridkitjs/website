"use client";

import { Fragment } from "react";
import { CodeFrame } from "./CodeFrame";

interface PlainCodeBlockProps {
  code: string;
  /** Shown in a bar above the code, e.g. a file name. */
  title?: string;
  className?: string;
}

/**
 * Code without highlighting, in the same frame as `CodeBlock`, for text
 * that changes in the browser: `CodeBlock` highlights with Shiki on the
 * server. The lines are marked up as Shiki marks them, so the block's
 * padding and wrapping apply.
 */
export function PlainCodeBlock({
  code,
  title,
  className,
}: PlainCodeBlockProps) {
  const lines = code.replace(/\n$/, "").split("\n");

  return (
    <CodeFrame code={code} title={title} className={className}>
      <pre tabIndex={0}>
        <code className="text-site-ink">
          {lines.map((line, index) => (
            <Fragment key={index}>
              {index > 0 && "\n"}
              <span className="line">{line}</span>
            </Fragment>
          ))}
        </code>
      </pre>
    </CodeFrame>
  );
}
