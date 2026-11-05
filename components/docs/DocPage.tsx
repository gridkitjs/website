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
  toc,
  children,
}: {
  crumbs: Crumb[];
  title: string;
  description: string;
  lastUpdated: Date | null;
  editUrl: string;
  prev?: PrevNextEntry;
  next?: PrevNextEntry;
  /** Rendered between the page header and the content. */
  toc?: ReactNode;
  children: ReactNode;
}) {
  const t = await getTranslations("common");
  const format = await getFormatter();

  return (
    <article className="min-w-0">
      <Breadcrumbs
        root={{ name: t("nav.docs"), path: "docs" }}
        crumbs={crumbs}
      />
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
      {toc}
      {/* Below lg the docs bar sits under the site header, so a heading
          jumped to has to clear both. */}
      <Prose className="mt-8 [&_h2]:scroll-mt-28 lg:[&_h2]:scroll-mt-20 [&_h3]:scroll-mt-28 lg:[&_h3]:scroll-mt-20">
        {children}
      </Prose>
      <a
        href={editUrl}
        target="_blank"
        rel="noreferrer"
        className="text-site-ink-muted hover:text-site-accent mt-8 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <GitHubIcon className="h-4 w-4" />
        {t("editOnGithub")}
      </a>
      <PrevNextNav prev={prev} next={next} />
    </article>
  );
}
