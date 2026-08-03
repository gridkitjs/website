import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/marketing/Hero";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { StorySection } from "@/components/marketing/StorySection";
import { PackageLinksSection } from "@/components/marketing/PackageLinksSection";
import { CtaSection } from "@/components/marketing/CtaSection";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.hero" });

  return buildMetadata({
    title: "GridKit — a headless data-grid toolkit",
    description: t("subtitle"),
    path: "",
    locale,
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <FeatureGrid />
      <StorySection />
      <PackageLinksSection />
      <CtaSection />
    </>
  );
}
