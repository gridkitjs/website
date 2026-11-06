import type { MetadataRoute } from "next";
import { isNextChannel } from "@/lib/seo/channel";
import { siteConfig } from "@/lib/seo/site-config";

export default function robots(): MetadataRoute.Robots {
  if (isNextChannel) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteConfig.baseUrl}/sitemap.xml`,
  };
}
