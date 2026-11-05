import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { buttonClasses } from "@/components/ui/Button";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

// An unmatched URL has no locale segment to read, so this page speaks the
// default locale.
function getNotFoundTranslations() {
  return getTranslations({
    locale: routing.defaultLocale,
    namespace: "common.notFound",
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getNotFoundTranslations();
  return {
    title: `${t("title")} · GridKit`,
    description: t("description"),
  };
}

export default async function GlobalNotFound() {
  const t = await getNotFoundTranslations();

  return (
    <html
      lang={routing.defaultLocale}
      className={`${geistSans.variable} antialiased`}
    >
      <body className="bg-site-bg text-site-ink flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-site-accent text-sm font-medium">404</p>
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-site-ink-muted max-w-md">{t("description")}</p>
        <Link href="/" className={buttonClasses()}>
          {t("backHome")}
        </Link>
      </body>
    </html>
  );
}
