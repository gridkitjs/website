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
    theme: "github-light",
  });

  return (
    <div
      className={cn(
        "border-site-line bg-site-surface relative overflow-hidden rounded-xl border text-sm",
        className,
      )}
    >
      <CopyButton code={trimmed} />
      <div
        className="overflow-x-auto [&_pre]:bg-transparent! [&_pre]:p-4 [&_pre]:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
