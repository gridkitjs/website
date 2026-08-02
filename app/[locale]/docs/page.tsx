import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "docs.index" });

  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "docs",
    locale,
  });
}

export default async function DocsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("docs.index");

  const cards = [
    {
      href: "/docs/react",
      title: t("reactCard.title"),
      description: t("reactCard.description"),
    },
    {
      href: "/docs/core",
      title: t("coreCard.title"),
      description: t("coreCard.description"),
    },
    {
      href: "/docs/theme-tailwind",
      title: t("themeCard.title"),
      description: t("themeCard.description"),
    },
  ];

  return (
    <div>
      <h1 className="text-site-ink text-3xl font-semibold tracking-tight">
        {t("title")}
      </h1>
      <p className="text-site-ink-muted mt-3 max-w-2xl text-lg">{t("intro")}</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="border-site-line hover:border-site-accent block rounded-2xl border p-6 transition-colors"
          >
            <p className="text-site-ink font-mono text-sm font-medium">
              {card.title}
            </p>
            <p className="text-site-ink-muted mt-2 text-sm leading-relaxed">
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
