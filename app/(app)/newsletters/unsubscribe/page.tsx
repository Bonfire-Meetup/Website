"use client";

import { useTranslations } from "next-intl";
import { useQueryStates } from "nuqs";
import { useCallback, useEffect, useState } from "react";

import { CheckIcon, CloseIcon, MailIcon } from "@/components/shared/Icons";
import { AccentBar } from "@/components/ui/AccentBar";
import { BackLink } from "@/components/ui/BackLink";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { API_ROUTES } from "@/lib/api/routes";
import { newsletterUnsubscribeQueryParsers } from "@/lib/routes/app-search-params-client";
import { PAGE_ROUTES } from "@/lib/routes/pages";

type SubscribedAs = "newsletter" | "account" | "both";

type ErrorCode = "invalid_token" | "missing_token" | "not_subscribed" | "generic";

type PageState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "ready"; subscribedAs: SubscribedAs }
  | { status: "loading"; subscribedAs: SubscribedAs }
  | { status: "success"; email: string; unsubscribedFrom: SubscribedAs }
  | { status: "error"; message: string; errorCode?: ErrorCode };

const API_ERROR_KEYS: Record<string, ErrorCode> = {
  not_subscribed: "not_subscribed",
  invalid_token: "invalid_token",
};

const ERROR_MESSAGE_KEYS: Record<ErrorCode, string> = {
  invalid_token: "invalidToken",
  missing_token: "missingToken",
  not_subscribed: "notSubscribed",
  generic: "generic",
};

function InfoCard({ label, content }: { label: string; content: string }) {
  return (
    <div className="rounded-xl bg-neutral-100/80 p-4 dark:bg-neutral-800/50">
      <p className="mb-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className="text-neutral-700 dark:text-neutral-300">{content}</p>
    </div>
  );
}

