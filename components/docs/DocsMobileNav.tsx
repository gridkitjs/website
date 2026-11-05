"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import type { DocsNavSection } from "@/lib/docs/nav";
import { Container } from "@/components/ui/Container";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { SearchTrigger } from "@/components/search/SearchTrigger";
import { DocsSidebar } from "./DocsSidebar";
import { revealInScrollParent } from "./revealInScrollParent";

/** Tailwind's `lg`, where the inline sidebar takes over from the drawer. */
const WIDE_QUERY = "(min-width: 64rem)";

interface DocsMobileNavProps {
  sections: DocsNavSection[];
  latestVersions: Record<string, string>;
}

/**
 * Below `lg`: a bar under the site header whose "Menu" button opens the
 * docs sidebar in a modal drawer, with a search trigger opposite.
 */
export function DocsMobileNav({
  sections,
  latestVersions,
}: DocsMobileNavProps) {
  const t = useTranslations("docs.nav");
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  // The page the drawer was opened on; following a link closes it without
  // an effect, because the pathname no longer matches.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;

    dialog.showModal();
    const activeLink = dialog.querySelector<HTMLElement>(
      '[aria-current="page"]',
    );
    if (activeLink) revealInScrollParent(activeLink);

    // A modal dialog doesn't stop the page behind it scrolling.
    const root = document.documentElement;
    root.style.overflow = "hidden";

    const wide = window.matchMedia(WIDE_QUERY);
    const closeWhenWide = () => {
      if (wide.matches) setOpenedOn(null);
    };
    wide.addEventListener("change", closeWhenWide);

    return () => {
      wide.removeEventListener("change", closeWhenWide);
      root.style.overflow = "";
      // Closing a modal dialog returns focus to the Menu button.
      dialog.close();
    };
  }, [open]);

  function close() {
    setOpenedOn(null);
  }

  // A click on the backdrop lands on the dialog itself; a link to the page
  // already open wouldn't change the pathname.
  function closeOnBackdropOrLink(event: MouseEvent<HTMLDialogElement>) {
    const target = event.target;
    if (
      target === event.currentTarget ||
      (target instanceof Element && target.closest("a"))
    ) {
      close();
    }
  }

  return (
    <>
      <div className="border-site-line/60 bg-site-bg/80 supports-[backdrop-filter]:bg-site-bg/60 sticky top-14 z-30 border-b backdrop-blur-md lg:hidden">
        <Container className="flex h-12 items-center justify-between">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => {
              setOpenedOn(pathname);
            }}
            className="text-site-ink hover:text-site-accent rounded-site -ml-2 inline-flex items-center gap-2 px-2 py-1.5 text-sm font-medium transition-colors"
          >
            <MenuIcon className="size-5" />
            {t("menu")}
          </button>
          <SearchTrigger variant="bar" />
        </Container>
      </div>
      <dialog
        ref={dialogRef}
        aria-label={t("label")}
        onClose={close}
        onClick={closeOnBackdropOrLink}
        className="bg-site-bg text-site-ink border-site-line backdrop:bg-site-bg-inverted/60 m-0 h-dvh max-h-none w-70 max-w-[85vw] overflow-y-auto border-r p-0 lg:hidden"
      >
        <div className="bg-site-bg border-site-line sticky top-0 z-10 flex h-14 items-center justify-between border-b px-4">
          <span className="text-site-ink text-sm font-semibold">
            {t("label")}
          </span>
          <button
            type="button"
            onClick={close}
            aria-label={t("close")}
            className="text-site-ink-muted hover:text-site-ink rounded-site p-1.5 transition-colors"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>
        <DocsSidebar
          sections={sections}
          latestVersions={latestVersions}
          className="px-4 py-6"
        />
      </dialog>
    </>
  );
}
