"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import QrScanner from "qr-scanner";
import { useEffect, useRef, useState } from "react";

import { QrCodeIcon, CheckIcon, CloseIcon } from "@/components/shared/Icons";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/user/UserAvatar";
import { getUpcomingEvents } from "@/data/events-calendar";
import { ApiError } from "@/lib/api/errors";
import { authFetch } from "@/lib/api/query-utils";
import { API_ROUTES } from "@/lib/api/routes";
import { USER_ROLES } from "@/lib/config/roles";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectAuthRoles } from "@/lib/redux/selectors/authSelectors";
import { LOGIN_REASON, PAGE_ROUTES } from "@/lib/routes/pages";
import { extractTokenFromUrl, parseCheckInToken } from "@/lib/utils/check-in-token";
import { useHaptics } from "@/lib/utils/haptics";
import { makeAvatarSeedFromPublicId } from "@/lib/utils/hash-rng";
import { formatTimeUTC } from "@/lib/utils/locale";

function isCameraPermissionError(err: Error): boolean {
  return err.name === "NotAllowedError" || err.message.includes("permission");
}

function isCameraNotFoundError(err: Error): boolean {
  return err.name === "NotFoundError" || err.message.includes("not found");
}

function isCameraNotReadableError(err: Error): boolean {
  return err.name === "NotReadableError" || err.message.includes("not readable");
}

function isExpectedDecodeMiss(error: Error | string): boolean {
  const message = typeof error === "string" ? error : error.message;
  return message.includes("No QR code found");
}

interface ScanResult {
  email?: string;
  expired?: boolean;
  valid: boolean;
  publicId?: string;
  name?: string | null;
  error?: string;
  timestamp: number;
  checkedIn?: boolean;
  alreadyCheckedIn?: boolean;
}

