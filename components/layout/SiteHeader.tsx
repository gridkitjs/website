import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HomeIcon } from "@/components/ui/icons";
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
            className="text-site-ink flex items-center gap-2 transition-opacity hover:opacity-70"
          >
            <HomeIcon className="size-5" />
          </Link>
          <Link
            href="/docs"
            className="text-site-ink text-sm font-medium transition-opacity hover:opacity-70"
          >
            {t("docs")}
          </Link>
        </nav>
      </Container>
    </header>
  );
}
