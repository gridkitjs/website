import { codeToHtml, type BundledLanguage } from "shiki";
import { cn } from "@/components/ui/cn";
import { CopyButton } from "./CopyButton";

/** Any language Shiki bundles, or `"text"` for unhighlighted plain text. */
export type CodeLanguage = BundledLanguage | "text";

interface CodeBlockProps {
  code: string;
  lang?: CodeLanguage;
  className?: string;
}

export async function CodeBlock({
  code,
  lang = "tsx",
  className,
}: CodeBlockProps) {
  const trimmed = code.trim();
  const html = await codeToHtml(trimmed, {
    lang,
    // Colours come out as --shiki-light/--shiki-dark variables, which
    // globals.css picks between by theme.
    themes: { light: "github-light", dark: "github-dark-dimmed" },
    defaultColor: false,
  });

  return (
    <div
      className={cn(
        "border-site-code-border bg-site-code-bg relative overflow-hidden rounded-xl border text-sm",
        className,
      )}
    >
      <CopyButton code={trimmed} />
      <div
        className="overflow-x-auto [&_pre]:p-4 [&_pre]:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
