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
  editUrl,
  prev,
  next,
  children,
}: {
  crumbs: Crumb[];
  title: string;
  description: string;
  lastUpdated: Date | null;
  editUrl: string;
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
      <a
        href={editUrl}
        target="_blank"
        rel="noreferrer"
        className="text-site-ink-muted hover:text-site-accent mt-8 inline-flex items-center gap-1.5 text-sm"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="h-4 w-4 fill-current"
        >
          <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38l-.01-1.49c-2.23.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.17-.89-1.17-.72-.5.06-.49.06-.49.8.06 1.22.83 1.22.83.71 1.21 1.87.86 2.33.66.07-.52.28-.86.5-1.06-1.78-.2-3.65-.89-3.65-3.97 0-.88.31-1.59.83-2.15-.08-.2-.36-1.02.08-2.13 0 0 .67-.22 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.11.16 1.93.08 2.13.52.56.83 1.27.83 2.15 0 3.09-1.87 3.77-3.65 3.97.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0Z" />
        </svg>
        {t("editOnGithub")}
      </a>
      <PrevNextNav prev={prev} next={next} />
    </article>
  );
}
