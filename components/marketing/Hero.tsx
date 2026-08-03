import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/seo/site-config";

export async function Hero() {
  const t = await getTranslations("home.hero");

  return (
    <Section variant="gradient" className="overflow-hidden">
      <div className="mx-auto mt-14 max-w-md">
        <Image
          src="/brand/gridkit-header.svg"
          alt="GridKit"
          width={1920}
          height={950}
          priority
          sizes="(min-width: 896px) 896px, 100vw"
          className="h-auto w-full"
        />
      </div>
      <Container className="relative pt-14 pb-20 text-center sm:pt-18 sm:pb-28">
        <h1 className="mx-auto max-w-3xl bg-[linear-gradient(to_bottom,#fff,#cbd5e1)] bg-clip-text text-4xl font-semibold tracking-tight text-balance text-transparent sm:text-6xl">
          {t("title")}
        </h1>
        <p className="text-site-ink-muted-inverted mx-auto mt-6 max-w-2xl text-lg text-balance">
          {t("subtitle")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button href="/docs">{t("primaryCta")}</Button>
          <Button
            href={siteConfig.github}
            external
            variant="secondary-inverted"
          >
            {t("secondaryCta")}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
