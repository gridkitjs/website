import { codeToHtml } from "shiki";
import { cn } from "@/components/ui/cn";
import { CopyButton } from "./CopyButton";

interface CodeBlockProps {
  code: string;
  lang?: "tsx" | "ts" | "css";
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
