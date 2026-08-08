import type { ReactNode } from "react";
import { getFormatter, getTranslations } from "next-intl/server";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { PrevNextNav, type PrevNextEntry } from "@/components/ui/PrevNextNav";
import { Prose } from "@/components/ui/Prose";
import { GitHubIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";

export async function ChangelogPage({
  crumbs,
  packageTitle,
  version,
  lastUpdated,
  editUrl,
  docsHref,
  prev,
  next,
  children,
}: {
  crumbs: Crumb[];
  packageTitle: string;
  version: string;
  /** Only meaningful for the latest version — an older version's page would otherwise show the file's most recent commit date, which isn't its own. */
  lastUpdated: Date | null;
  editUrl: string;
  docsHref: string;
  prev?: PrevNextEntry;
  next?: PrevNextEntry;
  children: ReactNode;
}) {
  const t = await getTranslations("common");
  const tChangelog = await getTranslations("changelog");
  const format = await getFormatter();

  return (
    <article className="min-w-0">
      <Breadcrumbs
        root={{ name: t("nav.changelog"), path: "changelog" }}
        crumbs={crumbs}
      />
      <h1 className="text-site-ink text-3xl font-semibold tracking-tight">
        {tChangelog("versionHeading", { package: packageTitle, version })}
      </h1>
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
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <a
          href={editUrl}
          target="_blank"
          rel="noreferrer"
          className="text-site-ink-muted hover:text-site-accent inline-flex items-center gap-1.5"
        >
          <GitHubIcon className="h-4 w-4" />
          {t("editOnGithub")}
        </a>
        <Link
          href={docsHref}
          className="text-site-ink-muted hover:text-site-accent"
        >
          {tChangelog("viewDocs", { package: packageTitle })}
        </Link>
      </div>
      <PrevNextNav
        labels={{
          prev: tChangelog("newerVersion"),
          next: tChangelog("olderVersion"),
        }}
        prev={prev}
        next={next}
      />
    </article>
  );
}
