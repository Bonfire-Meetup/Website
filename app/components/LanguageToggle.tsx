"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function LanguageToggle() {
  const locale = useLocale();
  const t = useTranslations("language");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggleLocale = () => {
    const newLocale = locale === "en" ? "cs" : "en";

    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
      router.refresh();
    });
  };

  return (
    <button
      onClick={toggleLocale}
      disabled={isPending}
      className="glass flex h-10 items-center justify-center rounded-xl px-3 text-sm font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
      aria-label={t("switchTo", {
        language: locale === "en" ? t("czech") : t("english"),
      })}
    >
      <span className="uppercase">{locale === "en" ? t("csLabel") : t("enLabel")}</span>
    </button>
  );
}
