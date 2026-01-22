export const LOCALES = {
  EN: "en",
  CS: "cs",
} as const;

export const LOCALES_ARRAY = [LOCALES.EN, LOCALES.CS] as const;

export type Locale = (typeof LOCALES_ARRAY)[number];

export const DEFAULT_LOCALE: Locale = LOCALES.EN;

export const isValidLocale = (value: string): value is Locale =>
  LOCALES_ARRAY.includes(value as Locale);
