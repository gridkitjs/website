import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

// The accent-tinted border and header bar set a running example apart from
// the neutral code blocks around it.
export async function LiveExampleFrame({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const t = await getTranslations("common");

  return (
    <div className="border-site-accent/30 bg-site-bg my-6 rounded-2xl border">
      <div className="border-site-accent/30 bg-site-accent-soft flex items-center justify-between gap-3 rounded-t-2xl border-b px-4 py-2.5">
        <span className="text-site-ink text-sm font-medium">{title}</span>
        <span className="text-site-accent inline-flex shrink-0 items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
          <span
            aria-hidden="true"
            className="bg-site-accent size-1.5 rounded-full"
          />
          {t("liveExample")}
        </span>
      </div>
      <div className="overflow-x-auto p-4">{children}</div>
    </div>
  );
}
