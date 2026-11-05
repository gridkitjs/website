import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ThemeScript } from "@/components/layout/ThemeScript";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/json-ld";
import { siteConfig } from "@/lib/seo/site-config";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: siteConfig.themeColor.light,
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: siteConfig.themeColor.dark,
    },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    metadataBase: new URL(siteConfig.baseUrl),
    title: {
      template: "%s · GridKit",
      default: "GridKit — a headless data-grid toolkit",
    },
    description:
      "GridKit is a headless, framework-agnostic data-grid toolkit for TypeScript and React.",
    alternates: {
      languages: Object.fromEntries([
        ...routing.locales.map((candidate) => [
          candidate,
          `${siteConfig.baseUrl}/${candidate}`,
        ]),
        ["x-default", `${siteConfig.baseUrl}/${routing.defaultLocale}`],
      ]),
    },
    openGraph: {
      locale,
    },
    icons: {
      icon: [
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const t = await getTranslations("common");

  // The theme script adds `.dark` or `.light` to `<html>` before hydration.
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          <JsonLd data={organizationJsonLd()} />
          <JsonLd data={websiteJsonLd(locale)} />
          <a
            href="#main"
            className="bg-site-surface-raised text-site-ink border-site-line rounded-site sr-only z-50 border px-4 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
          >
            {t("skipToContent")}
          </a>
          <SiteHeader />
          {/* Focusable so the skip link moves focus, not just the scroll. */}
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <SiteFooter />
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
