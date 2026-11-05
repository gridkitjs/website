"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Button, buttonClasses } from "@/components/ui/Button";
import { siteConfig } from "@/lib/seo/site-config";

/** The open page's package docs folder on GitHub, or the packages folder when the path names no package. */
function docsFolderUrl(pathname: string): string {
  const pkg = /^\/docs\/([^/]+)/.exec(pathname)?.[1];
  const packages = `${siteConfig.github}/tree/main/packages`;
  return pkg ? `${packages}/${pkg}/docs` : packages;
}

// Doc pages render content fetched from GitHub, so a GitHub outage or a page
// whose MDX fails to compile lands here, inside the docs chrome, rather than
// on Next's unstyled error page.
export default function DocsError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("docs.error");
  const pathname = usePathname();

  return (
    <div className="flex flex-col items-start gap-4 py-8">
      <h1 className="text-site-ink text-3xl font-semibold tracking-tight">
        {t("title")}
      </h1>
      <p className="text-site-ink-muted max-w-xl text-lg">{t("description")}</p>
      <div className="mt-2 flex flex-wrap gap-3">
        <button type="button" onClick={retry} className={buttonClasses()}>
          {t("retry")}
        </button>
        <Button href={docsFolderUrl(pathname)} variant="secondary" external>
          {t("viewOnGithub")}
        </Button>
      </div>
      {error.digest && (
        <p className="text-site-ink-muted text-xs">
          {t("digest", { digest: error.digest })}
        </p>
      )}
    </div>
  );
}
