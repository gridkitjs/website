import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // The root layout lives at app/[locale]/layout.tsx (a dynamic segment), so
  // there's no single layout above it to compose a 404 page from — Next.js
  // recommends global-not-found for exactly this case.
  experimental: {
    globalNotFound: true,
  },
};

export default withNextIntl(nextConfig);
