import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export async function CtaSection() {
  const t = await getTranslations("home.cta");

  return (
    <Section variant="default">
      <Container className="pb-20">
        <div className="border-site-line bg-site-surface rounded-site flex flex-col items-start gap-6 border p-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-site-ink text-2xl font-semibold tracking-tight">
              {t("title")}
            </h2>
            <p className="text-site-ink-muted mt-2">{t("description")}</p>
          </div>
          <Button href="/docs" className="shrink-0">
            {t("button")}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
