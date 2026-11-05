import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { ChangelogSidebar } from "@/components/changelog/ChangelogSidebar";
import { getChangelogTree } from "@/lib/changelog/source";

export default async function ChangelogLayout({
  children,
}: {
  children: ReactNode;
}) {
  const tree = await getChangelogTree();

  return (
    <Container className="grid max-w-7xl gap-10 py-12 lg:grid-cols-[220px_1fr] lg:gap-16 lg:py-16">
      {/* Scrolls on its own once taller than the viewport below the header;
          the negative margin keeps link focus rings clear of its clipping. */}
      <aside className="lg:sticky lg:top-24 lg:-m-2 lg:max-h-[calc(100vh-7.5rem)] lg:self-start lg:overflow-y-auto lg:p-2">
        <ChangelogSidebar sections={tree.sections} />
      </aside>
      <div className="min-w-0">{children}</div>
    </Container>
  );
}
