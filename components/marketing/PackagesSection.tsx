import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { NpmIcon } from "@/components/ui/icons";
import { siteConfig } from "@/lib/seo/site-config";

export async function PackagesSection() {
  const t = await getTranslations("home.packages");

  const packages = [
    {
      name: t("core.name"),
      description: t("core.description"),
      href: siteConfig.npm.core,
    },
    {
      name: t("react.name"),
      description: t("react.description"),
      href: siteConfig.npm.react,
    },
    {
      name: t("themeTailwind.name"),
      description: t("themeTailwind.description"),
      href: siteConfig.npm.themeTailwind,
    },
  ];

  return (
    <Section variant="muted">
      <Container className="py-24">
        <div className="max-w-2xl">
          <h2 className="text-site-ink text-3xl font-semibold tracking-tight">
            {t("title")}
          </h2>
          <p className="text-site-ink-muted mt-3 text-lg">{t("subtitle")}</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {packages.map((pkg) => (
            <a
              key={pkg.name}
              href={pkg.href}
              target="_blank"
              rel="noreferrer noopener"
              className="border-site-line bg-site-bg hover:border-site-accent block rounded-2xl border p-6 transition-colors"
            >
              <p className="text-site-ink flex items-center gap-2 font-mono text-sm font-medium">
                <NpmIcon className="size-4" />
                {pkg.name}
              </p>
              <p className="text-site-ink-muted mt-2 text-sm leading-relaxed">
                {pkg.description}
              </p>
            </a>
          ))}
        </div>
      </Container>
    </Section>
  );
}
