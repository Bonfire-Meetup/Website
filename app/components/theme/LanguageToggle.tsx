"use client";

import { useTranslations } from "next-intl";

import { LOCALES } from "@/lib/i18n/locales";

import { useI18n } from "../providers/I18nClientSync";
import { IconButton } from "../ui/IconButton";

export function LanguageToggle() {
  const t = useTranslations("language");
  const { locale, setLocale } = useI18n();

  const toggleLocale = () => {
    setLocale(locale === LOCALES.EN ? LOCALES.CS : LOCALES.EN);
  };

  return (
    <IconButton
      onClick={toggleLocale}
      ariaLabel={
        locale === LOCALES.EN
          ? t("switchTo", { language: t("czech") })
          : t("switchTo", { language: t("english") })
      }
      size="pill"
      shape="rounded"
      variant="glass"
      className="text-sm font-medium hover:scale-105 active:scale-95"
    >
      <span className="uppercase">{locale === LOCALES.EN ? t("csLabel") : t("enLabel")}</span>
    </IconButton>
  );
}
