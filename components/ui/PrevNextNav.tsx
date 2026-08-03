import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export interface PrevNextEntry {
  slug: string;
  title: string;
}

export async function PrevNextNav({
  prev,
  next,
}: {
  prev?: PrevNextEntry;
  next?: PrevNextEntry;
}) {
  if (!prev && !next) return null;

  const t = await getTranslations("common");

  return (
    <nav
      aria-label="Docs pages"
      className="border-site-line mt-12 grid gap-4 border-t pt-8 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={`/docs/${prev.slug}`}
          className="border-site-line hover:border-site-accent rounded-xl border p-4"
        >
          <p className="text-site-ink-muted text-xs">{t("prevPage")}</p>
          <p className="text-site-ink mt-1 text-sm font-medium">{prev.title}</p>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          href={`/docs/${next.slug}`}
          className="border-site-line hover:border-site-accent rounded-xl border p-4 text-right"
        >
          <p className="text-site-ink-muted text-xs">{t("nextPage")}</p>
          <p className="text-site-ink mt-1 text-sm font-medium">{next.title}</p>
        </Link>
      )}
    </nav>
  );
}
