export const siteConfig = {
  name: "GridKit",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gridkitjs.com",
  github: "https://github.com/gridkitjs/gridkitjs",
  // `--site-bg` in globals.css, light and dark, as hex: theme-color meta
  // tags can't read CSS variables.
  themeColor: { light: "#ffffff", dark: "#0e1217" },
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
