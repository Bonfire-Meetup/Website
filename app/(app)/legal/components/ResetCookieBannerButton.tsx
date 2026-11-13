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
      className="btn-outline mt-3 rounded-lg px-4 py-2 text-sm"
    >
      {t("resetBanner")}
    </button>
  );
}
