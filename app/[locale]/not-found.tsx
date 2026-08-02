import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default async function LocaleNotFound() {
  const t = await getTranslations("common.nav");

  return (
    <Container className="flex flex-col items-center gap-6 py-32 text-center">
      <p className="text-site-accent text-sm font-medium">404</p>
      <h1 className="text-site-ink text-3xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="text-site-ink-muted max-w-md">
        The page you&apos;re looking for doesn&apos;t exist, or was moved.
      </p>
      <Button href="/">{t("home")}</Button>
    </Container>
  );
}
