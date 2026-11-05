"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpIcon } from "@/components/ui/icons";

/** How far down, in viewport heights, the button appears. */
const SHOW_AFTER_VIEWPORTS = 1.5;

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange);
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
  };
}

function isScrolledDown() {
  return window.scrollY > window.innerHeight * SHOW_AFTER_VIEWPORTS;
}

function isScrolledDownOnServer() {
  return false;
}

/** A button back to the top of a long page, shown once it is scrolled. */
export function BackToTop() {
  const t = useTranslations("docs");
  const visible = useSyncExternalStore(
    subscribe,
    isScrolledDown,
    isScrolledDownOnServer,
  );

  if (!visible) return null;

  function backToTop() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    // The button disappears at the top; focus goes where the skip link
    // sends it rather than back to the start of the document.
    document.getElementById("main")?.focus({ preventScroll: true });
  }

  return (
    <button
      type="button"
      onClick={backToTop}
      aria-label={t("backToTop")}
      className="bg-site-surface-raised text-site-ink-muted hover:text-site-ink border-site-line rounded-site fixed right-4 bottom-4 z-30 border p-2.5 shadow-sm transition-colors sm:right-6 sm:bottom-6"
    >
      <ArrowUpIcon className="size-5" />
    </button>
  );
}
