import { getTranslations } from "next-intl/server";
import { cn } from "@/components/ui/cn";

interface PendingExampleProps {
  /** The unregistered tag's name, kept on the element for debugging. */
  tag: string;
  /** `"true"` when the tag sat inside a paragraph. */
  inline?: string;
}

/**
 * Stands in for a tag the MDX component map doesn't register, typically a
 * live example a doc page names before it ships here. Rendered in place of
 * the tag by `remarkUnregisteredTags` (`lib/docs/remark-unregistered-tags.ts`).
 */
export async function PendingExample({ tag, inline }: PendingExampleProps) {
  const t = await getTranslations("docs.content.example");
  const isInline = inline === "true";
  const Box = isInline ? "span" : "div";

  return (
    <Box
      role="note"
      data-tag={tag}
      className={cn(
        "border-site-line bg-site-surface text-site-ink-muted rounded-site border border-dashed text-sm",
        isInline ? "inline-block px-2" : "my-6 px-4 py-6 text-center",
      )}
    >
      {t("pending")}
    </Box>
  );
}
