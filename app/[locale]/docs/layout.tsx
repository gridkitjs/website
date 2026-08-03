import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { getDocsTree } from "@/lib/docs/source";

export default async function DocsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const tree = await getDocsTree();

  return (
    <Container className="grid gap-10 py-12 lg:grid-cols-[220px_1fr] lg:gap-16 lg:py-16">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <DocsSidebar sections={tree.sections} />
      </aside>
      <div className="min-w-0">{children}</div>
    </Container>
  );
}
