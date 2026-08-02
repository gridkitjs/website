import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export async function CtaSection() {
  const t = await getTranslations("home.cta");

  return (
    <Section variant="default">
      <Container className="border-site-line flex flex-col items-center gap-6 border-t py-24 text-center">
        <h2 className="text-site-ink text-3xl font-semibold tracking-tight">
          {t("title")}
        </h2>
        <p className="text-site-ink-muted max-w-xl">{t("description")}</p>
        <Button href="/docs">{t("button")}</Button>
      </Container>
    </Section>
  );
}
