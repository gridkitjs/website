import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { BackToTop } from "@/components/docs/BackToTop";
import { DocsMobileNav } from "@/components/docs/DocsMobileNav";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { toDocsNav } from "@/lib/docs/nav";
import { getDocsTree } from "@/lib/docs/source";
import { getLatestReleases } from "@/lib/packages/npm";

export default async function DocsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [tree, releases, t] = await Promise.all([
    getDocsTree(),
    getLatestReleases(),
    getTranslations("docs.landmarks"),
  ]);
  const sections = toDocsNav(tree.sections);
  const latestVersions = Object.fromEntries(
    Object.entries(releases).map(([slug, release]) => [slug, release.version]),
  );

  return (
    <>
      <DocsMobileNav sections={sections} latestVersions={latestVersions} />
      <Container className="grid max-w-7xl gap-10 py-8 lg:grid-cols-[220px_1fr] lg:gap-16 lg:py-16">
        {/* Scrolls on its own once taller than the viewport below the header;
            the negative margin keeps link focus rings clear of its clipping. */}
        <aside
          aria-label={t("sidebar")}
          className="hidden lg:sticky lg:top-24 lg:-m-2 lg:block lg:max-h-[calc(100vh-7.5rem)] lg:self-start lg:overflow-y-auto lg:p-2"
        >
          <DocsSidebar sections={sections} latestVersions={latestVersions} />
        </aside>
        <div className="min-w-0">{children}</div>
      </Container>
      <BackToTop />
    </>
  );
}
