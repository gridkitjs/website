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
    <Container className="grid gap-10 py-12 lg:grid-cols-[220px_1fr] lg:gap-16 lg:py-16">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <ChangelogSidebar sections={tree.sections} />
      </aside>
      <div className="min-w-0">{children}</div>
    </Container>
  );
}
