import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
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
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <DocsSidebar sections={tree.sections} latestVersions={latestVersions} />
      </aside>
      <div className="min-w-0">{children}</div>
    </Container>
  );
}
