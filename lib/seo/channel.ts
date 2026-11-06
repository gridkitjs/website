import "server-only";
import { siteConfig } from "./site-config";

/** gridkitjs.com, the production site. */
export const PRODUCTION_URL = "https://gridkitjs.com";

/**
 * True on next.gridkitjs.com, the build of the `development` branch with
 * `SITE_CHANNEL=next`, which previews unreleased GridKit. It must stay out of
 * search engines: robots.txt disallows everything, every page is `noindex`,
 * the sitemap is empty and a banner links to production.
 */
export const isNextChannel = process.env.SITE_CHANNEL === "next";

/**
 * The origin canonical and alternate-language URLs point at. The next site
 * duplicates production's pages, so its canonical copies are production's.
 */
export const canonicalBaseUrl = isNextChannel
  ? PRODUCTION_URL
  : siteConfig.baseUrl;
