import type { ReactNode } from "react";
import { getFormatter, getTranslations } from "next-intl/server";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { PrevNextNav, type PrevNextEntry } from "@/components/ui/PrevNextNav";
import { Prose } from "@/components/ui/Prose";
import { GitHubIcon } from "@/components/ui/icons";

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
      <Breadcrumbs root={{ name: t("nav.docs"), path: "docs" }} crumbs={crumbs} />
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
        <GitHubIcon className="h-4 w-4" />
        {t("editOnGithub")}
      </a>
      <PrevNextNav prev={prev} next={next} />
    </article>
  );
}
