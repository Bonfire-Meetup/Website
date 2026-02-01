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

export function formatDate(date: string, locale: string): string {
  return formatShortDateUTC(date, locale);
}

const EVENT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  weekday: "long",
  year: "numeric",
  timeZone: "UTC",
};

const SHORT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
};

function parseDateUTC(dateString: string | null | undefined): Date {
  if (!dateString) {
    return new Date(NaN);
  }
  let normalized = dateString.trim();
  if (!normalized.includes("T")) {
    if (normalized.includes(" ")) {
      normalized = normalized.replace(" ", "T");
    } else {
      normalized = `${normalized}T00:00:00.000Z`;
    }
  }
  normalized = normalized.replace(/\+00(:00)?$/, "Z");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return new Date(NaN);
  }
  return date;
}

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

export function formatEventDateUTC(dateString: string, locale: string): string {
  const date = parseDateUTC(dateString);
  if (!isValidDate(date)) {
    return "";
  }
  return new Intl.DateTimeFormat(locale, EVENT_DATE_OPTIONS).format(date);
}

export function formatShortDateUTC(dateString: string | null | undefined, locale: string): string {
  if (!dateString) {
    return "";
  }
  const date = parseDateUTC(dateString);
  if (!isValidDate(date)) {
    return "";
  }
  return new Intl.DateTimeFormat(locale, SHORT_DATE_OPTIONS).format(date);
}

const LONG_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
};

export function formatLongDateUTC(dateString: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, LONG_DATE_OPTIONS).format(parseDateUTC(dateString));
}

export function formatMonthUTC(dateString: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    timeZone: "UTC",
  }).format(parseDateUTC(dateString));
}

export function getUTCDateParts(dateString: string): { day: number; year: number } {
  const d = parseDateUTC(dateString);

  return { day: d.getUTCDate(), year: d.getUTCFullYear() };
}

export function formatDayMonthUTC(dateString: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(parseDateUTC(dateString));
}

const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
};

export function formatTimeUTC(isoDateString: string, locale?: string): string {
  return new Intl.DateTimeFormat(locale ?? "en", TIME_OPTIONS).format(new Date(isoDateString));
}

const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
};

export function formatDateTimeUTC(isoDateString: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, DATE_TIME_OPTIONS).format(new Date(isoDateString));
}
