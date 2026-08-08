import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";
import { cn } from "@/components/ui/cn";

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
      </Container>
    </Section>
  );
}
