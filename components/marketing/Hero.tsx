import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { GitHubIcon } from "@/components/ui/icons";
import { PackageInstall } from "@/components/docs/PackageInstall";
import { Link } from "@/i18n/navigation";
import { PACKAGES } from "@/lib/packages";
import { getLatestReleases } from "@/lib/packages/npm";
import { siteConfig } from "@/lib/seo/site-config";
import { HeroGrid } from "./HeroGrid";

const INSTALL_PACKAGES = "@gridkitjs/react @gridkitjs/theme-tailwind";

// A rounded frame draws the lattice's outer edge and each cell its right and
// bottom, so a short last row ends cleanly. The list overhangs the frame by
// 1px on those sides, so the outermost cell borders sit under the frame's.
const statClassName =
  "border-site-line flex flex-col gap-0.5 border-r border-b px-4 py-3";
const statLabelClassName = "text-site-ink-muted font-mono text-xs";

export async function Hero() {
  const t = await getTranslations("home.hero");
  const releases = await getLatestReleases();

  return (
    <Section variant="default" className="border-site-line border-b">
      <Container className="grid grid-cols-1 items-center gap-10 pt-12 pb-10 lg:grid-cols-2 lg:gap-12 lg:pt-16">
        <div>
          <h1 className="text-site-ink text-4xl font-semibold tracking-tight sm:text-5xl lg:text-4xl xl:text-[2.5rem]">
            {t("titleLead")}
            <span className="text-site-ink-muted block">{t("titleTail")}</span>
          </h1>
          <p className="text-site-ink-muted mt-5 max-w-xl text-lg text-pretty">
            {t("subtitle")}
          </p>
          <PackageInstall pkg={INSTALL_PACKAGES} className="mt-7 mb-0" />
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button href="/docs">{t("primaryCta")}</Button>
            <Button
              href={siteConfig.github}
              external
              variant="secondary"
              className="gap-2"
            >
              <GitHubIcon className="size-4" />
              {t("secondaryCta")}
            </Button>
          </div>
        </div>
        <HeroGrid />
      </Container>

      <Container className="pb-12 lg:pb-16">
        <div className="border-site-line rounded-site overflow-hidden border">
          <dl className="-mr-px -mb-px grid grid-cols-2 text-sm sm:grid-cols-4 lg:grid-cols-7">
            {PACKAGES.map(({ slug }) => {
              const release = releases[slug];
              return (
                <div key={slug} className={statClassName}>
                  <dt className={statLabelClassName}>{slug}</dt>
                  <dd>
                    <Link
                      href={`/changelog/${slug}`}
                      className="text-site-ink hover:text-site-accent font-mono tabular-nums transition-colors"
                    >
                      {release ? `v${release.version}` : t("changelog")}
                    </Link>
                  </dd>
                </div>
              );
            })}
            <div className={statClassName}>
              <dt className={statLabelClassName}>{t("licenseLabel")}</dt>
              <dd className="text-site-ink font-mono">MIT</dd>
            </div>
            <div className={statClassName}>
              <dt className={statLabelClassName}>{t("languageLabel")}</dt>
              <dd className="text-site-ink font-mono">TypeScript</dd>
            </div>
          </dl>
        </div>
      </Container>
    </Section>
  );
}
