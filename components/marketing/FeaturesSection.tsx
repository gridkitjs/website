import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { NpmIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { cn } from "@/components/ui/cn";
import { siteConfig } from "@/lib/seo/site-config";

interface Feature {
  title: string;
  description: string;
  docsSlug?: string;
}

const cardClassName =
  "rounded-2xl border border-site-line p-6 transition-colors";

export async function FeaturesSection() {
  const t = await getTranslations("home");
  const features = t.raw("features.items") as Feature[];

  const packages = [
    { name: t("packages.core.name"), href: siteConfig.npm.core },
    { name: t("packages.react.name"), href: siteConfig.npm.react },
    { name: t("packages.themeTailwind.name"), href: siteConfig.npm.themeTailwind },
  ];

  return (
    <Section variant="default">
      <Container className="py-24">
        <div className="max-w-2xl">
          <h2 className="text-site-ink text-3xl font-semibold tracking-tight">
            {t("features.title")}
          </h2>
          <p className="text-site-ink-muted mt-3 text-lg">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const body = (
              <>
                <h3 className="text-site-ink text-base font-semibold">
                  {feature.title}
                </h3>
                <p className="text-site-ink-muted mt-2 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </>
            );

            return feature.docsSlug ? (
              <Link
                key={feature.title}
                href={`/docs/${feature.docsSlug}`}
                className={cn(cardClassName, "hover:border-site-accent block")}
              >
                {body}
              </Link>
            ) : (
              <div key={feature.title} className={cardClassName}>
                {body}
              </div>
            );
          })}
        </div>

        <div className="border-site-line mt-14 border-t pt-10">
          <p className="text-site-ink-muted text-sm font-medium tracking-wide uppercase">
            {t("packages.title")}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {packages.map((pkg) => (
              <Button
                key={pkg.name}
                href={pkg.href}
                external
                variant="secondary"
                className="gap-2 px-4 py-1.5 font-mono text-xs normal-case"
              >
                <NpmIcon className="size-4" />
                {pkg.name}
              </Button>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
