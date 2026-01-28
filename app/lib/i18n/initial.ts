import enMessages from "@/locales/en.json";

import { DEFAULT_LOCALE, type Locale } from "./locales";

export type Messages = typeof enMessages;

export const getInitialLocale = (): Locale => DEFAULT_LOCALE;

export const getInitialMessages = async (locale: Locale): Promise<Messages> => {
  if (locale === DEFAULT_LOCALE) {
    return enMessages;
  }

  const messages = (await import(`@/locales/${locale}.json`)).default;
  return messages as Messages;
};
