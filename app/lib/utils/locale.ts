import { defaultLocale } from "@/i18n/routing";
import { type Locale, isValidLocale } from "@/lib/i18n/locales";

const getCookieValue = (cookieHeader: string | null, name: string) => {
  if (!cookieHeader) {
    return null;
  }

  const parts = cookieHeader.split(";").map((part) => part.trim());

  for (const part of parts) {
    if (part.startsWith(`${name}=`)) {
      return decodeURIComponent(part.slice(name.length + 1));
    }
  }

  return null;
};

const getLocaleFromCookie = (headers: Headers) => {
  const cookieLocale = getCookieValue(headers.get("cookie"), "NEXT_LOCALE");

  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale;
  }

  return null;
};

const getLocaleFromAcceptLanguage = (headers: Headers) => {
  const acceptLanguage = headers.get("accept-language");

  if (!acceptLanguage) {
    return null;
  }

  const preferredLocale = acceptLanguage
    .split(",")
    .map((lang) => lang.split(";")[0]?.trim().substring(0, 2) ?? "")
    .find(isValidLocale);

  return preferredLocale ?? null;
};

export const getRequestLocale = (headers: Headers): Locale =>
  getLocaleFromCookie(headers) ?? getLocaleFromAcceptLanguage(headers) ?? defaultLocale;

export function formatDate(date: string, locale: string) {
  return new Date(date).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
