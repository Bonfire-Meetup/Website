"use client";

import { useLocale } from "next-intl";
import type { ReactNode } from "react";

import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/locales";

interface LocalizedContentProps {
  content: Record<Locale, ReactNode>;
}

/**
 * Picks the server-rendered variant matching the active locale. Needed because the locale is
 * resolved on the client, so the server renders every language and the client shows one.
 */
export function LocalizedContent({ content }: LocalizedContentProps) {
  const locale = useLocale();

  return content[isValidLocale(locale) ? locale : DEFAULT_LOCALE];
}