export default function UnsubscribePage() {
  const t = useTranslations("sections.newsletterUnsubscribe");
  const [{ token }] = useQueryStates(newsletterUnsubscribeQueryParsers);

  const [state, setState] = useState<PageState>(() =>
    token
      ? { status: "idle" }
      : { status: "error", message: t("errors.missingToken"), errorCode: "missing_token" },
  );

  const resolveError = useCallback(
    (error?: string): { message: string; errorCode: ErrorCode } => {
      const code: ErrorCode = error && error in API_ERROR_KEYS ? API_ERROR_KEYS[error] : "generic";
      return { message: t(`errors.${ERROR_MESSAGE_KEYS[code]}`), errorCode: code };
    },
    [t],
  );

  useEffect(() => {
    if (!token || state.status !== "idle") {
      return;
    }

    const checkSubscription = async () => {
      setState({ status: "checking" });
      try {
        const response = await fetch(
          `${API_ROUTES.NEWSLETTER.SUBSCRIPTIONS}?token=${encodeURIComponent(token)}`,
        );
        const data = await response.json();

        if (response.ok && data.subscribedAs) {
          setState({ status: "ready", subscribedAs: data.subscribedAs });
        } else {
          const { message, errorCode } = resolveError(data.error);
          setState({ status: "error", message, errorCode });
        }
      } catch {
        setState({ status: "error", message: t("errors.generic"), errorCode: "generic" });
      }
    };

    checkSubscription();
  }, [token, state.status, resolveError, t]);

  const handleUnsubscribe = async () => {
    setState((prev) => {
      if (prev.status !== "ready") {
        return prev;
      }
      return { status: "loading", subscribedAs: prev.subscribedAs };
    });
    try {
      const response = await fetch(API_ROUTES.NEWSLETTER.SUBSCRIPTIONS, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (response.ok) {
        setState({
          status: "success",
          email: data.email,
          unsubscribedFrom: data.unsubscribedFrom ?? "newsletter",
        });
      } else {
        const { message, errorCode } = resolveError(data.error);
        setState({ status: "error", message, errorCode });
      }
    } catch {
      setState({ status: "error", message: t("errors.generic"), errorCode: "generic" });
    }
  };

  const getSuccessMessage = (email: string, from: SubscribedAs) => {
    const keys: Record<SubscribedAs, string> = {
      newsletter: "success.messageNewsletter",
      account: "success.messageAccount",
      both: "success.messageBoth",
    };
    return t(keys[from], { email });
  };

  return (
    <main className="gradient-bg-static relative min-h-screen overflow-hidden px-4 pt-32 pb-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-9),transparent_62%)]" />
        <div className="absolute top-1/2 left-1/4 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,var(--color-fire-glow-light-mid),transparent_62%)] opacity-30 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-4">
            <AccentBar />
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
              {t("title")}
            </h1>
          </div>
          <p className="mx-auto max-w-lg text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
            {t("subtitle")}
          </p>
        </div>

        {state.status === "success" ? (
          <div className="glass-card no-hover-pop p-8 text-center sm:p-12">
            <div className="form-success-icon">
              <CheckIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-neutral-900 dark:text-white">
              {t("success.title")}
            </h2>
            <p className="mx-auto max-w-md text-neutral-600 dark:text-neutral-400">
              {getSuccessMessage(state.email, state.unsubscribedFrom)}
            </p>
            <div className="mt-8">
              <BackLink href={PAGE_ROUTES.HOME} className="justify-center">
                {t("backToHome")}
              </BackLink>
            </div>
          </div>
        ) : state.status === "error" ? (
          <div className="glass-card no-hover-pop p-8 sm:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-red-500 shadow-lg shadow-rose-500/30">
              <CloseIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="mb-3 text-center text-2xl font-bold text-neutral-900 dark:text-white">
              {t("error.title")}
            </h2>
            <p className="mx-auto mb-4 max-w-md text-center text-neutral-600 dark:text-neutral-400">
              {state.message}
            </p>
            {(state.errorCode === "invalid_token" || state.errorCode === "missing_token") && (
              <div className="mx-auto mb-8 max-w-md rounded-xl bg-neutral-100/80 p-4 text-left dark:bg-neutral-800/50">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {state.errorCode === "invalid_token"
                    ? t("errors.invalidTokenDetails")
                    : t("errors.missingTokenDetails")}
                </p>
              </div>
            )}
            <div className="flex justify-center">
              <BackLink href={PAGE_ROUTES.HOME} className="justify-center">
                {t("backToHome")}
              </BackLink>
            </div>
          </div>
        ) : state.status === "checking" ? (
          <div className="glass-card no-hover-pop p-8 sm:p-12">
            <div className="flex flex-col items-center justify-center gap-6 py-12">
              <LoadingSpinner className="h-10 w-10" />
              <p className="text-neutral-600 dark:text-neutral-400">{t("checking")}</p>
            </div>
          </div>
        ) : (
          <div className="glass-card no-hover-pop p-8 sm:p-12">
            <div className="mb-8 flex justify-center">
              <div className="form-header-icon">
                <MailIcon className="h-6 w-6 text-white" />
              </div>
            </div>

            {(state.status === "ready" || state.status === "loading") && (
              <div className="mb-8 space-y-6">
                <InfoCard
                  label={t("whySubscribedLabel")}
                  content={t(`whySubscribed.${state.subscribedAs}` as const)}
                />
                <InfoCard
                  label={t("whatUnsubscribeDoesLabel")}
                  content={t(`whatUnsubscribeDoes.${state.subscribedAs}` as const)}
                />
              </div>
            )}

            <p className="mb-8 text-center text-lg text-neutral-600 dark:text-neutral-400">
              {t("confirmMessage")}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                onClick={handleUnsubscribe}
                disabled={state.status !== "ready"}
                variant="fire-primary"
                className="w-full sm:w-auto"
              >
                {state.status === "loading" ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    {t("unsubscribing")}
                  </>
                ) : (
                  t("unsubscribe")
                )}
              </Button>
              <Button
                href={PAGE_ROUTES.HOME}
                variant="glass-secondary"
                className="w-full sm:w-auto"
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
