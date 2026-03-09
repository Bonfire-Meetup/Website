"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";

import { ClockIcon, QrCodeIcon, InfoIcon } from "@/components/shared/Icons";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/errors";
import { useCheckInToken } from "@/lib/api/user-profile";
import { WEBSITE_URLS } from "@/lib/config/constants";
import { useAppSelector } from "@/lib/redux/hooks";
import { LOGIN_REASON, PAGE_ROUTES } from "@/lib/routes/pages";
import { formatTimeUTC } from "@/lib/utils/locale";

const REFRESH_INTERVAL_MS = 9 * 60 * 1000;
const DEVICE_WAKE_THRESHOLD_MS = 30 * 1000;
const TICKET_GRADIENT_CLASS = "bg-gradient-to-br from-rose-700 via-orange-500 to-red-600";
const TICKET_SHELL_CLASS =
  "relative overflow-hidden rounded-[2rem] border border-black/10 bg-white/85 shadow-[0_32px_90px_-38px_rgba(15,23,42,0.5)] ring-1 ring-white/60 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-950/85 dark:ring-white/10";
const TICKET_SURFACE_CLASS =
  "bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,247,237,0.92)_100%)] dark:bg-[linear-gradient(180deg,rgba(23,23,23,0.98)_0%,rgba(10,10,10,0.98)_100%)]";
const QR_FRAME_CLASS =
  "relative rounded-[1.75rem] border border-neutral-200/80 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(245,245,245,0.94)_58%,rgba(229,229,229,0.95)_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(229,231,235,0.9),0_18px_45px_-28px_rgba(15,23,42,0.4)] dark:border-white/10 dark:bg-[radial-gradient(circle_at_top,rgba(38,38,38,0.98),rgba(23,23,23,0.96)_58%,rgba(10,10,10,0.98)_100%)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(255,255,255,0.04),0_18px_45px_-28px_rgba(0,0,0,0.8)]";
const QR_META_BAR_CLASS =
  "mb-3 flex items-center justify-between rounded-full border border-black/5 bg-white/70 px-3 py-1.5 dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(38,38,38,0.92)_0%,rgba(23,23,23,0.9)_100%)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";
const QR_CODE_SURFACE_CLASS =
  "relative h-64 w-64 overflow-hidden rounded-[1.25rem] border border-black/5 bg-neutral-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.98)_0%,rgba(9,9,11,0.98)_100%)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_24px_50px_-36px_rgba(0,0,0,0.95)]";
const VALID_UNTIL_CLASS =
  "flex items-center justify-between rounded-2xl border border-black/5 bg-white/72 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-sm dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(32,32,36,0.92)_0%,rgba(18,18,20,0.92)_100%)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_18px_40px_-34px_rgba(0,0,0,0.9)]";
const TICKET_BUTTON_CLASS =
  "bg-gradient-to-r from-rose-700 via-orange-500 to-red-600 shadow-orange-500/25 hover:shadow-lg hover:from-rose-800 hover:via-orange-600 hover:to-red-700";

