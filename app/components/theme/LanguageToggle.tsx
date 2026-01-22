"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { IconButton } from "../ui/IconButton";
import { LOCALES, type Locale } from "@/lib/i18n/locales";

type LanguageToggleProps = {
  locale: Locale;
  onLocaleChange?: (locale: Locale) => void;
};

export function LanguageToggle({ locale, onLocaleChange }: LanguageToggleProps) {
  const t = useTranslations("language");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggleLocale = () => {
    const newLocale: Locale = locale === LOCALES.EN ? LOCALES.CS : LOCALES.EN;

    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
      router.refresh();
      onLocaleChange?.(newLocale);
    });
  };

  return (
    <IconButton
      onClick={toggleLocale}
      disabled={isPending}
      ariaLabel={
        locale === LOCALES.EN
          ? t("switchTo", { language: t("czech") })
          : t("switchTo", { language: t("english") })
      }
      size="pill"
      shape="rounded"
      variant="glass"
      className="text-sm font-medium hover:scale-105 active:scale-95 disabled:opacity-50"
    >
      <span className="uppercase">{locale === LOCALES.EN ? t("csLabel") : t("enLabel")}</span>
    </IconButton>
  );
}
