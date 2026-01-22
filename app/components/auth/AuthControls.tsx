"use client";

import { useEffect, useState } from "react";
import { LanguageToggle } from "../theme/LanguageToggle";
import { ThemeToggle } from "../theme/ThemeToggle";
import { LOCALES, DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/locales";

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1] ?? "") : null;
};

type AuthControlsLabels = {
  csLabel: string;
  enLabel: string;
  switchToCs: string;
  switchToEn: string;
};

type AuthControlsProps = {
  labels?: AuthControlsLabels;
};

export function AuthControls({ labels }: AuthControlsProps = {}) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const cookieLocale = getCookieValue("NEXT_LOCALE");
    const docLocale = document.documentElement.lang;
    const resolvedLocale = cookieLocale || docLocale || DEFAULT_LOCALE;
    setLocale(isValidLocale(resolvedLocale) ? resolvedLocale : DEFAULT_LOCALE);
  }, []);

  const defaultLabels: AuthControlsLabels = {
    csLabel: "CS",
    enLabel: "EN",
    switchToCs: "Switch to Czech",
    switchToEn: "Switch to English",
  };

  return (
    <div className="flex items-center gap-2">
      <LanguageToggle locale={locale} labels={labels ?? defaultLabels} onLocaleChange={setLocale} />
      <ThemeToggle />
    </div>
  );
}
