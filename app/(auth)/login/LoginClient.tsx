"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { AuthControls } from "@/components/auth/AuthControls";
import { TurnstileWidget } from "@/components/forms/TurnstileWidget";
import { FingerprintIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Link } from "@/i18n/navigation";
import { API_ROUTES } from "@/lib/api/routes";
import {
  decodeAccessToken,
  isAccessTokenValid,
  readAccessToken,
  writeAccessToken,
} from "@/lib/auth/client";
import { authenticateWithPasskey, isWebAuthnSupported } from "@/lib/auth/webauthn-client";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setToken } from "@/lib/redux/slices/authSlice";
import { LOGIN_REASON, type LoginReason, PAGE_ROUTES } from "@/lib/routes/pages";
import { clearAllAuthChallenges, getAuthChallengeKey } from "@/lib/storage/keys";

type Step = "request" | "verify";

interface HintConfig {
  borderClass: string;
  bgClass: string;
  textClass: string;
  icon: React.ReactNode;
  translationKey: string;
}

const HINT_CONFIGS: Record<LoginReason, HintConfig> = {
  [LOGIN_REASON.VIDEO_BOOST]: {
    borderClass: "border-emerald-200/70 dark:border-emerald-500/20",
    bgClass: "bg-emerald-50 dark:bg-emerald-500/10",
    textClass: "text-emerald-700 dark:text-emerald-200",
    icon: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
    translationKey: "boostHint",
  },
  [LOGIN_REASON.SESSION_EXPIRED]: {
    borderClass: "border-amber-200/70 dark:border-amber-500/20",
    bgClass: "bg-amber-50 dark:bg-amber-500/10",
    textClass: "text-amber-700 dark:text-amber-200",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
    translationKey: "sessionExpiredHint",
  },
};

