import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";

/** A short version of the story; the whole of it is on `/about`. */
export async function StorySection() {
  const t = await getTranslations("home.story");

  return (
    <Section variant="default">
      <Container className="py-20">
        <div className="max-w-2xl">
          <h2 className="text-site-ink text-3xl font-semibold tracking-tight">
            {t("title")}
          </h2>
          <p className="text-site-ink-muted mt-4 text-lg leading-relaxed">
            {t("teaser")}
          </p>
          <Link
            href="/about"
            className="text-site-accent hover:text-site-accent-hover mt-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            {t("readMore")}
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </Container>
    </Section>
  );
}
