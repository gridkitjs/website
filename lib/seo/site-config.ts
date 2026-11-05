export const siteConfig = {
  name: "GridKit",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gridkitjs.com",
  github: "https://github.com/gridkitjs/gridkitjs",
  npm: {
    core: "https://www.npmjs.com/package/@gridkitjs/core",
    dom: "https://www.npmjs.com/package/@gridkitjs/dom",
    react: "https://www.npmjs.com/package/@gridkitjs/react",
    themeTailwind: "https://www.npmjs.com/package/@gridkitjs/theme-tailwind",
    exportXlsx: "https://www.npmjs.com/package/@gridkitjs/export-xlsx",
  },
  author: {
    name: "Blagoja Blazhevski",
    github: "https://github.com/blagojablazhevski",
    portfolio: "https://blazhevski.com",
  },
} as const;
