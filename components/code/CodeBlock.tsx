import { codeToHtml } from "shiki";
import { cn } from "@/components/ui/cn";

interface CodeBlockProps {
  code: string;
  lang?: "tsx" | "ts";
  className?: string;
}

export async function CodeBlock({
  code,
  lang = "tsx",
  className,
}: CodeBlockProps) {
  const html = await codeToHtml(code.trim(), {
    lang,
    theme: "github-light",
  });

  return (
    <div
      className={cn(
        "border-site-line bg-site-surface overflow-x-auto rounded-xl border text-sm [&_pre]:p-4 [&_pre]:leading-relaxed",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
