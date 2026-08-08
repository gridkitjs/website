import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";

const richComponents = {
  b: (chunks: ReactNode) => (
    <strong className="text-site-ink font-semibold">{chunks}</strong>
  ),
  accent: (chunks: ReactNode) => (
    <span className="text-site-accent font-semibold">{chunks}</span>
  ),
};

const paragraphKeys = ["p1", "p2", "p3", "p4"] as const;

export async function StorySection() {
  const t = await getTranslations("home.story");

  return (
    <Section variant="default">
      <Container className="py-24">
        <div className="max-w-2xl">
          <h2 className="text-site-ink text-3xl font-semibold tracking-tight">
            {t("title")}
          </h2>
          <p className="text-site-ink mt-3 text-lg font-medium italic">
            {t("lede")}
          </p>
        </div>
        <div className="mt-8 max-w-2xl space-y-5">
          {paragraphKeys.map((key) => (
            <p
              key={key}
              className="text-site-ink-muted text-justify text-base leading-relaxed"
            >
              {t.rich(`paragraphs.${key}`, richComponents)}
            </p>
          ))}
        </div>
      </Container>
    </Section>
  );
}
