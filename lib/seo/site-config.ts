export const siteConfig = {
  name: "GridKit",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gridkitjs.com",
  github: "https://github.com/blagojablazhevski/gridkit",
  npm: {
    core: "https://www.npmjs.com/package/@gridkitjs/core",
    react: "https://www.npmjs.com/package/@gridkitjs/react",
    themeTailwind: "https://www.npmjs.com/package/@gridkitjs/theme-tailwind",
  },
  author: {
    name: "Blagoja Blazhevski",
    github: "https://github.com/blagojablazhevski",
    portfolio: "https://blazhevski.com",
  },
} as const;
