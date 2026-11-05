import type { ReactNode } from "react";
import { getFormatter, getTranslations } from "next-intl/server";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { PrevNextNav, type PrevNextEntry } from "@/components/ui/PrevNextNav";
import { Prose } from "@/components/ui/Prose";
import { GitHubIcon, NpmIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";

export async function ChangelogPage({
  crumbs,
  packageTitle,
  version,
  releasedAt,
  isLatestRelease,
  npmUrl,
  editUrl,
  docsHref,
  prev,
  next,
  children,
}: {
  crumbs: Crumb[];
  packageTitle: string;
  version: string;
  /** When this version was published to npm; `null` before it is. */
  releasedAt: Date | null;
  /** Whether this version is the one npm installs by default. */
  isLatestRelease: boolean;
  /** This version's page on npmjs.com. */
  npmUrl: string;
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
      {releasedAt != null && (
        <p className="text-site-ink-muted mt-2 flex flex-wrap items-center gap-x-2 text-xs">
          {tChangelog("released", {
            date: format.dateTime(releasedAt, {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          })}
          {isLatestRelease && (
            <span className="bg-site-accent-soft text-site-accent rounded-site-sm px-1.5 py-0.5 font-medium">
              {tChangelog("latest")}
            </span>
          )}
        </p>
      )}
      <Prose className="mt-8">{children}</Prose>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <a
          href={editUrl}
          target="_blank"
          rel="noreferrer"
          className="text-site-ink-muted hover:text-site-accent inline-flex items-center gap-1.5 transition-colors"
        >
          <GitHubIcon className="h-4 w-4" />
          {t("editOnGithub")}
        </a>
        <a
          href={npmUrl}
          target="_blank"
          rel="noreferrer"
          className="text-site-ink-muted hover:text-site-accent inline-flex items-center gap-1.5 transition-colors"
        >
          <NpmIcon className="h-4 w-4" />
          {tChangelog("viewOnNpm")}
        </a>
        <Link
          href={docsHref}
          className="text-site-ink-muted hover:text-site-accent transition-colors"
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
