"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { COOKIE_KEYS, getCookie, setCookie } from "@/lib/storage/keys";

const CONSENT_KEY = COOKIE_KEYS.CONSENT;

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const t = useTranslations("cookieConsent");

  useEffect(() => {
    const consent = getCookie(CONSENT_KEY);
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setCookie(CONSENT_KEY, "essential", 365);
    setIsVisible(false);
  };

  const handleClose = () => {
    setCookie(CONSENT_KEY, "dismissed", 365);
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-24 left-4 z-50 md:right-auto md:bottom-4 md:left-4">
      <div className="glass mx-auto flex max-w-[420px] flex-col gap-3 rounded-xl px-4 py-3 sm:flex-row sm:items-center sm:gap-2 sm:rounded-lg sm:px-3 sm:py-2">
        <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
          {t("message")}
        </p>
        <div className="flex shrink-0 items-center justify-center gap-2 sm:gap-1">
          <button
            onClick={handleDismiss}
            className="flex-1 cursor-pointer rounded-lg bg-gradient-to-r from-fuchsia-700 via-orange-500 to-red-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-orange-500/25 transition hover:opacity-90 active:scale-95 sm:flex-none sm:rounded-md sm:px-3 sm:py-1 sm:font-medium sm:shadow-none dark:shadow-orange-500/30"
          >
            {t("accept")}
          </button>
          <a
            href="/legal#cookies"
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 sm:rounded-md sm:p-1 sm:hover:rounded-md dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
            aria-label={t("learnMoreAria")}
          >
            <svg
              className="h-4 w-4 sm:h-3.5 sm:w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </a>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 sm:rounded-md sm:p-1 sm:hover:rounded-md dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
            aria-label={t("closeAria")}
          >
            <svg
              className="h-4 w-4 sm:h-3.5 sm:w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
