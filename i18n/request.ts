import { getRequestConfig } from "next-intl/server";

import { getInitialMessages } from "../app/lib/i18n/initial";
import { DEFAULT_LOCALE, isValidLocale } from "../app/lib/i18n/locales";

export default getRequestConfig(async ({ requestLocale, locale }) => {
  const resolved = locale ?? (await requestLocale);
  const activeLocale = resolved && isValidLocale(resolved) ? resolved : DEFAULT_LOCALE;

  return {
    locale: activeLocale,
    messages: await getInitialMessages(activeLocale),
  };
});
