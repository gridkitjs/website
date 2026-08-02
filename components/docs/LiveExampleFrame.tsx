import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

export async function LiveExampleFrame({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const t = await getTranslations("common");

  return (
    <div className="border-site-line bg-site-bg rounded-2xl border">
      <div className="border-site-line flex items-center justify-between border-b px-4 py-2.5">
        <p className="text-site-ink text-sm font-medium">{title}</p>
        <span className="text-site-accent text-xs font-medium tracking-wide uppercase">
          {t("liveExample")}
        </span>
      </div>
      <div className="overflow-x-auto p-4">{children}</div>
    </div>
  );
}
