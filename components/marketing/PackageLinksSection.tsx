import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/seo/site-config";

export async function PackageLinksSection() {
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
        <h2 className="text-site-ink text-3xl font-semibold tracking-tight">
          {t("title")}
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {packages.map((pkg) => (
            <a
              key={pkg.name}
              href={pkg.href}
              target="_blank"
              rel="noreferrer noopener"
              className="border-site-line bg-site-bg hover:border-site-accent block rounded-2xl border p-6 transition-colors"
            >
              <p className="text-site-ink font-mono text-sm font-medium">
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
