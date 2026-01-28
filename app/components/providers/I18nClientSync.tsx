"use client";

import { NextIntlClientProvider } from "next-intl";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { type Messages } from "@/lib/i18n/initial";
import { DEFAULT_LOCALE, type Locale, isValidLocale } from "@/lib/i18n/locales";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {
    throw new Error("I18nContext not initialized");
  },
});

export function useI18n() {
  return useContext(I18nContext);
}

function getLocaleFromCookie(fallback: Locale): Locale {
  if (typeof document === "undefined") {
    return fallback;
  }
  const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
  const value = match?.[1];
  return value && isValidLocale(value) ? value : fallback;
}

const messageLoaders: Record<Locale, () => Promise<{ default: Messages }>> = {
  en: () => import("../../locales/en.json"),
  cs: () => import("../../locales/cs.json"),
};

interface I18nClientSyncProps {
  children: React.ReactNode;
  initialLocale: Locale;
  initialMessages: Messages;
}

export function I18nClientSync({ children, initialLocale, initialMessages }: I18nClientSyncProps) {
  const [state, setState] = useState<{ locale: Locale; messages: Messages }>({
    locale: initialLocale,
    messages: initialMessages,
  });

  const loadLocale = useCallback(async (loc: Locale) => {
    const mod = await messageLoaders[loc]();
    setState({ locale: loc, messages: mod.default });
  }, []);

  useEffect(() => {
    const cookieLocale = getLocaleFromCookie(initialLocale);
    if (cookieLocale !== state.locale) {
      loadLocale(cookieLocale);
    }
  }, [initialLocale, loadLocale, state.locale]);

  const setLocale = useCallback(
    (newLocale: Locale) => {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
      loadLocale(newLocale);
    },
    [loadLocale],
  );

  return (
    <I18nContext.Provider value={{ locale: state.locale, setLocale }}>
      <NextIntlClientProvider locale={state.locale} messages={state.messages}>
        {children}
      </NextIntlClientProvider>
    </I18nContext.Provider>
  );
}
