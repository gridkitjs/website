"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { SearchPalette } from "./SearchPalette";
import { isOpenShortcut, isToggleShortcut } from "./shortcut";
import {
  closeSearchDialog,
  openSearchDialog,
  toggleSearchDialog,
  useSearchDialogOpen,
} from "./useSearchDialog";

/**
 * The docs search palette, a modal `<dialog>` mounted once in the site
 * header. Any `SearchTrigger` opens it, as do Ctrl/Cmd+K and `/` from
 * anywhere on the site.
 */
export function SearchDialog() {
  const t = useTranslations("search");
  const open = useSearchDialogOpen();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isToggleShortcut(event)) {
        event.preventDefault();
        toggleSearchDialog();
      } else if (isOpenShortcut(event)) {
        event.preventDefault();
        openSearchDialog();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;

    // Focuses the first focusable element inside: the search input.
    dialog.showModal();
    // A modal dialog doesn't stop the page behind it scrolling.
    const root = document.documentElement;
    root.style.overflow = "hidden";

    return () => {
      root.style.overflow = "";
      // Closing a modal dialog returns focus to whatever opened it.
      dialog.close();
    };
  }, [open]);

  // A click on the backdrop lands on the dialog itself.
  function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) closeSearchDialog();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={t("label")}
      onClose={closeSearchDialog}
      onClick={closeOnBackdrop}
      className="bg-site-bg text-site-ink border-site-line rounded-site backdrop:bg-site-bg-inverted/60 mx-auto mt-4 h-fit max-h-[min(36rem,calc(100dvh-2rem))] w-[calc(100%-2rem)] max-w-xl flex-col overflow-hidden border p-0 shadow-2xl open:flex sm:mt-[12vh]"
    >
      {open && <SearchPalette />}
    </dialog>
  );
}
