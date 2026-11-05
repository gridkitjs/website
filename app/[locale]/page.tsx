import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/marketing/Hero";
import { FeatureMatrix } from "@/components/marketing/FeatureMatrix";
import { HeadlessSection } from "@/components/marketing/HeadlessSection";
import { PackagesSection } from "@/components/marketing/PackagesSection";
import { StorySection } from "@/components/marketing/StorySection";
import { CtaSection } from "@/components/marketing/CtaSection";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.meta" });

  return buildMetadata({
    title: t("title"),
    description: t("description"),
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
      <FeatureMatrix />
      <HeadlessSection />
      <PackagesSection />
      <StorySection />
      <CtaSection />
    </>
  );
}
