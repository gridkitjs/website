import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";

/**
 * A link written in docs content. Site-absolute hrefs (`/docs/...`) go
 * through next-intl's Link so they pick up the current locale prefix. Only
 * http(s) links leave the site, so only they open a new tab; in-page
 * `#anchor` and relative links stay in this one.
 */
export function DocLink({ href = "", ...props }: ComponentProps<"a">) {
  if (href.startsWith("/")) {
    return <Link href={href} {...props} />;
  }
  if (/^https?:\/\//.test(href)) {
    return <a href={href} target="_blank" rel="noreferrer" {...props} />;
  }
  return <a href={href} {...props} />;
}
