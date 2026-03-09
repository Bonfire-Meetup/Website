"use client";

import { useTranslations } from "next-intl";

import { LOCALES } from "@/lib/i18n/locales";

import { useI18n } from "../providers/I18nClientSync";
import { IconButton } from "../ui/IconButton";

interface LanguageToggleProps {
  className?: string;
  variant?: "glass" | "plain";
  size?: "sm" | "md" | "pill";
  shape?: "rounded" | "full";
}

export function LanguageToggle({
  className = "text-sm font-medium hover:scale-105 active:scale-95",
  variant = "glass",
  size = "pill",
  shape = "rounded",
}: LanguageToggleProps) {
  const t = useTranslations("language");
  const { locale, setLocale } = useI18n();
  const isEnglish = locale === LOCALES.EN;
  const currentLabel = isEnglish ? t("enLabel") : t("csLabel");

  const toggleLocale = () => {
    setLocale(isEnglish ? LOCALES.CS : LOCALES.EN);
  };

  return (
    <IconButton
      onClick={toggleLocale}
      ariaLabel={
        isEnglish
          ? t("switchTo", { language: t("czech") })
          : t("switchTo", { language: t("english") })
      }
      size={size}
      shape={shape}
      variant={variant}
      title={currentLabel}
      className={className}
    >
      <span className="inline-flex items-center justify-center uppercase">
        <span className="text-[10px] leading-none font-semibold tracking-[0.12em]">
          {currentLabel}
        </span>
      </span>
    </IconButton>
  );
}
