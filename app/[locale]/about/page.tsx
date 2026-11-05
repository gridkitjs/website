import type { ReactNode } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";
import { Link } from "@/i18n/navigation";
import { buildMetadata } from "@/lib/seo/metadata";

const paragraphKeys = ["p1", "p2", "p3", "p4"] as const;

const richComponents = {
  b: (chunks: ReactNode) => <strong>{chunks}</strong>,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return buildMetadata({
    title: t("metaTitle"),
    description: t("description"),
    path: "about",
    locale,
  });
}

/** The story behind GridKit, in full; the home page carries a teaser. */
export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <Container className="max-w-3xl py-12 lg:py-16">
      <h1 className="text-site-ink text-3xl font-semibold tracking-tight sm:text-4xl">
        {t("title")}
      </h1>
      <Prose className="mt-8">
        {paragraphKeys.map((key) => (
          <p key={key}>{t.rich(`paragraphs.${key}`, richComponents)}</p>
        ))}
      </Prose>
      <p className="mt-10 text-sm">
        <Link
          href="/docs"
          className="text-site-accent hover:text-site-accent-hover font-medium transition-colors"
        >
          {t("docsCta")}
        </Link>
      </p>
    </Container>
  );
}
