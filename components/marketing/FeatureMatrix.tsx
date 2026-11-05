import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";
import { FEATURE_GROUPS } from "@/lib/marketing/features";

const featureCount = FEATURE_GROUPS.reduce(
  (count, group) => count + group.features.length,
  0,
);

/**
 * Every shipped feature as a hairline lattice, one column per group, each
 * label linking to its doc page. Below `lg` the columns wrap, and stack to
 * one per row on a phone, each under its own heading.
 */
export async function FeatureMatrix() {
  const t = await getTranslations("home.features");

  return (
    <Section
      variant="default"
      id="features"
      className="border-site-line border-b"
    >
      <Container className="py-20">
        <div className="max-w-2xl">
          {/* The page's one eyebrow, styled like the lattice's header cells. */}
          <p className="text-site-ink-muted mb-3 text-xs font-semibold tracking-wide uppercase">
            {t("eyebrow")}
          </p>
          <h2 className="text-site-ink text-3xl font-semibold tracking-tight">
            {t("title")}
          </h2>
          <p className="text-site-ink-muted mt-3 text-lg">
            {t.rich("subtitle", {
              count: featureCount,
              number: (chunks) => (
                <span className="text-site-ink font-mono tabular-nums">
                  {chunks}
                </span>
              ),
            })}
          </p>
        </div>

        {/* The lattice draws its top and left edges, each column its right
            and bottom, so a short last row ends cleanly. */}
        <div className="border-site-line mt-10 grid grid-cols-1 border-t border-l sm:grid-cols-2 lg:grid-cols-5">
          {FEATURE_GROUPS.map((group) => (
            <div key={group.key} className="border-site-line border-r border-b">
              <h3 className="border-site-line bg-site-surface text-site-ink-muted border-b px-4 py-2 text-xs font-semibold tracking-wide uppercase">
                {t(`groups.${group.key}`)}
              </h3>
              <ul>
                {group.features.map((feature) => (
                  <li
                    key={feature.key}
                    className="border-site-line border-b last:border-b-0"
                  >
                    <Link
                      href={`/docs/${feature.slug}`}
                      className="text-site-ink hover:bg-site-surface hover:text-site-accent block px-4 py-2.5 text-sm transition-colors"
                    >
                      {t(`items.${feature.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