function ReasonHintBanner({
  hint,
  className = "",
  t,
}: {
  hint: LoginReason | null;
  className?: string;
  t: (key: string) => string;
}) {
  if (!hint) {
    return null;
  }

  const config = HINT_CONFIGS[hint];
  if (!config) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${config.borderClass} ${config.bgClass} ${config.textClass} ${className}`}
    >
      <svg
        className="h-4 w-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {config.icon}
      </svg>
      <span>{t(config.translationKey)}</span>
    </div>
  );
}

const emailPlaceholders = [
  "lara@croft.com",
  "solid@snake.dev",
  "gordon@freeman.io",
  "master@chief.net",
  "glados@aperture.sci",
  "link@hyrule.gov",
  "kratos@sparta.gr",
  "samus@aran.space",
  "cloud@strife.jp",
  "geralt@rivia.pl",
];

export function LoginClient() {
  const t = useTranslations("authLogin");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [placeholder, setPlaceholder] = useState(emailPlaceholders[0]);
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const autoSubmitRef = useRef(false);
  const lastSubmittedCodeRef = useRef<string | null>(null);

  useEffect(() => {
    setPlaceholder(emailPlaceholders[Math.floor(Math.random() * emailPlaceholders.length)]);
    setPasskeySupported(isWebAuthnSupported());
  }, []);

  const reasonHint = searchParams.get("reason-hint");
  const formRef = useRef<HTMLFormElement | null>(null);

  const storeChallengeEmail = (token: string, value: string) => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(getAuthChallengeKey(token), value);
  };

  const readChallengeEmail = (token: string) => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(getAuthChallengeKey(token));
  };

  const clearChallengeEmail = (token: string) => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(getAuthChallengeKey(token));
  };

  useEffect(() => {
    const token = readAccessToken();

    if (token && isAccessTokenValid(token)) {
      router.replace(PAGE_ROUTES.ME);
    }
  }, [router]);

  useEffect(() => {
    const token = searchParams.get("challenge");

    if (!token) {
      return;
    }

    const storedEmail = readChallengeEmail(token);

    if (storedEmail) {
      setEmail(storedEmail);
      setStep("verify");
      setChallengeToken(token);
    }
  }, [searchParams]);

  const inputBaseClass =
    "w-full rounded-xl border bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 transition-all duration-200 focus:outline-none focus:ring-2 dark:bg-white/5 dark:text-white dark:placeholder-neutral-500";
  const inputNormalClass =
    "border-neutral-200 focus:border-orange-500 focus:ring-orange-500/20 dark:border-white/10 dark:focus:border-orange-400";
  const inputDisabledClass = "cursor-not-allowed opacity-60 bg-neutral-50 dark:bg-white/5";

  const handlePasskeyAuth = async () => {
    setPasskeyLoading(true);
    setError(null);
    setStatus(null);

    const result = await authenticateWithPasskey();

    if (!result.ok) {
      if (result.error === "cancelled") {
        setPasskeyLoading(false);
        return;
      }

      if (result.error === "passkey_not_found") {
        setError(t("passkey.errorNotFound"));
      } else {
        setError(t("passkey.errorFailed"));
      }

      setPasskeyLoading(false);
      return;
    }

    if (result.accessToken) {
      writeAccessToken(result.accessToken);
      clearAllAuthChallenges();
      const decoded = decodeAccessToken(result.accessToken);
      dispatch(setToken({ token: result.accessToken, decoded: decoded ?? undefined }));
      router.replace(PAGE_ROUTES.ME);
      return;
    }

    setError(t("passkey.errorFailed"));
    setPasskeyLoading(false);
  };

  const handleRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);
    setTurnstileReady(false);

    const formData = new FormData(formRef.current ?? undefined);
    const turnstileToken = formData.get("cf-turnstile-response");

    if (!turnstileToken || typeof turnstileToken !== "string" || turnstileToken.trim() === "") {
      setError("Please verify that you're human. The security check may still be loading.");
      setLoading(false);

      return;
    }

    const response = await fetch(API_ROUTES.AUTH.CHALLENGES, {
      body: JSON.stringify({ email, turnstileToken, type: "email" }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Unable to send code");
      setLoading(false);

      return;
    }

    const data = (await response.json().catch(() => null)) as {
      challenge_token?: string;
      error?: string;
      ok?: boolean;
    } | null;

    if (data?.error === "rate_limited") {
      setError("Too many requests. Please try again later.");
      setLoading(false);
      return;
    }

    const nextChallengeToken = data?.challenge_token;

    if (!nextChallengeToken) {
      setError("Unable to start challenge. Please try again.");
      setLoading(false);

      return;
    }

    storeChallengeEmail(nextChallengeToken, email);
    setChallengeToken(nextChallengeToken);
    setStep("verify");
    setStatus("Code sent. Check your inbox.");
    router.replace(PAGE_ROUTES.LOGIN_WITH_CHALLENGE(nextChallengeToken));
    setLoading(false);
  };

  const handleVerify = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      autoSubmitRef.current = true;
      setLoading(true);
      setError(null);
      setStatus(null);

      if (!challengeToken) {
        setError("Missing challenge");
        setLoading(false);
        autoSubmitRef.current = false;

        return;
      }

      const response = await fetch(API_ROUTES.AUTH.TOKEN, {
        body: JSON.stringify({
          grant_type: "urn:bonfire:grant-type:email-otp",
          challenge_token: challengeToken,
          code: code.replace(/\D/g, ""),
          email,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        const reason = data?.error;

        if (reason === "expired") {
          if (challengeToken) {
            clearChallengeEmail(challengeToken);
          }

          setChallengeToken(null);
          setStep("request");
          router.replace(PAGE_ROUTES.LOGIN);
          setError(t("errorExpired"));
        } else if (reason === "rate_limited") {
          setError(t("errorRateLimited"));
        } else if (reason === "too_many_attempts") {
          if (challengeToken) {
            clearChallengeEmail(challengeToken);
          }

          setChallengeToken(null);
          setStep("request");
          router.replace(PAGE_ROUTES.LOGIN);
          setError(t("errorTooManyAttempts"));
        } else if (reason === "invalid_request") {
          setError(t("errorInvalidRequest"));
        } else {
          setError(t("errorInvalidCode"));
        }

        setLoading(false);
        autoSubmitRef.current = false;

        return;
      }

      const data = (await response.json()) as { access_token?: string };

      if (data.access_token) {
        clearAllAuthChallenges();
        const decoded = decodeAccessToken(data.access_token);
        dispatch(setToken({ token: data.access_token, decoded: decoded ?? undefined }));
        router.replace(PAGE_ROUTES.ME);

        return;
      }

      setError("Invalid response");
      setLoading(false);
      autoSubmitRef.current = false;
    },
    [challengeToken, code, email, router, t, dispatch],
  );

  useEffect(() => {
    if (
      step === "verify" &&
      code.length === 6 &&
      /^\d{6}$/.test(code) &&
      challengeToken &&
      !loading &&
      !autoSubmitRef.current &&
      lastSubmittedCodeRef.current !== code
    ) {
      autoSubmitRef.current = true;
      lastSubmittedCodeRef.current = code;
      const timer = setTimeout(() => {
        if (formRef.current) {
          const syntheticEvent = {
            preventDefault: Function.prototype,
          } as unknown as React.FormEvent<HTMLFormElement>;
          handleVerify(syntheticEvent);
        }
      }, 300);

      return () => {
        clearTimeout(timer);
      };
    } else if (code.length !== 6) {
      autoSubmitRef.current = false;
      lastSubmittedCodeRef.current = null;
    }
  }, [code, step, challengeToken, loading, handleVerify]);

  return (
    <main className="relative flex min-h-screen flex-col bg-neutral-100 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -left-24 h-64 w-64 rounded-full bg-gradient-to-br from-fuchsia-200/40 via-white to-transparent blur-3xl dark:from-fuchsia-600/20 dark:via-rose-500/20" />
        <div className="absolute top-40 -right-16 h-72 w-72 rounded-full bg-gradient-to-br from-rose-200/30 via-slate-100 to-transparent blur-3xl dark:from-orange-500/20 dark:via-amber-500/10" />
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 py-6 sm:px-6 sm:py-12">
        <div className="flex w-full max-w-md flex-col gap-4 md:max-w-4xl">
          <div className="flex items-center justify-center gap-3 text-xs tracking-[0.3em] text-neutral-500 uppercase dark:text-neutral-400">
            <span>{t("eyebrow")}</span>
            <span className="h-1 w-1 rounded-full bg-neutral-400/60" />
            <span>{t("brand", { brandName: tCommon("brandName") })}</span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-[0_20px_60px_var(--color-shadow-dark-light)] backdrop-blur sm:rounded-3xl md:grid md:grid-cols-[1.35fr_1fr] dark:border-white/10 dark:bg-white/5 dark:shadow-[0_30px_80px_var(--color-shadow-dark-strong)]">
            <div className="hidden flex-col gap-6 bg-gradient-to-br from-white to-neutral-50 p-8 md:flex lg:p-10 dark:from-neutral-900 dark:to-neutral-950">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">{t("title")}</h1>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {t("subtitle")}
                </p>
              </div>
              <ReasonHintBanner hint={reasonHint as LoginReason | null} t={t} />
              <div className="space-y-3 rounded-2xl border border-neutral-200/70 bg-white/80 px-5 py-4 text-sm text-neutral-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-neutral-200">
                <div className="text-xs tracking-[0.2em] text-neutral-500 uppercase dark:text-orange-200/80">
                  {t("secureTitle")}
                </div>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-xs font-semibold text-orange-600 dark:bg-orange-400/20 dark:text-orange-400">
                      1
                    </span>
                    <span>{t("steps.step1")}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-xs font-semibold text-orange-600 dark:bg-orange-400/20 dark:text-orange-400">
                      2
                    </span>
                    <span>{t("steps.step2")}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-xs font-semibold text-orange-600 dark:bg-orange-400/20 dark:text-orange-400">
                      3
                    </span>
                    <span>{t("steps.step3")}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-xs font-semibold text-orange-600 dark:bg-orange-400/20 dark:text-orange-400">
                      4
                    </span>
                    <span>{t("steps.step4")}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-xs font-semibold text-orange-600 dark:bg-orange-400/20 dark:text-orange-400">
                      5
                    </span>
                    <span>{t("steps.step5")}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="relative flex flex-col overflow-hidden bg-gradient-to-br from-fuchsia-50/30 via-white to-rose-50/20 p-5 sm:p-6 md:p-8 lg:p-10 dark:from-neutral-900/50 dark:via-neutral-900 dark:to-neutral-950/50">
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 -right-12 h-64 w-64 rounded-full bg-gradient-to-br from-fuchsia-200/30 to-transparent blur-3xl dark:from-fuchsia-500/10" />
                <div className="absolute -bottom-12 -left-12 h-72 w-72 rounded-full bg-gradient-to-tr from-rose-200/20 to-transparent blur-3xl dark:from-rose-500/5" />
              </div>

              <div className="relative z-10 mb-4 flex items-center justify-between md:mb-6 md:justify-end">
                <h1 className="text-xl font-semibold tracking-tight md:hidden">{t("title")}</h1>
                <AuthControls />
              </div>

              <ReasonHintBanner
                hint={reasonHint as LoginReason | null}
                className="mb-4 md:hidden"
                t={t}
              />

              {step === "request" && (
                <div className="mb-4 inline-flex items-start gap-2.5 rounded-xl border border-blue-200/70 bg-blue-50/80 px-4 py-3 text-sm text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                  <span>{t("noRegistrationHint")}</span>
                </div>
              )}

              {step === "verify" && (
                <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                  {t("codeHint")}
                </p>
              )}

              <form
                className="flex flex-1 flex-col gap-5"
                onSubmit={step === "request" ? handleRequest : handleVerify}
                ref={formRef}
              >
                <div>
                  <label
                    htmlFor="login-email"
                    className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                  >
                    {t("emailLabel")}
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={step === "verify"}
                    className={`${inputBaseClass} ${step === "verify" ? inputDisabledClass : inputNormalClass}`}
                    placeholder={placeholder}
                  />
                </div>

                {step === "verify" && (
                  <div>
                    <label
                      htmlFor="login-code"
                      className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                    >
                      {t("codeLabel")}
                    </label>
                    <input
                      id="login-code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      value={code.length === 6 ? `${code.slice(0, 3)} ${code.slice(3)}` : code}
                      onChange={(event) => {
                        const normalized = event.target.value.replace(/\D/g, "").slice(0, 6);
                        setCode(normalized);
                      }}
                      className={`${inputBaseClass} ${inputNormalClass} py-4 text-center font-mono text-xl tracking-[0.5em]`}
                      placeholder="123 456"
                      autoFocus
                    />
                  </div>
                )}

                {step === "request" && <TurnstileWidget onToken={() => setTurnstileReady(true)} />}

                {status && (
                  <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span>{status}</span>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="m15 9-6 6" />
                      <path d="m9 9 6 6" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <div className="mt-auto flex flex-col gap-3 sm:flex-row-reverse">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={loading || passkeyLoading || (step === "request" && !turnstileReady)}
                    className="w-full sm:flex-1"
                  >
                    <span className="flex items-center justify-center gap-2 whitespace-nowrap">
                      {loading && <LoadingSpinner size="sm" />}
                      {loading
                        ? step === "request"
                          ? t("sendingCode")
                          : t("verifying")
                        : step === "request"
                          ? t("sendCode")
                          : t("verify")}
                    </span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    disabled={loading || passkeyLoading}
                    className="w-full sm:flex-1"
                    onClick={() => router.back()}
                  >
                    {t("cancel")}
                  </Button>
                </div>

                {step === "request" && passkeySupported && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-xs text-neutral-400">
                      <div className="h-px flex-1 bg-neutral-200 dark:bg-white/10" />
                      <span>{t("passkey.or")}</span>
                      <div className="h-px flex-1 bg-neutral-200 dark:bg-white/10" />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      disabled={loading || passkeyLoading}
                      className="w-full"
                      onClick={handlePasskeyAuth}
                    >
                      <span className="flex items-center justify-center gap-2 whitespace-nowrap">
                        {passkeyLoading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <FingerprintIcon className="h-4 w-4" />
                        )}
                        {passkeyLoading ? t("passkey.authenticating") : t("passkey.button")}
                      </span>
                    </Button>
                    <p className="text-[11px] text-neutral-400/80 dark:text-neutral-500/80">
                      {t("passkey.note")}
                    </p>
                  </div>
                )}
              </form>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 border-t border-neutral-200/60 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-5 py-4 text-center text-xs text-neutral-500 sm:flex-row sm:px-8 sm:text-left md:col-span-2 dark:border-white/10 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <Image
                  src="/assets/brand/RGB_PNG_01_bonfire_black_gradient.png"
                  alt={tCommon("brandName")}
                  width={100}
                  height={28}
                  className="h-5 w-auto dark:hidden"
                />
                <Image
                  src="/assets/brand/RGB_PNG_03_bonfire_white_gradient.png"
                  alt={tCommon("brandName")}
                  width={100}
                  height={28}
                  className="hidden h-5 w-auto dark:block"
                />
              </div>
              <div className="leading-relaxed">
                {t("termsPrefix")}
                <Link
                  className="underline decoration-neutral-400/60 underline-offset-2 hover:text-neutral-700 dark:hover:text-neutral-200"
                  href={PAGE_ROUTES.LEGAL}
                >
                  {t("termsLink")}
                </Link>
                {t("termsSuffix")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
