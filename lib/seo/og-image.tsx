import { ImageResponse } from "next/og";
import { GridKitMark } from "@/components/ui/icons";
import { siteConfig } from "./site-config";

export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = "image/png";

// The dark theme's tokens from globals.css, as hex: the renderer can't read
// CSS variables, and a shared link has no theme of its own to follow.
const colors = {
  bg: siteConfig.themeColor.dark,
  ink: "#eef0f3",
  inkMuted: "#a3a9b1",
  line: "#292e35",
  accent: "#5fa7ff",
};

interface OgImageOptions {
  /** A short label above the title: the site section the page belongs to. */
  section: string;
  title: string;
  /** Locale-less path shown in the footer, e.g. "docs/react/column-sorting". */
  path: string;
}

/**
 * A page's Open Graph image: the mark and wordmark, a section label, the
 * page title, and the page's URL beneath a hairline. Rendered by the
 * `opengraph-image.tsx` routes under `app/[locale]/`, in Geist (the font
 * `next/og` bundles).
 */
export function renderOgImage({ section, title, path }: OgImageOptions) {
  const host = new URL(siteConfig.baseUrl).host;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: 72,
        background: colors.bg,
        color: colors.ink,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <GridKitMark width={52} height={52} />
        <span style={{ fontSize: 34 }}>{siteConfig.name}</span>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 20,
        }}
      >
        <span
          style={{
            fontSize: 24,
            color: colors.accent,
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          {section}
        </span>
        <span
          style={{
            fontSize: title.length > 48 ? 60 : 76,
            lineHeight: 1.1,
            maxWidth: 1000,
          }}
        >
          {title}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          paddingTop: 28,
          borderTop: `1px solid ${colors.line}`,
          fontSize: 24,
          color: colors.inkMuted,
        }}
      >
        {path ? `${host}/${path}` : host}
      </div>
    </div>,
    ogImageSize,
  );
}
