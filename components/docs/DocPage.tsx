import type { ReactNode } from "react";
import { getFormatter, getTranslations } from "next-intl/server";
import { DocsBreadcrumbs, type Crumb } from "./DocsBreadcrumbs";
import { PrevNextNav, type PrevNextEntry } from "./PrevNextNav";
import { Prose } from "@/components/ui/Prose";

export async function DocPage({
  crumbs,
  title,
  description,
  lastUpdated,
  prev,
  next,
  children,
}: {
  crumbs: Crumb[];
  title: string;
  description: string;
  lastUpdated: Date | null;
  prev?: PrevNextEntry;
  next?: PrevNextEntry;
  children: ReactNode;
}) {
  const t = await getTranslations("common");
  const format = await getFormatter();

  return (
    <article>
      <DocsBreadcrumbs crumbs={crumbs} />
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
      <PrevNextNav prev={prev} next={next} />
    </article>
  );
}
