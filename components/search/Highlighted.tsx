interface HighlightedProps {
  text: string;
  /** Lowercased words to mark wherever one starts a word in `text`. */
  matches: string[];
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** `text` with every word the search matched wrapped in `<mark>`. */
export function Highlighted({ text, matches }: HighlightedProps) {
  if (matches.length === 0) return text;
  // Longest first, so "sorting" wins over "sort" where both match.
  const alternatives = [...matches]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|");
  // With a capturing group, `split` keeps the matches at the odd indexes.
  return text.split(new RegExp(`\\b(${alternatives})`, "gi")).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="text-site-accent bg-transparent font-medium">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
