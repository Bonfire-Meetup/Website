"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { COOKIE_KEYS, getCookie, setCookie } from "@/lib/storage/keys";

const CONSENT_KEY = COOKIE_KEYS.CONSENT;

function CookieIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5M8.5 8.5v.01M16 15v.01M12 12v.01M11 17v.01M17 12v.01"
      />
    </svg>
  );
}

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 md:right-4 md:bottom-4 md:left-auto md:translate-x-0">
      {!isExpanded ? (
        <button
          onClick={toggleExpand}
          className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2.5 shadow-lg shadow-black/10 backdrop-blur-xl transition-all hover:scale-105 active:scale-95 dark:bg-neutral-900/90 dark:shadow-black/20"
          aria-label={t("expandAria")}
        >
          <CookieIcon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {t("minimalLabel")}
          </span>
        </button>
      ) : (
        <div className="animate-in slide-in-from-bottom-4 fade-in zoom-in-95 duration-200">
          <div className="glass flex w-[280px] flex-col gap-3 rounded-2xl px-4 py-3 shadow-2xl sm:w-auto sm:flex-row sm:items-center sm:gap-2 sm:rounded-xl sm:px-3 sm:py-2">
            <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
              {t("message")}
            </p>
            <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-1">
              <button
                onClick={handleDismiss}
                className="flex-1 cursor-pointer rounded-lg bg-gradient-to-r from-fuchsia-700 via-orange-500 to-red-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-orange-500/25 transition hover:opacity-90 active:scale-95 sm:flex-none sm:rounded-md sm:px-3 sm:py-1 sm:font-medium sm:shadow-none dark:shadow-orange-500/30"
              >
                {t("accept")}
              </button>
              <a
                href="/legal#cookies"
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 sm:rounded-md sm:p-1 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
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
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 sm:rounded-md sm:p-1 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
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
      )}
    </div>
  );
}
