import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export interface PrevNextEntry {
  href: string;
  title: string;
}

export async function PrevNextNav({
  labels,
  prev,
  next,
}: {
  /** Overrides the default "Previous"/"Next" labels, e.g. changelog's "Newer"/"Older". */
  labels?: { prev: string; next: string };
  prev?: PrevNextEntry;
  next?: PrevNextEntry;
}) {
  if (!prev && !next) return null;

  const t = await getTranslations("common");
  const prevLabel = labels?.prev ?? t("prevPage");
  const nextLabel = labels?.next ?? t("nextPage");

  return (
    <nav
      aria-label="Pages"
      className="border-site-line mt-12 grid gap-4 border-t pt-8 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={prev.href}
          className="border-site-line hover:border-site-accent rounded-xl border p-4"
        >
          <p className="text-site-ink-muted text-xs">{prevLabel}</p>
          <p className="text-site-ink mt-1 text-sm font-medium">{prev.title}</p>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          href={next.href}
          className="border-site-line hover:border-site-accent rounded-xl border p-4 text-right"
        >
          <p className="text-site-ink-muted text-xs">{nextLabel}</p>
          <p className="text-site-ink mt-1 text-sm font-medium">{next.title}</p>
        </Link>
      )}
    </nav>
  );
}
