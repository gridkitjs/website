import type { ReactNode } from "react";
import { DocsBreadcrumbs } from "./DocsBreadcrumbs";
import { Prose } from "@/components/ui/Prose";

export function DocPage({
  path,
  title,
  description,
  children,
}: {
  path: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <article>
      <DocsBreadcrumbs path={path} />
      <h1 className="text-site-ink text-3xl font-semibold tracking-tight">
        {title}
      </h1>
      <p className="text-site-ink-muted mt-3 text-lg">{description}</p>
      <Prose className="mt-8">{children}</Prose>
    </article>
  );
}
