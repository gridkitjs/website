import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { findDocPage } from "@/lib/routes";
import { JsonLd, breadcrumbListJsonLd } from "@/lib/json-ld";

export async function DocsBreadcrumbs({ path }: { path: string }) {
  const locale = await getLocale();
  const t = await getTranslations("docs");
  const tCommon = await getTranslations("common");
  const found = findDocPage(path);

  const crumbs = [
    { name: tCommon("nav.docs"), path: "docs" },
    ...(found
      ? [
          {
            name: t(found.section.navLabelKey),
            path: `docs/${found.section.path}`,
          },
        ]
      : []),
    ...(found && found.page.path !== found.section.path
      ? [{ name: t(found.page.navLabelKey), path: `docs/${found.page.path}` }]
      : []),
  ];

  return (
    <nav aria-label="Breadcrumb" className="text-site-ink-muted mb-6 text-sm">
      <JsonLd data={breadcrumbListJsonLd(locale, crumbs)} />
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/docs" className="hover:text-site-ink">
            {tCommon("nav.docs")}
          </Link>
        </li>
        {found && (
          <>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/docs/${found.section.path}`}
                className="hover:text-site-ink"
              >
                {t(found.section.navLabelKey)}
              </Link>
            </li>
            {found.page.path !== found.section.path && (
              <>
                <li aria-hidden="true">/</li>
                <li className="text-site-ink" aria-current="page">
                  {t(found.page.navLabelKey)}
                </li>
              </>
            )}
          </>
        )}
      </ol>
    </nav>
  );
}
