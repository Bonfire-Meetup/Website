import { getRequestConfig } from "next-intl/server";

import { getInitialMessages } from "../app/lib/i18n/initial";
import { DEFAULT_LOCALE } from "../app/lib/i18n/locales";

export default getRequestConfig(async ({ locale: _ }) => {
  const activeLocale = DEFAULT_LOCALE;

  return {
    locale: activeLocale,
    messages: await getInitialMessages(activeLocale),
  };
});
