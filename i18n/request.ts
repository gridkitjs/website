import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

async function loadMessages(locale: string) {
  const [common, home, docs] = await Promise.all([
    import(`../messages/${locale}/common.json`),
    import(`../messages/${locale}/home.json`),
    import(`../messages/${locale}/docs.json`),
  ]);

  return {
    common: common.default,
    home: home.default,
    docs: docs.default,
  };
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
