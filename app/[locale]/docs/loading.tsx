"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/components/ui/cn";

function Bar({ className }: { className?: string }) {
  return (
    <div className={cn("bg-site-line/70 rounded-site-sm h-4", className)} />
  );
}

// The docs layout keeps the sidebar on screen while a page loads, so this
// stands in for the page itself: the article column and, from `xl` up, the
// "On this page" column beside it. A client component on purpose: a loading
// boundary gets no `params` to call `setRequestLocale` with, so reading
// translations on the server would render every docs page on demand.
export default function DocsLoading() {
  const t = useTranslations("docs");

  return (
    <div
      role="status"
      className="animate-pulse xl:grid xl:grid-cols-[minmax(0,1fr)_200px] xl:items-start xl:gap-12"
    >
      <span className="sr-only">{t("loading")}</span>
      <div aria-hidden="true">
        <Bar className="h-3 w-40" />
        <Bar className="mt-6 h-8 w-2/3" />
        <Bar className="mt-4 h-5 w-full max-w-xl" />
        <div className="mt-10 space-y-3">
          <Bar />
          <Bar />
          <Bar className="w-5/6" />
        </div>
        <Bar className="rounded-site mt-8 h-40" />
        <div className="mt-8 space-y-3">
          <Bar />
          <Bar className="w-4/6" />
        </div>
      </div>
      <div aria-hidden="true" className="hidden space-y-3 xl:block">
        <Bar className="h-3 w-24" />
        <Bar className="w-32" />
        <Bar className="w-28" />
        <Bar className="w-36" />
      </div>
    </div>
  );
}
