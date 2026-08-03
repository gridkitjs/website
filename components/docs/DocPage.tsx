import type { ReactNode } from "react";
import { getFormatter, getTranslations } from "next-intl/server";
import { DocsBreadcrumbs } from "./DocsBreadcrumbs";
import { Prose } from "@/components/ui/Prose";
import { getDocPageLastUpdated } from "@/lib/docs/last-updated";

export async function DocPage({
  path,
  title,
  description,
  children,
}: {
  path: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const t = await getTranslations("common");
  const format = await getFormatter();
  const lastUpdated = getDocPageLastUpdated(path);

  return (
    <article>
      <DocsBreadcrumbs path={path} />
      <h1 className="text-site-ink text-3xl font-semibold tracking-tight">
        {title}
      </h1>
      <p className="text-site-ink-muted mt-3 text-lg">{description}</p>
      {lastUpdated != null && (
        <p className="text-site-ink-muted mt-2 text-xs">
          {t("lastUpdated", {
            date: format.dateTime(lastUpdated, {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          })}
        </p>
      )}
      <Prose className="mt-8">{children}</Prose>
    </article>
  );
}
