"use client";

import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { QrCodeIcon, CheckIcon, CloseIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/user/UserAvatar";
import { upcomingEvents } from "@/data/upcoming-events";
import { getValidAccessToken } from "@/lib/api/query-utils";
import { USER_ROLES } from "@/lib/config/roles";
import { useAppSelector } from "@/lib/redux/hooks";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { extractTokenFromUrl, parseCheckInToken } from "@/lib/utils/check-in-token";
import { createAuthHeaders } from "@/lib/utils/http";

interface ScanResult {
  valid: boolean;
  userId?: string;
  name?: string | null;
  emailHash?: string;
  error?: string;
  timestamp: number;
  checkedIn?: boolean;
  alreadyCheckedIn?: boolean;
}

export function ReaderClient() {
  const t = useTranslations("reader");
  const router = useRouter();
  const auth = useAppSelector((state) => state.auth);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  const events = upcomingEvents;
  const userRoles = auth.user?.decodedToken?.rol ?? [];
  const isCrew = userRoles.includes(USER_ROLES.CREW);

  useEffect(() => {
    if (auth.hydrated && (!auth.isAuthenticated || !isCrew)) {
      router.replace(PAGE_ROUTES.ME);
    }
  }, [auth.hydrated, auth.isAuthenticated, isCrew, router]);

  useEffect(
    () => () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current = null;
          })
          .catch(() => {
            scannerRef.current = null;
          });
      }
    },
    [],
  );

  if (!auth.hydrated) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4 px-2 sm:space-y-6 sm:px-0">
        <div className="space-y-1 text-center sm:space-y-2">
          <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl dark:text-white">
            {t("pageTitle")}
          </h1>
          <p className="text-xs text-neutral-600 sm:text-sm dark:text-neutral-400">
            {t("pageSubtitle")}
          </p>
        </div>
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
      <div className="mx-auto w-full max-w-2xl space-y-4 px-2 sm:space-y-6 sm:px-0">
        <div className="space-y-1 text-center sm:space-y-2">
          <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl dark:text-white">
            {t("pageTitle")}
          </h1>
          <p className="text-xs text-neutral-600 sm:text-sm dark:text-neutral-400">
            {t("pageSubtitle")}
          </p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 sm:px-4 sm:py-3 sm:text-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {t("errors.accessDenied")}
        </div>
      </div>
    );
  }

  const handleStartReader = async () => {
    if (!selectedEvent) {
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

    const waitForContainer = async (attempt = 0): Promise<HTMLElement | null> => {
      if (attempt >= maxAttempts) {
        return null;
      }
      const element = document.getElementById("qr-reader-container");
      if (element) {
        return element;
      }
      await delay(50);
      return waitForContainer(attempt + 1);
    };

    const containerElement = await waitForContainer();

    if (!containerElement) {
      setError(t("errors.scannerContainerNotFound"));
      setIsScanning(false);
      return;
    }

    try {
      const isIOS =
        typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);

      const scanner = new Html5Qrcode("qr-reader-container", {
        useBarCodeDetectorIfSupported: !isIOS,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerRef.current = scanner;

      const config = {
        fps: 10,
        qrbox: (vw: number, vh: number) => {
          const min = Math.min(vw, vh);
          const size = Math.floor(min * 0.7);
          return { width: size, height: size };
        },
        disableFlip: false,
      };

      try {
        await scanner.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            handleScanSuccess(decodedText).catch(() => {
              // Ignore scan errors
            });
          },
          () => {
            // Ignore scan errors
          },
        );
      } catch (cameraError) {
        console.error("Camera error:", cameraError);
        if (cameraError instanceof Error) {
          if (
            cameraError.name === "NotAllowedError" ||
            cameraError.message.includes("permission")
          ) {
            setError(t("errors.cameraPermissionDenied"));
            setIsScanning(false);
            scannerRef.current = null;
            return;
          } else if (
            cameraError.name === "NotFoundError" ||
            cameraError.message.includes("not found")
          ) {
            setError(t("errors.cameraNotFound"));
            setIsScanning(false);
            scannerRef.current = null;
            return;
          } else if (
            cameraError.name === "NotReadableError" ||
            cameraError.message.includes("not readable")
          ) {
            setError(t("errors.cameraNotReadable"));
            setIsScanning(false);
            scannerRef.current = null;
            return;
          }
          try {
            const constraints: MediaTrackConstraints = {
              facingMode: { ideal: "environment" },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            };

            await scanner.start(
              constraints,
              config,
              (decodedText) => {
                handleScanSuccess(decodedText).catch(() => {
                  // Ignore scan errors
                });
              },
              () => {
                // Ignore scan errors
              },
            );
          } catch (constraintsError) {
            console.error("Constraints error:", constraintsError);
            try {
              await scanner.start(
                { facingMode: "user" },
                config,
                (decodedText) => {
                  handleScanSuccess(decodedText).catch(() => {
                    // Ignore scan errors
                  });
                },
                () => {
                  // Ignore scan errors
                },
              );
            } catch (fallbackError) {
              console.error("Fallback error:", fallbackError);
              setError(t("errors.cameraAccessFailed"));
              setIsScanning(false);
              scannerRef.current = null;
            }
          }
        } else {
          console.error("Unknown camera error:", cameraError);
          setError(t("errors.cameraAccessFailed"));
          setIsScanning(false);
          scannerRef.current = null;
        }
      }
    } catch {
      setError(t("errors.cameraAccessFailed"));
      setIsScanning(false);
      scannerRef.current = null;
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch {
        // Ignore cleanup errors
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleStopReader = async () => {
    await stopScanner();
    setIsVerifying(false);
    setScanResult(null);
    isProcessingRef.current = false;
  };

  const handleScanSuccess = async (decodedText: string) => {
    if (isProcessingRef.current) {
      return;
    }
    isProcessingRef.current = true;

    const timeoutId = setTimeout(() => {
      isProcessingRef.current = false;
      setIsVerifying(false);
    }, 10000);

    setIsVerifying(true);
    setScanResult(null);

    const token = extractTokenFromUrl(decodedText);

    if (!token) {
      clearTimeout(timeoutId);
      setIsVerifying(false);
      setScanResult({
        valid: false,
        error: t("errors.contentInvalid"),
        timestamp: Date.now(),
      });
      isProcessingRef.current = false;
      return;
    }

    const parsed = parseCheckInToken(token);

    if (!parsed.valid) {
      clearTimeout(timeoutId);
      setIsVerifying(false);
      let errorMessage = t("errors.contentInvalid");
      if (parsed.error === "Token expired") {
        errorMessage = t("errors.tokenExpired");
      } else if (parsed.error?.includes("format") || parsed.error?.includes("version")) {
        errorMessage = t("errors.contentInvalid");
      }
      setScanResult({
        valid: false,
        error: errorMessage,
        timestamp: Date.now(),
      });
      isProcessingRef.current = false;
      return;
    }

    try {
      const accessToken = getValidAccessToken();
      if (!accessToken) {
        clearTimeout(timeoutId);
        setIsVerifying(false);
        setScanResult({
          valid: false,
          error: t("errors.verificationFailed"),
          timestamp: Date.now(),
        });
        isProcessingRef.current = false;
        return;
      }

      const response = await fetch("/api/v1/check-in/verify", {
        method: "POST",
        headers: {
          ...createAuthHeaders(accessToken),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();
      setIsVerifying(false);

      if (result.valid) {
        clearTimeout(timeoutId);
        setScanResult({
          valid: true,
          userId: result.userId,
          name: result.name,
          emailHash: result.emailHash,
          timestamp: Date.now(),
          checkedIn: false,
        });
        await stopScanner();
        isProcessingRef.current = false;
      } else {
        clearTimeout(timeoutId);
        let errorMessage = t("errors.verificationFailed");
        const isInvalidSignature = result.error === "Invalid signature";
        if (isInvalidSignature) {
          errorMessage = t("errors.signatureInvalid");
        } else if (result.error === "Token expired") {
          errorMessage = t("errors.tokenExpired");
        } else if (result.error?.includes("format") || result.error?.includes("version")) {
          errorMessage = t("errors.contentInvalid");
        } else if (result.error) {
          errorMessage = result.error;
        }
        setScanResult({
          valid: false,
          error: errorMessage,
          timestamp: Date.now(),
        });
        if (isInvalidSignature) {
          await stopScanner();
        }
        isProcessingRef.current = false;
      }
    } catch {
      clearTimeout(timeoutId);
      setIsVerifying(false);
      setScanResult({
        valid: false,
        error: t("errors.verificationFailed"),
        timestamp: Date.now(),
      });
      isProcessingRef.current = false;
    }
  };

  const handleCheckIn = async () => {
    if (!scanResult?.valid || !scanResult.userId || !selectedEvent || isCheckingIn) {
      return;
    }

    setIsCheckingIn(true);
    setError(null);

    try {
      const accessToken = getValidAccessToken();
      if (!accessToken) {
        setError(t("errors.verificationFailed"));
        setIsCheckingIn(false);
        return;
      }

      const response = await fetch("/api/v1/check-in", {
        method: "POST",
        headers: {
          ...createAuthHeaders(accessToken),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: scanResult.userId,
          eventId: selectedEvent,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setScanResult({
          ...scanResult,
          checkedIn: true,
        });
      } else if (result.alreadyCheckedIn) {
        setScanResult({
          ...scanResult,
          alreadyCheckedIn: true,
        });
        setError(t("errors.alreadyCheckedIn"));
      } else {
        setError(result.error ?? t("errors.checkInFailed"));
      }
    } catch {
      setError(t("errors.checkInFailed"));
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-2 sm:space-y-6 sm:px-0">
      <div className="space-y-1 text-center sm:space-y-2">
        <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl dark:text-white">
          {t("pageTitle")}
        </h1>
        <p className="text-xs text-neutral-600 sm:text-sm dark:text-neutral-400">
          {t("pageSubtitle")}
        </p>
      </div>

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
              className="flex-1 bg-gradient-to-r from-orange-500 via-pink-600 to-purple-600 py-3 text-sm font-medium text-white shadow-md hover:shadow-lg disabled:opacity-50 sm:py-3 sm:text-base"
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
              <div id="qr-reader-container" className="qr-scanner-container aspect-square w-full" />
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
            className={`overflow-hidden rounded-xl border px-4 py-3 shadow-lg sm:rounded-2xl sm:px-6 sm:py-4 ${
              scanResult.valid
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10"
                : "border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10"
            }`}
          >
            <div className="flex items-start gap-2.5 sm:gap-3">
              {scanResult.valid && scanResult.emailHash ? (
                <UserAvatar
                  emailHash={scanResult.emailHash}
                  size={56}
                  name={scanResult.name}
                  className="mt-0.5 shrink-0 border-2 border-emerald-200 shadow-sm sm:mt-0 dark:border-emerald-500/30"
                />
              ) : (
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8 ${
                    scanResult.valid
                      ? "bg-emerald-600 dark:bg-emerald-500"
                      : "bg-red-600 dark:bg-red-500"
                  }`}
                >
                  {scanResult.valid ? (
                    <CheckIcon className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                  ) : (
                    <CloseIcon className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                  )}
                </div>
              )}
              <div className="flex-1 space-y-0.5 sm:space-y-1">
                <div
                  className={`text-xs font-semibold sm:text-sm ${
                    scanResult.valid
                      ? "text-emerald-900 dark:text-emerald-200"
                      : "text-red-900 dark:text-red-200"
                  }`}
                >
                  {scanResult.valid ? t("result.valid") : t("result.invalid")}
                </div>
                {scanResult.valid && scanResult.name && (
                  <div className="text-sm font-medium text-emerald-900 sm:text-base dark:text-emerald-200">
                    {scanResult.name}
                  </div>
                )}
                {scanResult.valid && scanResult.userId && (
                  <div className="text-xs text-emerald-700 dark:text-emerald-300">
                    {t("result.userId")}: {scanResult.userId}
                  </div>
                )}
                {!scanResult.valid && scanResult.error && (
                  <div className="text-xs text-red-700 dark:text-red-300">{scanResult.error}</div>
                )}
                {scanResult.valid && scanResult.checkedIn && (
                  <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    {t("result.checkedIn")}
                  </div>
                )}
                {scanResult.valid && scanResult.alreadyCheckedIn && (
                  <div className="text-xs font-medium text-amber-700 dark:text-amber-300">
                    {t("result.alreadyCheckedIn")}
                  </div>
                )}
                <div
                  className={`text-xs ${
                    scanResult.valid
                      ? "text-emerald-600/70 dark:text-emerald-300/70"
                      : "text-red-600/70 dark:text-red-300/70"
                  }`}
                >
                  {new Date(scanResult.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
            {scanResult.valid &&
              scanResult.userId &&
              !scanResult.checkedIn &&
              !scanResult.alreadyCheckedIn && (
                <div className="mt-3 sm:mt-4">
                  <Button
                    onClick={handleCheckIn}
                    disabled={isCheckingIn || !selectedEvent}
                    className="w-full bg-emerald-600 py-2.5 text-sm font-medium text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 sm:py-3 sm:text-base dark:bg-emerald-500 dark:hover:bg-emerald-600"
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
