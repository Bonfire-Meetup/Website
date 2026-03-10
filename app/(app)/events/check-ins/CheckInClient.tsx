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
const TICKET_HEADER_PANEL_CLASS =
  "mx-auto w-full max-w-[17rem] rounded-[1.5rem] border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_100%)] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_18px_40px_-28px_rgba(120,53,15,0.45)] backdrop-blur-md dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_100%)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_40px_-28px_rgba(0,0,0,0.5)]";
const TICKET_SHELL_CLASS =
  "relative overflow-hidden rounded-[2rem] border border-white/45 bg-white/28 shadow-[0_40px_120px_-52px_rgba(15,23,42,0.58)] ring-1 ring-white/55 backdrop-blur-2xl dark:border-white/8 dark:bg-neutral-950/24 dark:ring-white/8";
const TICKET_SURFACE_CLASS =
  "bg-[linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(255,248,240,0.34)_45%,rgba(255,255,255,0.22)_100%)] dark:bg-[linear-gradient(180deg,rgba(24,24,28,0.3)_0%,rgba(12,12,14,0.2)_48%,rgba(6,6,8,0.14)_100%)] backdrop-blur-2xl";
const QR_FRAME_CLASS =
  "relative rounded-[1.75rem] border border-white/45 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.78),rgba(255,255,255,0.56)_34%,rgba(255,244,238,0.44)_62%,rgba(255,255,255,0.28)_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(255,255,255,0.42),0_24px_55px_-34px_rgba(15,23,42,0.38)] backdrop-blur-xl dark:border-white/12 dark:bg-[radial-gradient(circle_at_top,rgba(80,80,88,0.34),rgba(34,34,38,0.3)_38%,rgba(14,14,18,0.22)_100%)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(255,255,255,0.03),0_24px_55px_-34px_rgba(0,0,0,0.55)]";
const QR_META_BAR_CLASS =
  "mb-3 flex items-center justify-between rounded-full border border-white/45 bg-white/36 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-xl dark:border-white/10 dark:bg-white/8 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]";
const QR_CODE_SURFACE_CLASS =
  "relative h-64 w-64 overflow-hidden rounded-[1.25rem] border border-white/45 bg-white/56 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_20px_44px_-34px_rgba(15,23,42,0.22)] backdrop-blur-md dark:border-white/10 dark:bg-white/7 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_44px_-34px_rgba(0,0,0,0.5)]";
const VALID_UNTIL_CLASS =
  "flex min-h-[50px] items-center justify-between rounded-2xl border border-white/40 bg-white/34 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_18px_38px_-34px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-white/7 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_38px_-34px_rgba(0,0,0,0.45)]";
const TICKET_BUTTON_CLASS =
  "border border-white/20 bg-gradient-to-r from-rose-700 via-orange-500 to-red-600 shadow-[0_18px_38px_-24px_rgba(234,88,12,0.6)] hover:shadow-[0_20px_44px_-22px_rgba(234,88,12,0.7)] hover:from-rose-800 hover:via-orange-600 hover:to-red-700";

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
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.72),transparent_34%),radial-gradient(circle_at_88%_12%,rgba(255,255,255,0.3),transparent_22%),linear-gradient(135deg,rgba(255,255,255,0.24),transparent_46%,rgba(255,255,255,0.08)_68%,transparent_82%)] dark:bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.08),transparent_26%),radial-gradient(circle_at_88%_12%,rgba(255,255,255,0.04),transparent_18%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_44%,rgba(255,255,255,0.015)_70%,transparent_84%)]" />
        <div className="pointer-events-none absolute inset-[1px] rounded-[calc(2rem-1px)] bg-[linear-gradient(180deg,rgba(255,255,255,0.26),transparent_18%,transparent_78%,rgba(255,255,255,0.12)_100%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_18%,transparent_82%,rgba(255,255,255,0.02)_100%)]" />
        <div
          className={`relative overflow-hidden rounded-[calc(2rem-1px)] ${TICKET_SURFACE_CLASS}`}
        >
          <div className={`relative h-30 sm:h-36 ${TICKET_GRADIENT_CLASS}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.22),transparent_24%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.18)_35%,transparent_52%,rgba(255,255,255,0.08)_68%,transparent_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-white/30" />
            <div className="absolute -top-6 right-6 h-20 w-20 rounded-full bg-white/16 blur-2xl dark:bg-white/6" />
            <div className="absolute bottom-2 left-8 h-14 w-24 rounded-full bg-amber-200/18 blur-2xl dark:bg-orange-300/8" />
            <div className="relative flex h-full flex-col justify-center px-5 py-4 sm:px-6 sm:py-5">
              <div className={TICKET_HEADER_PANEL_CLASS}>
                <div className="mb-2 flex items-center justify-center gap-2">
                  <span className="h-px w-6 bg-white/35" />
                  <div className="text-[11px] font-semibold tracking-[0.18em] text-white/80 uppercase sm:text-sm sm:tracking-[0.24em]">
                    {t("ticket.header")}
                  </div>
                  <span className="h-px w-6 bg-white/35" />
                </div>
                <div className="text-center text-[1.8rem] leading-none font-black tracking-[0.08em] text-white uppercase drop-shadow-[0_10px_24px_rgba(0,0,0,0.2)] sm:text-3xl sm:tracking-[0.14em]">
                  {t("ticket.label")}
                </div>
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
                    <div className="pointer-events-none absolute inset-x-8 top-3 h-8 rounded-full bg-white/35 blur-xl dark:bg-white/8" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-lg border border-white/40 bg-white/55 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-md dark:border-white/10 dark:bg-white/8 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
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
                  <div className={QR_CODE_SURFACE_CLASS}>
                    <div className="pointer-events-none absolute inset-x-8 top-3 z-10 h-8 rounded-full bg-white/35 blur-xl dark:bg-white/8" />
                    <img
                      src={qrDataUrl}
                      alt="Check-in QR"
                      className="absolute inset-3 z-0 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] rounded-[0.95rem] bg-white shadow-[0_10px_20px_-16px_rgba(15,23,42,0.35)]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 px-6 pt-1 pb-6">
            <div className={VALID_UNTIL_CLASS}>
              {expiresLabel ? (
                <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                  <ClockIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium">
                    {t("expiresAt", { time: expiresLabel })}
                  </span>
                </div>
              ) : (
                <div className="h-5 w-40 rounded-full bg-neutral-200/90 dark:bg-white/12" />
              )}
            </div>

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
