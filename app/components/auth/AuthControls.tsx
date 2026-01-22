"use client";

import { useEffect, useState } from "react";

import { DEFAULT_LOCALE, type Locale, isValidLocale } from "@/lib/i18n/locales";

import { LanguageToggle } from "../theme/LanguageToggle";
import { ThemeToggle } from "../theme/ThemeToggle";

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1] ?? "") : null;
};

export function AuthControls() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const cookieLocale = getCookieValue("NEXT_LOCALE");
    const docLocale = document.documentElement.lang;
    const resolvedLocale = cookieLocale || docLocale || DEFAULT_LOCALE;
    setLocale(isValidLocale(resolvedLocale) ? resolvedLocale : DEFAULT_LOCALE);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <LanguageToggle locale={locale} onLocaleChange={setLocale} />
      <ThemeToggle />
    </div>
  );
}