export function CheckInClient() {
  const t = useTranslations("checkIn");
  const locale = useLocale();
  const router = useRouter();
  const auth = useAppSelector((state) => state.auth);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const tokenQuery = useCheckInToken(auth.hydrated && auth.isAuthenticated);
  const [lastActivityTime, setLastActivityTime] = useState(() => Date.now());

  useEffect(() => {
    if (tokenQuery.error instanceof ApiError && tokenQuery.error.status === 401) {
      router.replace(PAGE_ROUTES.LOGIN_WITH_REASON(LOGIN_REASON.SESSION_EXPIRED));
    }
  }, [tokenQuery.error, router]);

  const tokenValue = tokenQuery.data?.token ?? null;

  const [prevTokenValue, setPrevTokenValue] = useState(tokenValue);
  if (prevTokenValue !== tokenValue) {
    setPrevTokenValue(tokenValue);
    if (!tokenValue) {
      setQrDataUrl(null);
    }
  }

  useEffect(() => {
    let timeoutId: number | null = null;

    if (tokenQuery.data?.expiresAt) {
      const expiresMs = new Date(tokenQuery.data.expiresAt).getTime();
      const now = Date.now();
      const delay = Math.max(5_000, Math.min(REFRESH_INTERVAL_MS, expiresMs - now - 30_000));
      timeoutId = window.setTimeout(() => {
        tokenQuery.refetch();
      }, delay);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [tokenQuery.data?.expiresAt, tokenQuery]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivityTime;

        if (timeSinceLastActivity > DEVICE_WAKE_THRESHOLD_MS) {
          tokenQuery.refetch();
        }
        setLastActivityTime(now);
      }
    };

    const handleFocus = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityTime;

      if (timeSinceLastActivity > DEVICE_WAKE_THRESHOLD_MS) {
        tokenQuery.refetch();
      }
      setLastActivityTime(now);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [lastActivityTime, tokenQuery]);

  useEffect(() => {
    if (!tokenValue) {
      return;
    }

    let isCancelled = false;
    const qrContent = `${WEBSITE_URLS.BASE}/#?check-in=${encodeURIComponent(tokenValue)}`;
    QRCode.toDataURL(qrContent, {
      errorCorrectionLevel: "M",
      margin: 1,
      scale: 8,
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then((url: string) => {
        if (!isCancelled) {
          setQrDataUrl(url);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setQrDataUrl(null);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [tokenValue]);

  const expiresAt = tokenQuery.data?.expiresAt;
  const expiresLabel = useMemo(() => {
    if (!expiresAt) {
      return null;
    }
    return formatTimeUTC(expiresAt, locale);
  }, [locale, expiresAt]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await tokenQuery.refetch();
    } catch {
      // Errors handled by query state
    }
    setRefreshing(false);
  };

  if (tokenQuery.isError) {
    return (
      <div className="mx-auto max-w-md">
        <div className="overflow-hidden rounded-3xl border border-red-200/70 bg-gradient-to-b from-red-50 to-red-100/50 p-8 shadow-lg dark:border-red-500/30 dark:from-red-950/30 dark:to-red-900/20">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/50">
              <QrCodeIcon className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <Button
            onClick={() => tokenQuery.refetch()}
            className="w-full bg-red-600 py-3 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
          >
            {t("error.retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className={TICKET_SHELL_CLASS}>
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_45%),linear-gradient(135deg,rgba(255,255,255,0.22),transparent_45%,rgba(255,255,255,0.08)_65%,transparent_78%)]" />
        <div
          className={`relative overflow-hidden rounded-[calc(2rem-1px)] ${TICKET_SURFACE_CLASS}`}
        >
          <div className={`relative h-30 sm:h-36 ${TICKET_GRADIENT_CLASS}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.22),transparent_24%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.18)_35%,transparent_52%,rgba(255,255,255,0.08)_68%,transparent_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-white/30" />
            <div className="relative flex h-full flex-col justify-center px-5 py-4 sm:justify-between sm:px-6 sm:py-5">
              <div className="hidden items-center justify-between sm:flex">
                <div className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-semibold tracking-[0.28em] text-white/90 uppercase backdrop-blur-sm">
                  BONFIRE
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-white/85" />
                  <span className="h-2 w-2 rounded-full bg-white/45" />
                  <span className="h-2 w-2 rounded-full bg-white/25" />
                </div>
              </div>
              <div className="text-center sm:pt-1">
                <div className="mb-1 text-[11px] font-semibold tracking-[0.18em] text-white/88 uppercase sm:mb-2 sm:text-sm sm:tracking-[0.3em]">
                  {t("ticket.header")}
                </div>
                <div className="text-[1.75rem] leading-none font-black tracking-[0.1em] text-white uppercase sm:text-3xl sm:tracking-[0.18em]">
                  {t("ticket.label")}
                </div>
              </div>
              <div className="mt-3 hidden items-center justify-between sm:flex">
                <span className="h-px w-16 bg-white/35" />
                <span className="h-px w-12 bg-white/25" />
              </div>
            </div>
          </div>

          <div className="relative px-6 pt-6 pb-5">
            <div className="absolute top-0 left-0 h-24 w-24 rounded-full bg-orange-300/10 blur-3xl dark:bg-orange-500/10" />
            <div className="absolute right-0 bottom-0 h-20 w-20 rounded-full bg-rose-300/10 blur-3xl dark:bg-rose-500/10" />
            <div className="absolute top-1/2 -left-4 h-8 w-8 -translate-y-1/2 rounded-full border border-black/5 bg-neutral-50 shadow-inner dark:border-white/10 dark:bg-neutral-950" />
            <div className="absolute top-1/2 -right-4 h-8 w-8 -translate-y-1/2 rounded-full border border-black/5 bg-neutral-50 shadow-inner dark:border-white/10 dark:bg-neutral-950" />
            <div className="absolute inset-x-6 top-0 border-t border-dashed border-neutral-200 dark:border-neutral-700" />

            <div className="flex flex-col items-center">
              {tokenQuery.isLoading || !qrDataUrl ? (
                <div className={QR_FRAME_CLASS}>
                  <div className={QR_META_BAR_CLASS}>
                    <span className="h-2 w-10 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                    <QrCodeIcon className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                  </div>
                  <div className={QR_CODE_SURFACE_CLASS}>
                    <div className="absolute inset-0 grid grid-cols-8 gap-2 p-3">
                      {Array.from({ length: 64 }, (_, skeletonIndex) => skeletonIndex).map(
                        (skeletonIndex) => (
                          <div
                            key={`skeleton-${skeletonIndex}`}
                            className="animate-pulse rounded-sm bg-neutral-300 dark:bg-neutral-600"
                            style={{
                              animationDelay: `${(skeletonIndex % 8) * 50}ms`,
                              animationDuration: "1.5s",
                            }}
                          />
                        ),
                      )}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-lg bg-white/80 p-3 backdrop-blur-sm dark:bg-neutral-900/80">
                        <QrCodeIcon className="h-10 w-10 text-neutral-400 dark:text-neutral-600" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={QR_FRAME_CLASS}>
                  <div className={QR_META_BAR_CLASS}>
                    <span className="h-2 w-10 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                    <QrCodeIcon className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                  </div>
                  <div className="overflow-hidden rounded-[1.25rem] border border-black/5 bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_18px_40px_-32px_rgba(15,23,42,0.45)] dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.98)_0%,rgba(9,9,11,0.98)_100%)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_24px_50px_-36px_rgba(0,0,0,0.95)]">
                    <img
                      src={qrDataUrl}
                      alt="Check-in QR"
                      className="h-64 w-64 rounded-[0.95rem] bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 px-6 pt-1 pb-6">
            {expiresLabel && (
              <div className={VALID_UNTIL_CLASS}>
                <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                  <ClockIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium">
                    {t("expiresAt", { time: expiresLabel })}
                  </span>
                </div>
              </div>
            )}

            <Button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className={`w-full rounded-2xl py-3 text-white shadow-md disabled:opacity-50 ${TICKET_BUTTON_CLASS}`}
            >
              <ClockIcon className="mr-2 h-4 w-4" />
              {refreshing ? t("refreshing") : t("refresh")}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/70 shadow-sm dark:border-neutral-700/50 dark:bg-neutral-900/50">
        <div className="border-b border-neutral-200/70 px-4 py-3 dark:border-neutral-700/50">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
            <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            {t("tips.title")}
          </div>
        </div>
        <div className="space-y-2 px-4 py-4">
          <div className="flex gap-3">
            <span className="text-neutral-400 dark:text-neutral-600">•</span>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">{t("tips.brightness")}</p>
          </div>
          <div className="flex gap-3">
            <span className="text-neutral-400 dark:text-neutral-600">•</span>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">{t("tips.automatic")}</p>
          </div>
          <div className="flex gap-3">
            <span className="text-neutral-400 dark:text-neutral-600">•</span>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">{t("tips.manual")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
