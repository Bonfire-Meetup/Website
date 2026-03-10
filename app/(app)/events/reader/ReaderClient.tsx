"use client";

import { Scanner, type IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { prepareZXingModule } from "barcode-detector/ponyfill";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

prepareZXingModule({
  overrides: {
    locateFile: (path, prefix) => {
      if (path.endsWith(".wasm")) {
        return `/vendor/${path}`;
      }
      return prefix + path;
    },
  },
});

import {
  ArrowLeftIcon,
  QrCodeIcon,
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
} from "@/components/shared/Icons";
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
import { formatShortDateUTC, formatTimeUTC } from "@/lib/utils/locale";

function isCameraPermissionError(err: Error): boolean {
  return err.name === "NotAllowedError" || err.message.includes("permission");
}

function isCameraNotFoundError(err: Error): boolean {
  return err.name === "NotFoundError" || err.message.includes("not found");
}

function isCameraNotReadableError(err: Error): boolean {
  return err.name === "NotReadableError" || err.message.includes("not readable");
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

interface DebugEntry {
  id: string;
  level: "error" | "info" | "warn";
  message: string;
}

interface PublicIdParts {
  first: string;
  second: string;
}

const PUBLIC_ID_ALLOWED_CHARS = /[1-9A-HJ-NP-Za-km-z]/g;

function sanitizePublicIdInput(value: string): string {
  const normalized =
    value
      .replace(/[-_.\s]/g, "")
      .match(PUBLIC_ID_ALLOWED_CHARS)
      ?.join("") ?? "";
  return normalized.slice(0, 22);
}

function splitPublicId(value: string): PublicIdParts {
  const normalized = sanitizePublicIdInput(value);
  return {
    first: normalized.slice(0, 11),
    second: normalized.slice(11, 22),
  };
}

function joinPublicId(parts: PublicIdParts): string {
  if (!parts.second) {
    return parts.first;
  }

  return `${parts.first}-${parts.second}`;
}

export function ReaderClient() {
  const t = useTranslations("reader");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const haptics = useHaptics();
  const auth = useAppSelector((state) => state.auth);
  const userRoles = useAppSelector(selectAuthRoles);
  const [hasMounted, setHasMounted] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [manualPublicIdParts, setManualPublicIdParts] = useState<PublicIdParts>({
    first: "",
    second: "",
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isLookingUpUser, setIsLookingUpUser] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticsCopied, setDiagnosticsCopied] = useState(false);
  const [, setDebugEntriesVersion] = useState(0);
  const debugEntriesRef = useRef<DebugEntry[]>([]);
  const isProcessingRef = useRef<boolean>(false);
  const firstPublicIdInputRef = useRef<HTMLInputElement | null>(null);
  const secondPublicIdInputRef = useRef<HTMLInputElement | null>(null);

  const events = getUpcomingEvents(new Date());
  const isCrew = userRoles.includes(USER_ROLES.CREW);

  const formatEventTileMeta = (date: string, time: string) => {
    const parts: string[] = [];
    const formattedDate = formatShortDateUTC(date, locale);

    if (formattedDate) {
      parts.push(formattedDate);
    } else if (date) {
      parts.push(date);
    }

    if (time && time !== "TBA") {
      parts.push(time);
    } else if (time) {
      parts.push(time);
    }

    return parts.join(" • ");
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (auth.hydrated && (!auth.isAuthenticated || !isCrew)) {
      router.replace(PAGE_ROUTES.ME);
    }
  }, [auth.hydrated, auth.isAuthenticated, isCrew, router]);

  const appendDebugEntry = (message: string, level: DebugEntry["level"] = "info") => {
    const timestamp = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const nextEntries = [
      ...debugEntriesRef.current.slice(-11),
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        level,
        message: `${timestamp} ${message}`,
      },
    ];
    debugEntriesRef.current = nextEntries;

    if (showDiagnostics || nextEntries.length === 1 || !isScanning) {
      setDebugEntriesVersion((current) => current + 1);
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
    isProcessingRef.current = false;
    debugEntriesRef.current = [];
    setDebugEntriesVersion((current) => current + 1);
    setSelectedEvent("");
    setManualPublicIdParts({ first: "", second: "" });
    setIsScanning(false);
    setScanResult(null);
    setError(null);
    setIsVerifying(false);
    setIsCheckingIn(false);
    setIsLookingUpUser(false);
    setShowManualEntry(false);
    setShowDiagnostics(false);
    setDiagnosticsCopied(false);
  };

  useEffect(() => {
    const handlePageShow = () => {
      resetReaderState();
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
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

  const handleStopReader = () => {
    appendDebugEntry("Stopping scanner.");
    setIsScanning(false);
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

    appendDebugEntry("Bonfire QR detected. Verifying ticket.");
    isProcessingRef.current = true;
    setScanResult(null);

    const parsed = parseCheckInToken(token);
    const isExpiredToken = parsed.error === "Token expired";

    if (!parsed.valid && !isExpiredToken) {
      appendDebugEntry(`Token parse failed: ${parsed.error ?? "unknown error"}`, "warn");
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
      appendDebugEntry("Verification timed out after 10 seconds.", "warn");
      isProcessingRef.current = false;
      setIsVerifying(false);
    }, 10000);

    setIsVerifying(true);
    appendDebugEntry("Sending verification request to backend.");

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
        appendDebugEntry("Backend verification passed.");
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
        appendDebugEntry("Backend says ticket is expired.", "warn");
        setInvalidScanResult(t("result.ticketExpired"), {
          email: result.email,
          expired: true,
          name: result.name,
          publicId: result.publicId,
        });
        isProcessingRef.current = false;
      } else {
        clearTimeout(timeoutId);
        appendDebugEntry(
          `Backend rejected ticket: ${typeof result.error === "string" ? result.error : "unknown"}`,
          "warn",
        );
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
      appendDebugEntry("Verification request failed.", "error");
      if (err instanceof ApiError && err.status === 401) {
        router.replace(PAGE_ROUTES.LOGIN_WITH_REASON(LOGIN_REASON.SESSION_EXPIRED));
        return;
      }
      setInvalidScanResult(t("errors.verificationFailed"));
      isProcessingRef.current = false;
    }
  };

  const handleStartReader = () => {
    if (!selectedEvent) {
      haptics.neutral();
      setError(t("errors.noEventSelected"));
      return;
    }

    debugEntriesRef.current = [];
    setDebugEntriesVersion((current) => current + 1);
    setError(null);
    setScanResult(null);
    setIsVerifying(false);
    isProcessingRef.current = false;

    appendDebugEntry(`Starting scanner for event ${selectedEvent}.`);
    appendDebugEntry("Preferred camera request: environment.");

    setIsScanning(true);
  };

  const handleScannerScan = (detectedCodes: IDetectedBarcode[]) => {
    if (isProcessingRef.current) {
      return;
    }

    for (const code of detectedCodes) {
      if (code.rawValue) {
        handleScanSuccess(code.rawValue).catch(() => undefined);
        return;
      }
    }
  };

  const handleScannerError = (cameraError: unknown) => {
    const scannerError =
      cameraError instanceof Error ? cameraError : new Error(String(cameraError));
    appendDebugEntry(`Camera error: ${scannerError.message}`, "error");

    if (isCameraPermissionError(scannerError)) {
      haptics.error();
      setError(t("errors.cameraPermissionDenied"));
      setIsScanning(false);
      return;
    }

    if (isCameraNotFoundError(scannerError)) {
      haptics.error();
      setError(t("errors.cameraNotFound"));
      setIsScanning(false);
      return;
    }

    if (isCameraNotReadableError(scannerError)) {
      haptics.error();
      setError(t("errors.cameraNotReadable"));
      setIsScanning(false);
      return;
    }

    haptics.error();
    setError(t("errors.cameraAccessFailed"));
    setIsScanning(false);
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

  const handleManualLookup = async () => {
    if (!selectedEvent) {
      haptics.neutral();
      setError(t("errors.noEventSelected"));
      return;
    }

    const normalizedPublicId = joinPublicId(manualPublicIdParts).trim();
    if (!normalizedPublicId) {
      haptics.neutral();
      setError(t("errors.manualIdRequired"));
      return;
    }

    setIsScanning(false);
    setError(null);
    setScanResult(null);
    setIsVerifying(false);
    setIsLookingUpUser(true);
    appendDebugEntry(`Looking up backup ID ${normalizedPublicId}.`);

    try {
      const response = await authFetch(API_ROUTES.CHECK_IN.LOOKUP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: normalizedPublicId }),
      });

      const result = await response.json();

      if (response.ok && result.valid) {
        appendDebugEntry("Backup ID resolved to a valid user.");
        haptics.success();
        setScanResult({
          email: result.email,
          valid: true,
          publicId: result.publicId,
          name: result.name,
          timestamp: Date.now(),
          checkedIn: false,
        });
      } else {
        const errorMessage =
          result.error === "User not found" ? t("errors.userNotFound") : t("errors.lookupFailed");
        appendDebugEntry(`Backup ID lookup failed: ${result.error ?? "unknown"}`, "warn");
        setInvalidScanResult(errorMessage);
      }
    } catch (err) {
      appendDebugEntry("Backup ID lookup request failed.", "error");
      if (err instanceof ApiError && err.status === 401) {
        setIsLookingUpUser(false);
        router.replace(PAGE_ROUTES.LOGIN_WITH_REASON(LOGIN_REASON.SESSION_EXPIRED));
        return;
      }
      setInvalidScanResult(t("errors.lookupFailed"));
    }

    setIsLookingUpUser(false);
  };

  const handlePublicIdPartChange = (part: keyof PublicIdParts, value: string) => {
    const normalized = sanitizePublicIdInput(value).slice(0, 11);
    setManualPublicIdParts((current) => ({
      ...current,
      [part]: normalized,
    }));

    if (part === "first" && normalized.length === 11) {
      secondPublicIdInputRef.current?.focus();
      secondPublicIdInputRef.current?.setSelectionRange(0, 0);
    }
  };

  const handlePublicIdPaste = (value: string) => {
    const nextParts = splitPublicId(value);
    setManualPublicIdParts(nextParts);

    if (nextParts.first.length === 11 && nextParts.second.length < 11) {
      requestAnimationFrame(() => {
        secondPublicIdInputRef.current?.focus();
        secondPublicIdInputRef.current?.setSelectionRange(
          nextParts.second.length,
          nextParts.second.length,
        );
      });
    }
  };

  const manualPublicIdValue = joinPublicId(manualPublicIdParts);

  const handleCopyDiagnostics = async () => {
    if (debugEntriesRef.current.length === 0) {
      return;
    }

    const diagnosticsText = debugEntriesRef.current.map((entry) => entry.message).join("\n");

    try {
      await navigator.clipboard.writeText(diagnosticsText);
      setDiagnosticsCopied(true);
      window.setTimeout(() => {
        setDiagnosticsCopied(false);
      }, 2000);
    } catch {
      appendDebugEntry("Failed to copy diagnostics.", "warn");
    }
  };

  const handleReturnToReader = () => {
    setScanResult(null);
    setError(null);
    setIsVerifying(false);
    setIsCheckingIn(false);
    setIsLookingUpUser(false);
    setManualPublicIdParts({ first: "", second: "" });
    setShowManualEntry(false);
  };

  const debugEntries = debugEntriesRef.current;

  if (scanResult) {
    const resultToneClass = scanResult.valid
      ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10"
      : scanResult.expired
        ? "border-orange-200 bg-orange-50 dark:border-orange-500/30 dark:bg-orange-500/10"
        : "border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10";

    const resultLabelClass = scanResult.valid
      ? "text-emerald-900 dark:text-emerald-100"
      : scanResult.expired
        ? "text-orange-900 dark:text-orange-100"
        : "text-red-900 dark:text-red-100";

    const resultMetaClass = scanResult.valid
      ? "text-emerald-600/70 dark:text-emerald-300/70"
      : scanResult.expired
        ? "text-orange-600/70 dark:text-orange-300/70"
        : "text-red-600/70 dark:text-red-300/70";

    return (
      <div className="mx-auto w-full max-w-2xl space-y-4 px-2 sm:space-y-6 sm:px-0">
        <button
          type="button"
          onClick={handleReturnToReader}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/85 px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm backdrop-blur transition-colors hover:bg-white dark:border-neutral-700 dark:bg-neutral-900/75 dark:text-neutral-200 dark:hover:bg-neutral-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t("result.back")}
        </button>

        <div className="rounded-2xl border border-neutral-200 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-5 dark:border-neutral-700 dark:bg-neutral-900/70">
          <div className="text-xs font-medium tracking-[0.16em] text-neutral-500 uppercase dark:text-neutral-400">
            {t("selectEvent")}
          </div>
          <div className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
            {events.find((event) => event.id === selectedEvent)?.title ??
              t("selectEventPlaceholder")}
          </div>
        </div>

        <div className={`overflow-hidden rounded-2xl border shadow-lg ${resultToneClass}`}>
          <div className="px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex items-start gap-4">
              {scanResult.valid && scanResult.publicId ? (
                <UserAvatar
                  avatarSeed={makeAvatarSeedFromPublicId(scanResult.publicId)}
                  size={72}
                  name={scanResult.name}
                  className="shrink-0 border-2 border-emerald-200 shadow-md dark:border-emerald-500/40 dark:shadow-emerald-500/20"
                />
              ) : (
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-md ${
                    scanResult.expired
                      ? "bg-orange-500 dark:bg-orange-400"
                      : "bg-red-600 dark:bg-red-500"
                  }`}
                >
                  <CloseIcon className="h-7 w-7 text-white" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`text-base font-bold ${resultLabelClass}`}>
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
                  <div className={`text-xs font-medium ${resultMetaClass}`}>
                    {formatTimeUTC(new Date(scanResult.timestamp).toISOString())}
                  </div>
                </div>

                {(scanResult.valid || scanResult.expired) && scanResult.name && (
                  <div className={`mb-3 text-lg font-semibold ${resultLabelClass}`}>
                    {scanResult.name}
                  </div>
                )}

                {(scanResult.valid || scanResult.expired) && scanResult.publicId && (
                  <div className="mb-3 space-y-1.5">
                    <div
                      className={`text-xs font-medium tracking-wide uppercase ${resultMetaClass}`}
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
                    className={`text-sm ${
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
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-2 sm:space-y-6 sm:px-0">
      <div className="space-y-3 sm:space-y-4">
        <div>
          <div className="mb-1.5 block text-xs font-medium text-neutral-700 sm:mb-2 sm:text-sm dark:text-neutral-300">
            {t("selectEvent")}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
            {events.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() =>
                  setSelectedEvent((current) => (current === event.id ? "" : event.id))
                }
                disabled={isScanning}
                className={`rounded-xl border px-3 py-2.5 text-left transition-all sm:rounded-2xl sm:px-4 sm:py-3 ${
                  selectedEvent === event.id
                    ? "border-orange-500 bg-gradient-to-br from-orange-50 to-rose-50 shadow-[0_14px_30px_-22px_rgba(234,88,12,0.5)] dark:border-orange-400 dark:from-orange-500/15 dark:to-rose-500/10"
                    : "border-neutral-200 bg-white/80 shadow-sm hover:border-neutral-300 hover:bg-white dark:border-neutral-700 dark:bg-neutral-900/70 dark:hover:border-neutral-600 dark:hover:bg-neutral-900"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div
                      className={`text-sm leading-5 font-semibold sm:text-[15px] ${
                        selectedEvent === event.id
                          ? "text-neutral-950 dark:text-white"
                          : "text-neutral-900 dark:text-white"
                      }`}
                    >
                      {event.title}
                    </div>
                    <div
                      className={`mt-0.5 text-[11px] leading-4 sm:text-xs ${
                        selectedEvent === event.id
                          ? "text-neutral-700 dark:text-neutral-200"
                          : "text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      {formatEventTileMeta(event.date, event.time)}
                    </div>
                  </div>
                  <div
                    className={`mt-0.5 h-3 w-3 shrink-0 rounded-full border ${
                      selectedEvent === event.id
                        ? "border-orange-500 bg-orange-500 shadow-[0_0_0_4px_rgba(251,146,60,0.16)] dark:border-orange-400 dark:bg-orange-400"
                        : "border-neutral-300 bg-transparent dark:border-neutral-600"
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-3">
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
          <Button
            onClick={() => setShowManualEntry((current) => !current)}
            disabled={!selectedEvent}
            variant="plain"
            className="border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-900 shadow-sm hover:bg-neutral-50 disabled:opacity-50 sm:min-w-42 sm:text-base dark:border-neutral-600 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
          >
            {t(showManualEntry ? "manual.toggleClose" : "manual.toggleOpen")}
          </Button>
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
                <Scanner
                  onScan={handleScannerScan}
                  onError={handleScannerError}
                  constraints={{ facingMode: "environment" }}
                  formats={["qr_code"]}
                  paused={isProcessingRef.current}
                  components={{ finder: true }}
                  styles={{
                    container: { width: "100%", height: "100%" },
                    video: { objectFit: "cover" },
                  }}
                />
              </div>
            </div>
            {isVerifying && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs text-blue-700 sm:px-4 sm:py-3 sm:text-sm dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
                {t("messages.qrDetected")}
              </div>
            )}
          </div>
        )}

        {showManualEntry && (
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white/80 shadow-sm backdrop-blur sm:rounded-2xl dark:border-neutral-700 dark:bg-neutral-900/70">
            <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-3 sm:px-4 dark:border-neutral-700">
              <div>
                <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {t("manual.title")}
                </div>
                <div className="text-xs leading-5 text-neutral-600 sm:text-sm dark:text-neutral-400">
                  {t("manual.description")}
                </div>
              </div>
              <ChevronDownIcon className="h-4 w-4 rotate-180 text-neutral-500 dark:text-neutral-400" />
            </div>
            <div className="px-3 py-3 sm:px-4 sm:py-4">
              <label
                htmlFor="manual-public-id-first"
                className="mb-1.5 block text-xs font-medium text-neutral-700 sm:text-sm dark:text-neutral-300"
              >
                {t("manual.label")}
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                  <input
                    ref={firstPublicIdInputRef}
                    id="manual-public-id-first"
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    enterKeyHint="next"
                    maxLength={11}
                    value={manualPublicIdParts.first}
                    onChange={(e) => handlePublicIdPartChange("first", e.target.value)}
                    onPaste={(e) => {
                      const pastedValue = e.clipboardData.getData("text");
                      if (pastedValue) {
                        e.preventDefault();
                        handlePublicIdPaste(pastedValue);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleManualLookup().catch(() => undefined);
                      }
                    }}
                    placeholder="XXXXXXXXXXX"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    disabled={isLookingUpUser}
                    className="min-w-0 rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-center font-mono text-sm tracking-[0.08em] text-neutral-900 shadow-sm focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500 focus:outline-none disabled:opacity-50 sm:px-4 sm:text-base dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:focus:border-neutral-400 dark:focus:ring-neutral-400"
                  />
                  <div className="font-mono text-base font-semibold text-neutral-500 dark:text-neutral-400">
                    -
                  </div>
                  <input
                    ref={secondPublicIdInputRef}
                    id="manual-public-id-second"
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    enterKeyHint="done"
                    maxLength={11}
                    value={manualPublicIdParts.second}
                    onChange={(e) => handlePublicIdPartChange("second", e.target.value)}
                    onPaste={(e) => {
                      const pastedValue = e.clipboardData.getData("text");
                      if (pastedValue) {
                        e.preventDefault();
                        handlePublicIdPaste(pastedValue);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && manualPublicIdParts.second.length === 0) {
                        e.preventDefault();
                        firstPublicIdInputRef.current?.focus();
                        firstPublicIdInputRef.current?.setSelectionRange(
                          manualPublicIdParts.first.length,
                          manualPublicIdParts.first.length,
                        );
                        return;
                      }
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleManualLookup().catch(() => undefined);
                      }
                    }}
                    placeholder="XXXXXXXXXXX"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    disabled={isLookingUpUser}
                    className="min-w-0 rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-center font-mono text-sm tracking-[0.08em] text-neutral-900 shadow-sm focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500 focus:outline-none disabled:opacity-50 sm:px-4 sm:text-base dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:focus:border-neutral-400 dark:focus:ring-neutral-400"
                  />
                </div>
                <Button
                  onClick={handleManualLookup}
                  disabled={!selectedEvent || !manualPublicIdValue.trim() || isLookingUpUser}
                  className="bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 sm:min-w-36 sm:text-base dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                >
                  {isLookingUpUser ? t("manual.lookingUp") : t("manual.lookup")}
                </Button>
              </div>
              <div className="mt-2 text-[11px] leading-5 text-neutral-500 sm:text-xs dark:text-neutral-400">
                {t("manual.hint")}
              </div>
            </div>
          </div>
        )}

        {debugEntries.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white/85 shadow-sm backdrop-blur sm:rounded-2xl dark:border-neutral-700/80 dark:bg-neutral-950/75">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400">
                  {t("debug.title")}
                </div>
              </div>
              <div className="ml-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleCopyDiagnostics().catch(() => undefined);
                  }}
                  className="rounded-md border border-neutral-200/80 px-2 py-1 text-[11px] font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700/80 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  {diagnosticsCopied ? t("debug.copied") : t("debug.copy")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDiagnostics((current) => !current)}
                  className="flex items-center gap-2 rounded-md px-1 py-1 text-[11px] text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                  <span>{t(showDiagnostics ? "debug.hide" : "debug.show")}</span>
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform ${
                      showDiagnostics ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
            {showDiagnostics && (
              <div className="border-t border-neutral-200/80 px-3 py-3 dark:border-neutral-700/80">
                <div className="max-h-56 space-y-1 overflow-y-auto font-mono text-[11px] leading-5 text-neutral-700 dark:text-neutral-200">
                  {debugEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className={
                        entry.level === "error"
                          ? "text-red-700 dark:text-red-300"
                          : entry.level === "warn"
                            ? "text-orange-700 dark:text-orange-300"
                            : ""
                      }
                    >
                      {entry.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
