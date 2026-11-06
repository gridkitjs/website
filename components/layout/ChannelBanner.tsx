import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { isNextChannel, PRODUCTION_URL } from "@/lib/seo/channel";

/**
 * One line above the header on next.gridkitjs.com, saying the site previews
 * unreleased GridKit and linking to production. Renders nothing elsewhere.
 */
export async function ChannelBanner({ locale }: { locale: string }) {
  if (!isNextChannel) return null;

  const t = await getTranslations("common");

  return (
    <div className="bg-site-info-soft border-site-line border-b">
      <Container className="text-site-ink py-1.5 text-center text-xs">
        {t.rich("channelBanner", {
          link: (chunks) => (
            <a
              href={`${PRODUCTION_URL}/${locale}`}
              className="font-medium underline underline-offset-2 transition-opacity hover:opacity-70"
            >
              {chunks}
            </a>
          ),
        })}
      </Container>
    </div>
  );
}
