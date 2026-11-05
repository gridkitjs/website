import { getFormatter, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { RelativeTime } from "@/components/ui/RelativeTime";
import { GitHubIcon, NpmIcon } from "@/components/ui/icons";
import { getCommitUrl } from "@/lib/docs/github";
import { getDocsSync } from "@/lib/docs/manifest";
import { siteConfig } from "@/lib/seo/site-config";

export async function SiteFooter() {
  const t = await getTranslations("common.footer");
  const format = await getFormatter();
  const sync = await getDocsSync();
  const year = new Date().getFullYear();

  const packages = [
    { name: "@gridkitjs/core", href: siteConfig.npm.core },
    { name: "@gridkitjs/dom", href: siteConfig.npm.dom },
    { name: "@gridkitjs/react", href: siteConfig.npm.react },
    { name: "@gridkitjs/theme-tailwind", href: siteConfig.npm.themeTailwind },
    { name: "@gridkitjs/export-xlsx", href: siteConfig.npm.exportXlsx },
  ];

  return (
    <footer className="border-site-line-inverted bg-site-bg-inverted border-t">
      <Container className="grid gap-10 py-16 sm:grid-cols-2">
        <div>
          <p className="text-site-ink-inverted text-sm font-semibold">
            GridKit
          </p>
          <p className="text-site-ink-muted-inverted mt-2 max-w-sm text-sm">
            {t("tagline")}
          </p>
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer noopener"
            className="text-site-ink-inverted mt-4 inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
          >
            <GitHubIcon className="size-4" />
            {t("githubHeading")}
          </a>
        </div>
        <div>
          <p className="text-site-ink-inverted text-sm font-semibold">
            {t("packagesHeading")}
          </p>
          <ul className="mt-3 space-y-2">
            {packages.map((pkg) => (
              <li key={pkg.name}>
                <a
                  href={pkg.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-site-ink-muted-inverted hover:text-site-ink-inverted inline-flex items-center gap-2 text-sm transition-colors"
                >
                  <NpmIcon className="size-4" />
                  {pkg.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
      <Container className="border-site-line-inverted flex flex-wrap items-center justify-between gap-2 border-t py-6">
        <div className="space-y-1">
          <p className="text-site-ink-muted-inverted text-xs">
            {t("copyright", { year })}
          </p>
          {sync && (
            <p className="text-site-ink-muted-inverted text-xs">
              {t.rich("docsSynced", {
                date: format.dateTime(sync.syncedAt, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
                sha: sync.sha.slice(0, 7),
                time: (chunks) => (
                  <RelativeTime dateTime={sync.syncedAt.toISOString()}>
                    {chunks}
                  </RelativeTime>
                ),
                commit: (chunks) => (
                  <a
                    href={getCommitUrl(sync.sha)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-site-ink-inverted hover:text-site-ink-muted-inverted font-mono underline underline-offset-2 transition-colors"
                  >
                    {chunks}
                  </a>
                ),
              })}
            </p>
          )}
        </div>
        <p className="text-site-ink-muted-inverted flex items-center gap-1.5 text-xs">
          {t.rich("credit", {
            name: (chunks) => (
              <a
                href={siteConfig.author.portfolio}
                target="_blank"
                rel="noreferrer noopener"
                className="text-site-ink-inverted hover:text-site-ink-muted-inverted underline underline-offset-2 transition-colors"
              >
                {chunks}
              </a>
            ),
          })}
          <a
            href={siteConfig.author.github}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={t("githubProfileLabel")}
            className="text-site-ink-muted-inverted hover:text-site-ink-inverted transition-colors"
          >
            <GitHubIcon className="size-3.5" />
          </a>
        </p>
      </Container>
    </footer>
  );
}
