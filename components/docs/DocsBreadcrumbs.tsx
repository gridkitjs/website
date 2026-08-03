import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { JsonLd, breadcrumbListJsonLd } from "@/lib/json-ld";

export interface Crumb {
  name: string;
  path: string;
}

/** `crumbs` holds only the section/page entries; the "Docs" root crumb is added here. */
export async function DocsBreadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  const locale = await getLocale();
  const tCommon = await getTranslations("common");
  const docsRoot: Crumb = { name: tCommon("nav.docs"), path: "docs" };

  return (
    <nav aria-label="Breadcrumb" className="text-site-ink-muted mb-6 text-sm">
      <JsonLd data={breadcrumbListJsonLd(locale, [docsRoot, ...crumbs])} />
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/docs" className="hover:text-site-ink">
            {docsRoot.name}
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
