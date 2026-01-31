import { getRequestConfig } from "next-intl/server";

import { getInitialMessages } from "../app/lib/i18n/initial";
import { DEFAULT_LOCALE, isValidLocale } from "../app/lib/i18n/locales";

export default getRequestConfig(async ({ locale }) => {
  // Use only segment locale to avoid requestLocale() (headers/cookies), which triggers
  // Next.js 16 "blocking route" when cacheComponents is enabled. All routes live under [locale].
  const activeLocale = locale && isValidLocale(locale) ? locale : DEFAULT_LOCALE;

  return {
    locale: activeLocale,
    messages: await getInitialMessages(activeLocale),
  };
});
