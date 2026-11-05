"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/components/ui/cn";
import { WrapIcon } from "@/components/ui/icons";
import { CopyButton } from "./CopyButton";

interface CodeFrameProps {
  /** What the copy button copies. */
  code: string;
  title?: string;
  /** Whether long lines start wrapped; the reader can toggle it. */
  wrap?: boolean;
  showLineNumbers?: boolean;
  className?: string;
  /** The highlighted `<pre>`. */
  children: ReactNode;
}

/**
 * The chrome around a highlighted code block: an optional title bar, the
 * copy button and a line-wrap toggle. The toggle shows only while a line
 * overflows the block, or once wrapping is on.
 */
export function CodeFrame({
  code,
  title,
  wrap = false,
  showLineNumbers = false,
  className,
  children,
}: CodeFrameProps) {
  const t = useTranslations("common");
  const [wrapped, setWrapped] = useState(wrap);
  const [overflows, setOverflows] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Wrapping or unwrapping changes the block's height, so this also runs
  // after every toggle.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const observer = new ResizeObserver(() => {
      setOverflows(scroller.scrollWidth > scroller.clientWidth);
    });
    observer.observe(scroller);
    return () => observer.disconnect();
  }, []);

  const tools = (
    <div className="flex items-center gap-1.5">
      {(overflows || wrapped) && (
        <button
          type="button"
          aria-label={t("wrapLines")}
          aria-pressed={wrapped}
          onClick={() => setWrapped(!wrapped)}
          className={cn(
            "border-site-line bg-site-surface inline-flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
            wrapped
              ? "text-site-accent"
              : "text-site-ink-muted hover:text-site-ink",
          )}
        >
          <WrapIcon className="h-3.5 w-3.5" />
        </button>
      )}
      <CopyButton code={code} className="static" />
    </div>
  );

  return (
    <div
      data-wrap={wrapped || undefined}
      data-line-numbers={showLineNumbers || undefined}
      className={cn(
        "code-block border-site-code-border bg-site-code-bg relative overflow-hidden rounded-xl border text-sm",
        className,
      )}
    >
      {title ? (
        <div className="border-site-code-border flex items-center justify-between gap-3 border-b py-1.5 pr-2.5 pl-4">
          <span className="text-site-ink-muted truncate font-mono text-xs">
            {title}
          </span>
          {tools}
        </div>
      ) : (
        <div className="absolute top-2.5 right-2.5 z-10">{tools}</div>
      )}
      {/* Wrapped lines would run under the floating buttons otherwise. */}
      <div
        ref={scrollerRef}
        className={cn(
          "overflow-x-auto",
          wrapped && !title && "[&_.line]:pr-20",
        )}
      >
        {children}
      </div>
    </div>
  );
}
