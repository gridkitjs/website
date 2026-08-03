import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { JsonLd, breadcrumbListJsonLd } from "@/lib/json-ld";

export interface Crumb {
  name: string;
  path: string;
}

/** `crumbs` holds only the entries after `root`. */
export async function Breadcrumbs({
  root,
  crumbs,
}: {
  root: Crumb;
  crumbs: Crumb[];
}) {
  const locale = await getLocale();

  return (
    <nav aria-label="Breadcrumb" className="text-site-ink-muted mb-6 text-sm">
      <JsonLd data={breadcrumbListJsonLd(locale, [root, ...crumbs])} />
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href={`/${root.path}`} className="hover:text-site-ink">
            {root.name}
          </Link>
        </li>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.path} className="flex items-center gap-1.5">
              <span aria-hidden="true">/</span>
              {isLast ? (
                <span className="text-site-ink" aria-current="page">
                  {crumb.name}
                </span>
              ) : (
                <Link href={`/${crumb.path}`} className="hover:text-site-ink">
                  {crumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
