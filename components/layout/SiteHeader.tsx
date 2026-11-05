import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { GitHubIcon } from "@/components/ui/icons";
import { siteConfig } from "@/lib/seo/site-config";
import { HeaderNav } from "./HeaderNav";

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
          </div>
        </nav>
      </Container>
    </header>
  );
}
