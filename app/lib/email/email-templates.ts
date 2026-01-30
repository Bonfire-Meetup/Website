import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { render } from "@react-email/render";
import React from "react";

import { EmailCode } from "@/components/email/EmailCode";
import { defaultLocale } from "@/i18n/routing";
import { LOCALES, type Locale } from "@/lib/i18n/locales";

const localeCache = new Map<string, Record<string, unknown>>();

const interpolate = (template: string, data: Record<string, string>) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? "");

const ttlTextByLocale = (locale: Locale, minutes: number) => {
  if (locale === LOCALES.CS) {
    return `${minutes} minut`;
  }

  return `${minutes} minutes`;
};

const loadLocaleMessages = async (locale: Locale) => {
  const cached = localeCache.get(locale);

  if (cached) {
    return cached;
  }

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

const BASE_URL = process.env.PROD_URL ?? "https://bnf.events";
const LOGO_URL = `${BASE_URL}/assets/brand/RGB_PNG_01_bonfire_black_gradient.png`;

const buildView = (translations: Record<string, string>, baseView: Record<string, string>) => ({
  brandName: baseView.brandName,
  codeLabel: interpolate(translations.codeLabel ?? "", baseView),
  expires: interpolate(translations.expires ?? "", baseView),
  footer: interpolate(translations.footer ?? "", baseView),
  ignore: interpolate(translations.ignore ?? "", baseView),
  securityTip: interpolate(translations.securityTip ?? "", baseView),
  subtitle: interpolate(translations.subtitle ?? "", baseView),
  title: interpolate(translations.title ?? "", baseView),
  subject: interpolate(translations.subject ?? "", baseView),
});

export const renderEmailCodeTemplate = async ({
  locale,
  code,
  minutes,
  requestFrom,
}: {
  locale?: Locale;
  code: string;
  minutes: number;
  requestFrom?: string;
}) => {
  const resolvedLocale = locale ?? defaultLocale;
  const translations = await getAuthCodeMessages(resolvedLocale);
  const common = await getCommonValues(resolvedLocale);
  const ttl = ttlTextByLocale(resolvedLocale, minutes);
  const formattedCode = code.length === 6 ? `${code.slice(0, 3)} ${code.slice(3)}` : code;
  const baseView = {
    brandName: common.brandName,
    code,
    tagline: common.tagline,
    ttl,
  };
  const view = buildView(translations, baseView);
  const html = await render(
    React.createElement(EmailCode, {
      ...view,
      baseUrl: BASE_URL,
      formattedCode,
      lang: resolvedLocale,
      logoUrl: LOGO_URL,
      requestFrom,
    }),
  );
  const text = [view.title, "", view.codeLabel, view.expires, "", view.ignore, view.footer].join(
    "\n",
  );

  return {
    html,
    subject: view.subject,
    text,
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
  const ttl = ttlTextByLocale(resolvedLocale, minutes);
  const formattedCode = code.length === 6 ? `${code.slice(0, 3)} ${code.slice(3)}` : code;
  const baseView = {
    brandName: common.brandName,
    code,
    tagline: common.tagline,
    ttl,
  };
  const view = buildView(translations, baseView);
  const html = await render(
    React.createElement(EmailCode, {
      ...view,
      baseUrl: BASE_URL,
      formattedCode,
      lang: resolvedLocale,
      logoUrl: LOGO_URL,
    }),
  );
  const text = [view.title, "", view.codeLabel, view.expires, "", view.ignore, view.footer].join(
    "\n",
  );

  return {
    html,
    subject: view.subject,
    text,
  };
};
