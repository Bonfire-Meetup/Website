import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

import { type Locale, isValidLocale } from "../app/lib/i18n/locales";

import { defaultLocale } from "./routing";

async function getLocaleFromRequest(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale;
  }

  const headerStore = await headers();
  const acceptLanguage = headerStore.get("accept-language");
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim().substring(0, 2))
      .find(isValidLocale);
    if (preferredLocale) {
      return preferredLocale;
    }
  }

  return defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await getLocaleFromRequest();

  return {
    locale,
    messages: (await import(`../app/locales/${locale}.json`)).default,
  };
});
