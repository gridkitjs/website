import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { NpmIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { PACKAGES } from "@/lib/packages";
import {
  getLatestReleases,
  npmPackageName,
  npmPackageUrl,
} from "@/lib/packages/npm";

/** Every published package as a row: its docs, its role, its version on npm. */
export async function PackagesSection() {
  const t = await getTranslations("home.packages");
  const releases = await getLatestReleases();

  return (
    <Section variant="default" className="border-site-line border-b">
      <Container className="py-20">
        <div className="max-w-2xl">
          <h2 className="text-site-ink text-3xl font-semibold tracking-tight">
            {t("title")}
          </h2>
          <p className="text-site-ink-muted mt-3 text-lg">{t("subtitle")}</p>
        </div>
        <ul className="border-site-line mt-10 border-t">
          {PACKAGES.map(({ slug }) => {
            const name = npmPackageName(slug);
            const release = releases[slug];
            return (
              <li
                key={slug}
                className="border-site-line grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1 border-b py-4 md:grid-cols-[16rem_minmax(0,1fr)_auto]"
              >
                <Link
                  href={`/docs/${slug}`}
                  className="text-site-ink hover:text-site-accent font-mono text-sm font-medium transition-colors"
                >
                  {name}
                </Link>
                <div className="flex items-center gap-4 md:order-last">
                  {release && (
                    <span className="border-site-line text-site-ink-muted rounded-site-sm border px-1.5 font-mono text-xs leading-5 tabular-nums">
                      v{release.version}
                    </span>
                  )}
                  <a
                    href={npmPackageUrl(slug)}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={t("npmLabel", { name })}
                    className="text-site-ink-muted hover:text-site-ink transition-colors"
                  >
                    <NpmIcon className="size-4" />
                  </a>
                </div>
                <p className="text-site-ink-muted col-span-2 text-sm md:col-span-1">
                  {t(`roles.${slug}`)}
                </p>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
