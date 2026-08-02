import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { GitHubIcon, NpmIcon } from "@/components/ui/icons";
import { siteConfig } from "@/lib/seo/site-config";

export async function SiteFooter() {
  const t = await getTranslations("common.footer");
  const year = new Date().getFullYear();

  const packages = [
    { name: "@gridkitjs/core", href: siteConfig.npm.core },
    { name: "@gridkitjs/react", href: siteConfig.npm.react },
    { name: "@gridkitjs/theme-tailwind", href: siteConfig.npm.themeTailwind },
  ];

  return (
    <footer className="border-site-line bg-site-bg border-t">
      <Container className="grid gap-10 py-16 sm:grid-cols-2">
        <div>
          <p className="text-site-ink text-sm font-semibold">GridKit</p>
          <p className="text-site-ink-muted mt-2 max-w-sm text-sm">
            {t("tagline")}
          </p>
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer noopener"
            className="text-site-ink mt-4 inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
          >
            <GitHubIcon className="size-4" />
            {t("githubHeading")}
          </a>
        </div>
        <div>
          <p className="text-site-ink text-sm font-semibold">
            {t("packagesHeading")}
          </p>
          <ul className="mt-3 space-y-2">
            {packages.map((pkg) => (
              <li key={pkg.name}>
                <a
                  href={pkg.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-site-ink-muted hover:text-site-ink inline-flex items-center gap-2 text-sm transition-colors"
                >
                  <NpmIcon className="size-4" />
                  {pkg.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
      <Container className="border-site-line flex flex-wrap items-center justify-between gap-2 border-t py-6">
        <p className="text-site-ink-muted text-xs">
          {t("copyright", { year })}
        </p>
        <p className="text-site-ink-muted flex items-center gap-1.5 text-xs">
          {t.rich("credit", {
            name: (chunks) => (
              <a
                href={siteConfig.author.portfolio}
                target="_blank"
                rel="noreferrer noopener"
                className="text-site-ink hover:text-site-accent underline underline-offset-2 transition-colors"
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
            className="text-site-ink-muted hover:text-site-ink transition-colors"
          >
            <GitHubIcon className="size-3.5" />
          </a>
        </p>
      </Container>
    </footer>
  );
}
