import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { JsonLd, breadcrumbListJsonLd } from "@/lib/json-ld";

export interface Crumb {
  name: string;
  /** Omitted for a crumb with no page of its own, shown as plain text. */
  path?: string;
}

interface LinkedCrumb extends Crumb {
  path: string;
}

function isLinked(crumb: Crumb): crumb is LinkedCrumb {
  return crumb.path !== undefined;
}

/** `crumbs` holds only the entries after `root`. */
export async function Breadcrumbs({
  root,
  crumbs,
}: {
  root: LinkedCrumb;
  crumbs: Crumb[];
}) {
  const locale = await getLocale();

  return (
    <nav aria-label="Breadcrumb" className="text-site-ink-muted mb-6 text-sm">
      {/* Structured data lists only crumbs a search result can link to. */}
      <JsonLd
        data={breadcrumbListJsonLd(locale, [root, ...crumbs.filter(isLinked)])}
      />
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link
            href={`/${root.path}`}
            className="hover:text-site-ink transition-colors"
          >
            {root.name}
          </Link>
        </li>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li
              key={crumb.path ?? crumb.name}
              className="flex items-center gap-1.5"
            >
              <span aria-hidden="true">/</span>
              {isLast ? (
                <span className="text-site-ink" aria-current="page">
                  {crumb.name}
                </span>
              ) : crumb.path === undefined ? (
                <span>{crumb.name}</span>
              ) : (
                <Link
                  href={`/${crumb.path}`}
                  className="hover:text-site-ink transition-colors"
                >
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
