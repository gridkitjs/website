import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";

interface Feature {
  title: string;
  description: string;
}

export async function FeatureGrid() {
  const t = await getTranslations("home.features");
  const items = t.raw("items") as Feature[];

  return (
    <Section variant="default">
      <Container className="py-24">
        <div className="max-w-2xl">
          <h2 className="text-site-ink text-3xl font-semibold tracking-tight">
            {t("title")}
          </h2>
          <p className="text-site-ink-muted mt-3 text-lg">{t("subtitle")}</p>
        </div>
        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {items.map((feature) => (
            <div key={feature.title}>
              <h3 className="text-site-ink text-base font-semibold">
                {feature.title}
              </h3>
              <p className="text-site-ink-muted mt-2 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
