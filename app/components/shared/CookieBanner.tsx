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
    <div className="fixed bottom-4 left-4 z-50">
      <div className="glass flex max-w-[420px] items-center gap-2 rounded-lg px-3 py-2">
        <p className="shrink-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
          {t("message")}
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={handleDismiss}
            className="cursor-pointer rounded-md bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 ring-1 ring-neutral-200 transition hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700 dark:hover:bg-neutral-700"
          >
            {t("accept")}
          </button>
          <a
            href="/legal#cookies"
            className="rounded-md p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="cursor-pointer rounded-md p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
            aria-label={t("closeAria")}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
