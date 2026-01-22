import { readFile } from "node:fs/promises";
import { join } from "node:path";
import mustache from "mustache";
import { defaultLocale, locales } from "@/i18n/routing";

type Locale = (typeof locales)[number];

const templateCache = new Map<string, string>();
const localeCache = new Map<string, Record<string, unknown>>();

const ttlTextByLocale = (locale: Locale, minutes: number) => {
  if (locale === "cs") return `${minutes} minut`;
  return `${minutes} minutes`;
};

const loadTemplate = async (path: string) => {
  const cached = templateCache.get(path);
  if (cached) return cached;
  const content = await readFile(path, "utf8");
  templateCache.set(path, content);
  return content;
};

const loadLocaleMessages = async (locale: Locale) => {
  const cached = localeCache.get(locale);
  if (cached) return cached;
  const path = join(process.cwd(), "app", "locales", `${locale}.json`);
  const content = await readFile(path, "utf8");
  const json = JSON.parse(content) as Record<string, unknown>;
  localeCache.set(locale, json);
  return json;
};

const getCommonValues = async (locale: Locale) => {
  const messages = await loadLocaleMessages(locale);
  const common = messages.common as Record<string, string> | undefined;
  if (!common) {
    if (locale !== defaultLocale) {
      return getCommonValues(defaultLocale);
    }
    throw new Error("Missing common translations");
  }
  return common;
};

const getAuthCodeMessages = async (locale: Locale) => {
  const messages = await loadLocaleMessages(locale);
  const email = messages.email as Record<string, unknown> | undefined;
  const authCode = email?.authCode as Record<string, string> | undefined;
  if (!authCode) {
    if (locale !== defaultLocale) {
      return getAuthCodeMessages(defaultLocale);
    }
    throw new Error("Missing email translations");
  }
  return authCode;
};

const getAccountDeleteMessages = async (locale: Locale) => {
  const messages = await loadLocaleMessages(locale);
  const email = messages.email as Record<string, unknown> | undefined;
  const accountDelete = email?.accountDelete as Record<string, string> | undefined;
  if (!accountDelete) {
    if (locale !== defaultLocale) {
      return getAccountDeleteMessages(defaultLocale);
    }
    throw new Error("Missing email translations");
  }
  return accountDelete;
};

export const renderEmailCodeTemplate = async ({
  locale,
  code,
  minutes,
}: {
  locale?: Locale;
  code: string;
  minutes: number;
}) => {
  const resolvedLocale = locale ?? defaultLocale;
  const translations = await getAuthCodeMessages(resolvedLocale);
  const common = await getCommonValues(resolvedLocale);
  const htmlPath = join(process.cwd(), "app", "data", "email", "email-code.html");
  const textPath = join(process.cwd(), "app", "data", "email", "email-code.txt");
  const html = await loadTemplate(htmlPath);
  const text = await loadTemplate(textPath);
  const ttl = ttlTextByLocale(resolvedLocale, minutes);
  const baseView = { code, ttl, brandName: common.brandName, tagline: common.tagline };
  const view = {
    lang: resolvedLocale,
    code,
    ttl,
    brandName: common.brandName,
    tagline: common.tagline,
    title: mustache.render(translations.title ?? "", baseView),
    subtitle: mustache.render(translations.subtitle ?? "", baseView),
    expires: mustache.render(translations.expires ?? "", baseView),
    ignore: mustache.render(translations.ignore ?? "", baseView),
    footer: mustache.render(translations.footer ?? "", baseView),
    codeLabel: mustache.render(translations.codeLabel ?? "", baseView),
    securityTip: mustache.render(translations.securityTip ?? "", baseView),
  };
  const subject = mustache.render(translations.subject ?? "", baseView);
  return {
    subject,
    html: mustache.render(html, view),
    text: mustache.render(text, view),
  };
};

export const renderAccountDeleteTemplate = async ({
  locale,
  code,
  minutes,
}: {
  locale?: Locale;
  code: string;
  minutes: number;
}) => {
  const resolvedLocale = locale ?? defaultLocale;
  const translations = await getAccountDeleteMessages(resolvedLocale);
  const common = await getCommonValues(resolvedLocale);
  const htmlPath = join(process.cwd(), "app", "data", "email", "email-code.html");
  const textPath = join(process.cwd(), "app", "data", "email", "email-code.txt");
  const html = await loadTemplate(htmlPath);
  const text = await loadTemplate(textPath);
  const ttl = ttlTextByLocale(resolvedLocale, minutes);
  const baseView = { code, ttl, brandName: common.brandName, tagline: common.tagline };
  const view = {
    lang: resolvedLocale,
    code,
    ttl,
    brandName: common.brandName,
    tagline: common.tagline,
    title: mustache.render(translations.title ?? "", baseView),
    subtitle: mustache.render(translations.subtitle ?? "", baseView),
    expires: mustache.render(translations.expires ?? "", baseView),
    ignore: mustache.render(translations.ignore ?? "", baseView),
    footer: mustache.render(translations.footer ?? "", baseView),
    codeLabel: mustache.render(translations.codeLabel ?? "", baseView),
    securityTip: mustache.render(translations.securityTip ?? "", baseView),
  };
  const subject = mustache.render(translations.subject ?? "", baseView);
  return {
    subject,
    html: mustache.render(html, view),
    text: mustache.render(text, view),
  };
};
