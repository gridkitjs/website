import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { CodeBlock } from "@/components/code/CodeBlock";
import { localSourcesOf, type ExampleDetails } from "@/lib/docs/examples";
import { ExampleTabs, type StackblitzTarget } from "./ExampleTabs";

interface LiveExampleFrameProps {
  title: string;
  /**
   * A registered example: adds its description, Preview and Code tabs,
   * Reset and "Open in StackBlitz". Without one the frame just holds
   * `children`.
   */
  example?: ExampleDetails;
  children: ReactNode;
}

function stackblitzTarget(example: ExampleDetails): StackblitzTarget {
  const { meta } = example;
  if (meta.stackblitz) return { path: meta.stackblitz };
  return {
    project: {
      id: meta.id,
      title: meta.title,
      description: meta.description,
      fileName: example.fileName,
      source: example.source,
      localSources: localSourcesOf(example),
      dependencies: example.dependencies,
    },
  };
}

// The accent-tinted border and header bar set a running example apart from
// the neutral code blocks around it.
export async function LiveExampleFrame({
  title,
  example,
  children,
}: LiveExampleFrameProps) {
  const t = await getTranslations("common");

  return (
    <div className="border-site-accent/30 bg-site-bg rounded-site my-6 border">
      <div className="border-site-accent/30 bg-site-accent-soft rounded-t-site flex items-start justify-between gap-3 border-b px-4 py-2.5">
        <div className="min-w-0">
          <p className="text-site-ink text-sm font-medium">{title}</p>
          {example && (
            <p className="text-site-ink-muted mt-0.5 text-xs">
              {example.meta.description}
            </p>
          )}
        </div>
        <span className="text-site-accent inline-flex shrink-0 items-center gap-1.5 pt-0.5 text-xs font-medium tracking-wide uppercase">
          <span
            aria-hidden="true"
            className="bg-site-accent size-1.5 rounded-full"
          />
          {t("liveExample")}
        </span>
      </div>
      {example ? (
        <ExampleTabs
          code={
            <CodeBlock
              code={example.source}
              title={example.fileName}
              className="rounded-b-site rounded-t-none border-0"
            />
          }
          stackblitz={stackblitzTarget(example)}
          minHeight={example.meta.minHeight}
        >
          {children}
        </ExampleTabs>
      ) : (
        <div className="overflow-x-auto p-4">{children}</div>
      )}
    </div>
  );
}
