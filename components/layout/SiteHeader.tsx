import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { GitHubIcon, GridKitMark } from "@/components/ui/icons";
import { SearchDialog } from "@/components/search/SearchDialog";
import { SearchTrigger } from "@/components/search/SearchTrigger";
import { siteConfig } from "@/lib/seo/site-config";
import { HeaderNav } from "./HeaderNav";
import { ThemeToggle } from "./ThemeToggle";

export async function SiteHeader() {
  const t = await getTranslations("common.nav");

  return (
    <header className="border-site-line/60 bg-site-bg/80 supports-[backdrop-filter]:bg-site-bg/60 sticky top-0 z-40 border-b backdrop-blur-md">
      <Container>
        <nav className="flex h-14 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-70"
          >
            <GridKitMark className="size-6" />
            <span className="text-site-accent text-sm font-semibold">
              GridKit
            </span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <SearchTrigger />
            <HeaderNav />
            <a
              href={siteConfig.github}
              target="_blank"
              rel="noreferrer"
              aria-label={t("github")}
              className="text-site-ink transition-opacity hover:opacity-70"
            >
              <GitHubIcon className="size-5" />
            </a>
            <ThemeToggle />
          </div>
        </nav>
      </Container>
      <SearchDialog />
    </header>
  );
}