export function ReaderClient() {
  const t = useTranslations("reader");
  const pathname = usePathname();
  const router = useRouter();
  const haptics = useHaptics();
  const auth = useAppSelector((state) => state.auth);
  const userRoles = useAppSelector(selectAuthRoles);
  const [hasMounted, setHasMounted] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const scannerRef = useRef<QrScanner | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  const events = getUpcomingEvents(new Date());
  const isCrew = userRoles.includes(USER_ROLES.CREW);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (auth.hydrated && (!auth.isAuthenticated || !isCrew)) {
      router.replace(PAGE_ROUTES.ME);
    }
  }, [auth.hydrated, auth.isAuthenticated, isCrew, router]);

  const destroyScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
  };

  const setInvalidScanResult = (
    errorMessage: string,
    options: Pick<ScanResult, "email" | "expired" | "name" | "publicId"> = {},
  ) => {
    if (options.expired) {
      haptics.neutral();
    } else {
      haptics.error();
    }
    setScanResult({
      ...options,
      valid: false,
      error: errorMessage,
      timestamp: Date.now(),
    });
  };

  const resetReaderState = () => {
    destroyScanner();
    isProcessingRef.current = false;
    setSelectedEvent("");
    setIsScanning(false);
    setScanResult(null);
    setError(null);
    setIsVerifying(false);
    setIsCheckingIn(false);
  };

  useEffect(
    () => () => {
      destroyScanner();
    },
    [],
  );

  useEffect(() => {
    const handlePageHide = () => {
      destroyScanner();
      isProcessingRef.current = false;
    };

    const handlePageShow = () => {
      resetReaderState();
    };

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  useEffect(() => {
    resetReaderState();
  }, [pathname]);

  if (!hasMounted || !auth.hydrated) {
    return (
      <div className="mx-auto w-full max-w-2xl px-2 sm:px-0">
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="text-xs text-neutral-600 sm:text-sm dark:text-neutral-400">
            {t("loading")}
          </div>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated || !isCrew) {
    return (
      <div className="mx-auto w-full max-w-2xl px-2 sm:px-0">
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 sm:px-4 sm:py-3 sm:text-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {t("errors.accessDenied")}
        </div>
      </div>
    );
  }

  const stopScanner = () => {
    destroyScanner();
    setIsScanning(false);
  };

  const handleStopReader = () => {
    stopScanner();
    setIsVerifying(false);
    setScanResult(null);
    isProcessingRef.current = false;
  };

  const handleScanSuccess = async (decodedText: string) => {
    if (isProcessingRef.current) {
      return;
    }

    const token = extractTokenFromUrl(decodedText);

    if (!token) {
      return;
    }

    isProcessingRef.current = true;
    setScanResult(null);
    stopScanner();

    const parsed = parseCheckInToken(token);
    const isExpiredToken = parsed.error === "Token expired";

    if (!parsed.valid && !isExpiredToken) {
      setIsVerifying(false);
      let errorMessage = t("errors.contentInvalid");
      if (parsed.error?.includes("format") || parsed.error?.includes("version")) {
        errorMessage = t("errors.contentInvalid");
      }
      setInvalidScanResult(errorMessage);
      isProcessingRef.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      isProcessingRef.current = false;
      setIsVerifying(false);
    }, 10000);

    setIsVerifying(true);

    try {
      const response = await authFetch(API_ROUTES.CHECK_IN.VERIFY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();
      setIsVerifying(false);

      if (result.valid) {
        clearTimeout(timeoutId);
        haptics.success();
        setScanResult({
          email: result.email,
          valid: true,
          publicId: result.publicId,
          name: result.name,
          timestamp: Date.now(),
          checkedIn: false,
        });
        isProcessingRef.current = false;
      } else if (result.expired) {
        clearTimeout(timeoutId);
        setInvalidScanResult(t("result.ticketExpired"), {
          email: result.email,
          expired: true,
          name: result.name,
          publicId: result.publicId,
        });
        isProcessingRef.current = false;
      } else {
        clearTimeout(timeoutId);
        let errorMessage = t("errors.verificationFailed");
        const isInvalidSignature = result.error === "Invalid signature";
        if (isInvalidSignature) {
          errorMessage = t("errors.signatureInvalid");
        } else if (result.error === "Token expired") {
          errorMessage = t("errors.tokenExpired");
        } else if (result.error) {
          let isContentError = false;
          if (result.error.includes("format")) {
            isContentError = true;
          } else if (result.error.includes("version")) {
            isContentError = true;
          }
          if (isContentError) {
            errorMessage = t("errors.contentInvalid");
          } else {
            errorMessage = result.error;
          }
        }
        setInvalidScanResult(errorMessage);
        isProcessingRef.current = false;
      }
    } catch (err) {
      clearTimeout(timeoutId);
      setIsVerifying(false);
      if (err instanceof ApiError && err.status === 401) {
        router.replace(PAGE_ROUTES.LOGIN_WITH_REASON(LOGIN_REASON.SESSION_EXPIRED));
        return;
      }
      setInvalidScanResult(t("errors.verificationFailed"));
      isProcessingRef.current = false;
    }
  };

  const handleStartReader = async () => {
    if (!selectedEvent) {
      haptics.neutral();
      setError(t("errors.noEventSelected"));
      return;
    }

    setError(null);
    setScanResult(null);
    setIsVerifying(false);
    isProcessingRef.current = false;

    setIsScanning(true);

    const maxAttempts = 20;
    const delay = (ms: number) =>
      new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, ms);
      });

    const waitForVideo = async (attempt = 0): Promise<HTMLVideoElement | null> => {
      if (attempt >= maxAttempts) {
        return null;
      }
      const element = videoRef.current;
      if (element) {
        return element;
      }
      await delay(50);
      return waitForVideo(attempt + 1);
    };

    const videoElement = await waitForVideo();

    if (!videoElement) {
      haptics.error();
      setError(t("errors.cameraAccessFailed"));
      setIsScanning(false);
      return;
    }

    try {
      const scanner = new QrScanner(
        videoElement,
        (result) => {
          handleScanSuccess(result.data).catch(() => undefined);
        },
        {
          maxScansPerSecond: 25,
          onDecodeError: (scanError) => {
            if (isExpectedDecodeMiss(scanError)) {
              return;
            }
            console.error("QR decode error:", scanError);
          },
          preferredCamera: "environment",
          returnDetailedScanResult: true,
        },
      );
      scanner.setInversionMode("both");
      scannerRef.current = scanner;

      try {
        await scanner.start();
      } catch (cameraError) {
        console.error("Camera error:", cameraError);
        const scannerError =
          cameraError instanceof Error ? cameraError : new Error(String(cameraError));

        if (isCameraPermissionError(scannerError)) {
          haptics.error();
          setError(t("errors.cameraPermissionDenied"));
          setIsScanning(false);
          destroyScanner();
          return;
        }

        if (isCameraNotFoundError(scannerError)) {
          haptics.error();
          setError(t("errors.cameraNotFound"));
          setIsScanning(false);
          destroyScanner();
          return;
        }

        if (isCameraNotReadableError(scannerError)) {
          haptics.error();
          setError(t("errors.cameraNotReadable"));
          setIsScanning(false);
          destroyScanner();
          return;
        }

        haptics.error();
        setError(t("errors.cameraAccessFailed"));
        setIsScanning(false);
        destroyScanner();
      }
    } catch {
      haptics.error();
      setError(t("errors.cameraAccessFailed"));
      setIsScanning(false);
      destroyScanner();
    }
  };

  const handleCheckIn = async () => {
    if (!scanResult?.valid || !scanResult.publicId || !selectedEvent || isCheckingIn) {
      return;
    }

    setIsCheckingIn(true);
    setError(null);

    try {
      const response = await authFetch(API_ROUTES.CHECK_IN.BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: scanResult.publicId,
          eventId: selectedEvent,
        }),
      });

      const result = await response.json();

      if (result.success) {
        haptics.success();
        setScanResult({
          ...scanResult,
          checkedIn: true,
        });
      } else if (result.alreadyCheckedIn) {
        haptics.neutral();
        setScanResult({
          ...scanResult,
          alreadyCheckedIn: true,
        });
      } else if (result.error) {
        haptics.error();
        setError(result.error);
      } else {
        haptics.error();
        setError(t("errors.checkInFailed"));
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setIsCheckingIn(false);
        router.replace(PAGE_ROUTES.LOGIN_WITH_REASON(LOGIN_REASON.SESSION_EXPIRED));
        return;
      }
      haptics.error();
      setError(t("errors.checkInFailed"));
    }
    setIsCheckingIn(false);
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-2 sm:space-y-6 sm:px-0">
      <div className="space-y-3 sm:space-y-4">
        <div>
          <label
            htmlFor="event-select"
            className="mb-1.5 block text-xs font-medium text-neutral-700 sm:mb-2 sm:text-sm dark:text-neutral-300"
          >
            {t("selectEvent")}
          </label>
          <select
            id="event-select"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            disabled={isScanning}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500 focus:outline-none disabled:opacity-50 sm:px-4 sm:py-2 sm:text-base dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:focus:border-neutral-400 dark:focus:ring-neutral-400"
          >
            <option value="">{t("selectEventPlaceholder")}</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 sm:gap-3">
          {!isScanning ? (
            <Button
              onClick={handleStartReader}
              disabled={!selectedEvent}
              className="flex-1 bg-gradient-to-r from-orange-500 via-pink-600 to-red-600 py-3 text-sm font-medium text-white shadow-md hover:shadow-lg disabled:opacity-50 sm:py-3 sm:text-base"
            >
              <QrCodeIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              {t("startReader")}
            </Button>
          ) : (
            <Button
              onClick={handleStopReader}
              className="flex-1 bg-red-600 py-3 text-sm font-medium text-white shadow-md hover:bg-red-700 sm:py-3 sm:text-base dark:bg-red-500 dark:hover:bg-red-600"
            >
              <CloseIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              {t("stopReader")}
            </Button>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 sm:px-4 sm:py-3 sm:text-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}

        {isScanning && (
          <div className="space-y-3 sm:space-y-4">
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-black shadow-lg sm:rounded-2xl dark:border-neutral-700">
              <div className="aspect-square w-full">
                <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
              </div>
            </div>
            {isVerifying && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs text-blue-700 sm:px-4 sm:py-3 sm:text-sm dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
                {t("messages.qrDetected")}
              </div>
            )}
          </div>
        )}

        {scanResult && (
          <div
            className={`overflow-hidden rounded-xl border shadow-lg sm:rounded-2xl ${
              scanResult.valid
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10"
                : scanResult.expired
                  ? "border-orange-200 bg-orange-50 dark:border-orange-500/30 dark:bg-orange-500/10"
                  : "border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10"
            }`}
          >
            <div className="px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex items-start gap-3 sm:gap-4">
                {scanResult.valid && scanResult.publicId ? (
                  <UserAvatar
                    avatarSeed={makeAvatarSeedFromPublicId(scanResult.publicId)}
                    size={64}
                    name={scanResult.name}
                    className="shrink-0 border-2 border-emerald-200 shadow-md sm:border-emerald-300 dark:border-emerald-500/40 dark:shadow-emerald-500/20"
                  />
                ) : (
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-md sm:h-14 sm:w-14 ${
                      scanResult.valid
                        ? "bg-emerald-600 dark:bg-emerald-500"
                        : scanResult.expired
                          ? "bg-orange-500 dark:bg-orange-400"
                          : "bg-red-600 dark:bg-red-500"
                    }`}
                  >
                    {scanResult.valid ? (
                      <CheckIcon className="h-6 w-6 text-white sm:h-7 sm:w-7" />
                    ) : scanResult.expired ? (
                      <CloseIcon className="h-6 w-6 text-white sm:h-7 sm:w-7" />
                    ) : (
                      <CloseIcon className="h-6 w-6 text-white sm:h-7 sm:w-7" />
                    )}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`text-sm font-bold sm:text-base ${
                          scanResult.valid
                            ? "text-emerald-900 dark:text-emerald-100"
                            : scanResult.expired
                              ? "text-orange-900 dark:text-orange-100"
                              : "text-red-900 dark:text-red-100"
                        }`}
                      >
                        {scanResult.valid
                          ? t("result.valid")
                          : scanResult.expired
                            ? t("result.expired")
                            : t("result.invalid")}
                      </div>
                      {scanResult.valid && (
                        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-600 dark:bg-emerald-400" />
                      )}
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        scanResult.valid
                          ? "text-emerald-600/70 dark:text-emerald-300/70"
                          : scanResult.expired
                            ? "text-orange-600/70 dark:text-orange-300/70"
                            : "text-red-600/70 dark:text-red-300/70"
                      }`}
                    >
                      {formatTimeUTC(new Date(scanResult.timestamp).toISOString())}
                    </div>
                  </div>
                  {(scanResult.valid || scanResult.expired) && scanResult.name && (
                    <div
                      className={`mb-2 text-base font-semibold sm:text-lg ${
                        scanResult.valid
                          ? "text-emerald-900 dark:text-emerald-100"
                          : "text-orange-900 dark:text-orange-100"
                      }`}
                    >
                      {scanResult.name}
                    </div>
                  )}
                  {(scanResult.valid || scanResult.expired) && scanResult.publicId && (
                    <div className="mb-3 space-y-1.5">
                      <div
                        className={`text-xs font-medium tracking-wide uppercase ${
                          scanResult.valid
                            ? "text-emerald-800/70 dark:text-emerald-200/70"
                            : "text-orange-800/70 dark:text-orange-200/70"
                        }`}
                      >
                        {t("result.userId")}
                      </div>
                      <div
                        className={`rounded-md px-2.5 py-1.5 font-mono text-sm ${
                          scanResult.valid
                            ? "border border-emerald-200/50 bg-emerald-100/50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-100"
                            : "border border-orange-200/60 bg-orange-100/60 text-orange-900 dark:border-orange-500/30 dark:bg-orange-500/20 dark:text-orange-100"
                        }`}
                      >
                        {scanResult.publicId}
                      </div>
                    </div>
                  )}
                  {scanResult.expired && scanResult.email && (
                    <div className="mb-3 space-y-1.5">
                      <div className="text-xs font-medium tracking-wide text-orange-800/70 uppercase dark:text-orange-200/70">
                        {t("result.email")}
                      </div>
                      <div className="rounded-md border border-orange-200/60 bg-orange-100/60 px-2.5 py-1.5 text-sm break-all text-orange-900 dark:border-orange-500/30 dark:bg-orange-500/20 dark:text-orange-100">
                        {scanResult.email}
                      </div>
                    </div>
                  )}
                  {!scanResult.valid && scanResult.error && (
                    <div
                      className={`mt-2 text-sm ${
                        scanResult.expired
                          ? "text-orange-800 dark:text-orange-200"
                          : "text-red-800 dark:text-red-200"
                      }`}
                    >
                      {scanResult.error}
                    </div>
                  )}
                  {scanResult.valid && scanResult.checkedIn && (
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-emerald-300/50 bg-emerald-200/60 px-3 py-1.5 dark:border-emerald-500/40 dark:bg-emerald-500/30">
                      <CheckIcon className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                      <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                        {t("result.checkedIn")}
                      </span>
                    </div>
                  )}
                  {scanResult.valid && scanResult.alreadyCheckedIn && (
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-yellow-300/50 bg-yellow-200/60 px-3 py-1.5 dark:border-yellow-500/40 dark:bg-yellow-500/30">
                      <CheckIcon className="h-4 w-4 text-yellow-700 dark:text-yellow-300" />
                      <span className="text-xs font-semibold text-yellow-800 dark:text-yellow-200">
                        {t("result.alreadyCheckedIn")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {scanResult.valid &&
              scanResult.publicId &&
              !scanResult.checkedIn &&
              !scanResult.alreadyCheckedIn && (
                <div className="border-t border-emerald-200/50 px-4 pt-4 pb-4 sm:px-6 sm:pb-5 dark:border-emerald-500/20">
                  <Button
                    onClick={handleCheckIn}
                    disabled={isCheckingIn || !selectedEvent}
                    variant="plain"
                    className="w-full bg-emerald-600 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-emerald-700 disabled:opacity-50 sm:py-3.5 sm:text-base dark:bg-emerald-500 dark:hover:bg-emerald-600"
                  >
                    {isCheckingIn ? t("checkingIn") : t("checkIn")}
                  </Button>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
