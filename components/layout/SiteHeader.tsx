import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";

export async function SiteHeader() {
  const t = await getTranslations("common.nav");

  return (
    <header className="border-site-line/60 bg-site-bg/80 supports-[backdrop-filter]:bg-site-bg/60 sticky top-0 z-40 border-b backdrop-blur-md">
      <Container>
        <nav className="flex h-14 items-center justify-between">
          <Link
            href="/"
            aria-label={t("home")}
            className="flex items-center gap-2 transition-opacity hover:opacity-70"
          >
            <Image
              src="/brand/grid-kit-logo.svg"
              alt=""
              width={24}
              height={24}
              className="size-6"
              priority
            />
            <span className="text-site-accent text-sm font-semibold">
              GridKit
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/changelog"
              className="text-site-ink text-sm font-medium transition-opacity hover:opacity-70"
            >
              {t("changelog")}
            </Link>
            <Link
              href="/docs"
              className="text-site-ink text-sm font-medium transition-opacity hover:opacity-70"
            >
              {t("docs")}
            </Link>
          </div>
        </nav>
      </Container>
    </header>
  );
}
