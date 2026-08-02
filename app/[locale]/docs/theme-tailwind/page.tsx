import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DocPage } from "@/components/docs/DocPage";
import { CodeBlock } from "@/components/code/CodeBlock";
import { PropsTable, type PropRow } from "@/components/docs/PropsTable";
import { buildMetadata } from "@/lib/seo/metadata";

const classRows: PropRow[] = [
  {
    name: ".gridkit-data-grid",
    type: "<table>",
    description:
      "The grid itself. Carries borders-horizontal/vertical/all and no-hover-rows/columns/cells state classes.",
  },
  {
    name: ".grid-header",
    type: "<tr>",
    description: "The header row.",
  },
  {
    name: ".header-cell",
    type: "<th>",
    description:
      "A header cell. States: is-resizing, is-dragging, is-drop-before, is-drop-after, is-wrapped.",
  },
  {
    name: ".grid-row",
    type: "<tr>",
    description: "A body row.",
  },
  {
    name: ".grid-cell",
    type: "<td>",
    description: "A body cell. States: is-resizing, is-wrapped.",
  },
  {
    name: ".header-resize-handle",
    type: "element",
    description: "The draggable resize grip on a header cell's trailing edge.",
  },
];

const tokenRows: PropRow[] = [
  {
    name: "--gridkit-surface",
    type: "color",
    description: "Header background.",
  },
  {
    name: "--gridkit-surface-muted",
    type: "color",
    description: "Hover background.",
  },
  {
    name: "--gridkit-line",
    type: "color",
    description: "Borders.",
  },
  {
    name: "--gridkit-hover-line",
    type: "color",
    description: "Cell hover outline, resize edge.",
  },
  {
    name: "--gridkit-fg",
    type: "color",
    description: "Text.",
  },
  {
    name: "--gridkit-fg-muted",
    type: "color",
    description: "Secondary text, resize grip.",
  },
  {
    name: "--gridkit-accent",
    type: "color",
    description: "Accent — resize and reorder indicator lines.",
  },
];

const overrideSource = `:root {
  --gridkit-accent: oklch(0.6 0.17 145);
  --gridkit-line: oklch(0.9 0.01 145);
}`;

const darkModeSource = `document.documentElement.classList.toggle("dark", isDark);`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "docs.theme.overview",
  });

  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "docs/theme-tailwind",
    locale,
  });
}

export default async function ThemeTailwindDocPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("docs.theme.overview");

  return (
    <DocPage
      path="theme-tailwind"
      title={t("title")}
      description={t("description")}
    >
      <p>{t("intro")}</p>
      <h2>{t("installHeading")}</h2>
      <CodeBlock lang="ts" code={`npm install @gridkitjs/theme-tailwind`} />
      <CodeBlock
        lang="css"
        code={`@import "tailwindcss";
@import "@gridkitjs/theme-tailwind/styles.css";`}
        className="mt-4"
      />
      <h2>{t("classesHeading")}</h2>
      <PropsTable rows={classRows} />
      <h2>{t("tokensHeading")}</h2>
      <PropsTable rows={tokenRows} />
      <CodeBlock lang="css" code={overrideSource} className="mt-4" />
      <h2>{t("darkModeHeading")}</h2>
      <p>{t("darkModeIntro")}</p>
      <CodeBlock lang="ts" code={darkModeSource} />
    </DocPage>
  );
}
