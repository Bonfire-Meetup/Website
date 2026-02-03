"use client";

import { useTranslations } from "next-intl";

import { COOKIE_KEYS, deleteCookie } from "@/lib/storage/keys";

export function ResetCookieBannerButton() {
  const t = useTranslations("cookieConsent");

  const handleReset = () => {
    deleteCookie(COOKIE_KEYS.CONSENT);
    window.location.reload();
  };

  return (
    <button
      type="button"
      onClick={handleReset}
      className="mt-3 inline-flex items-center rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
    >
      {t("resetBanner")}
    </button>
  );
}
