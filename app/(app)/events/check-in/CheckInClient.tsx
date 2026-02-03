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

export function CheckInClient() {
  const t = useTranslations("checkIn");
  const locale = useLocale();
  const router = useRouter();
  const auth = useAppSelector((state) => state.auth);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const tokenQuery = useCheckInToken(auth.hydrated && auth.isAuthenticated);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());

  useEffect(() => {
    if (tokenQuery.error instanceof ApiError && tokenQuery.error.status === 401) {
      router.replace(PAGE_ROUTES.LOGIN_WITH_REASON(LOGIN_REASON.SESSION_EXPIRED));
    }
  }, [tokenQuery.error, router]);

  const tokenValue = tokenQuery.data?.token ?? null;

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
      setQrDataUrl(null);
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

  const expiresLabel = useMemo(() => {
    if (!tokenQuery.data?.expiresAt) {
      return null;
    }
    return formatTimeUTC(tokenQuery.data.expiresAt, locale);
  }, [locale, tokenQuery.data?.expiresAt]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await tokenQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  };

  if (tokenQuery.isError) {
    return (
      <div className="mx-auto max-w-md pt-4">
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
    <div className="mx-auto max-w-md pt-4">
      <div className="overflow-hidden rounded-3xl shadow-2xl">
        <div className="relative h-32 bg-gradient-to-br from-orange-500 via-pink-600 to-purple-600">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
          <div className="relative flex h-full flex-col items-center justify-center px-6">
            <div className="mb-2 text-sm font-medium tracking-wider text-white/90 uppercase">
              {t("ticket.header")}
            </div>
            <div className="text-2xl font-black text-white">{t("ticket.label")}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900">
          <div className="relative border-b border-dashed border-neutral-200 px-6 py-8 dark:border-neutral-700">
            <div className="absolute top-1/2 -left-4 h-8 w-8 -translate-y-1/2 rounded-full bg-neutral-50 dark:bg-neutral-950" />
            <div className="absolute top-1/2 -right-4 h-8 w-8 -translate-y-1/2 rounded-full bg-neutral-50 dark:bg-neutral-950" />

            <div className="flex flex-col items-center">
              {tokenQuery.isLoading || !qrDataUrl ? (
                <div className="rounded-2xl bg-white p-4 shadow-inner">
                  <div className="relative h-64 w-64 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <div className="absolute inset-0 grid grid-cols-8 gap-2 p-3">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div
                          key={`skeleton-${i}`}
                          className="animate-pulse rounded-sm bg-neutral-300 dark:bg-neutral-600"
                          style={{
                            animationDelay: `${(i % 8) * 50}ms`,
                            animationDuration: "1.5s",
                          }}
                        />
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-lg bg-white/80 p-3 backdrop-blur-sm dark:bg-neutral-900/80">
                        <QrCodeIcon className="h-10 w-10 text-neutral-400 dark:text-neutral-600" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-white p-4 shadow-inner">
                  <img src={qrDataUrl} alt="Check-in QR" className="h-64 w-64" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 px-6 py-6">
            {expiresLabel && (
              <div className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3 dark:bg-neutral-800/50">
                <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                  <ClockIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {t("expiresAt", { time: expiresLabel })}
                  </span>
                </div>
              </div>
            )}

            <Button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="w-full bg-gradient-to-r from-orange-500 via-pink-600 to-purple-600 py-3 text-white shadow-md hover:shadow-lg disabled:opacity-50"
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
