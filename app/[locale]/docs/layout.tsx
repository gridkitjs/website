import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { toDocsNav } from "@/lib/docs/nav";
import { getDocsTree } from "@/lib/docs/source";
import { getLatestReleases } from "@/lib/packages/npm";

export default async function DocsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [tree, releases] = await Promise.all([
    getDocsTree(),
    getLatestReleases(),
  ]);
  const latestVersions = Object.fromEntries(
    Object.entries(releases).map(([slug, release]) => [slug, release.version]),
  );

  return (
    <Container className="grid max-w-7xl gap-10 py-12 lg:grid-cols-[220px_1fr] lg:gap-16 lg:py-16">
      {/* Scrolls on its own once taller than the viewport below the header;
          the negative margin keeps link focus rings clear of its clipping. */}
      <aside className="lg:sticky lg:top-24 lg:-m-2 lg:max-h-[calc(100vh-7.5rem)] lg:self-start lg:overflow-y-auto lg:p-2">
        <DocsSidebar
          sections={toDocsNav(tree.sections)}
          latestVersions={latestVersions}
        />
      </aside>
      <div className="min-w-0">{children}</div>
    </Container>
  );
}
