"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { CheckIcon, CloseIcon, MailIcon } from "@/components/shared/Icons";
import { AccentBar } from "@/components/ui/AccentBar";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { API_ROUTES } from "@/lib/api/routes";
import { PAGE_ROUTES } from "@/lib/routes/pages";

type PageState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; email: string; unsubscribedFrom: "newsletter" | "account" | "both" }
  | { status: "error"; message: string };

export default function UnsubscribePage() {
  const t = useTranslations("sections.newsletterUnsubscribe");
  const token = useSearchParams().get("token");

  const [state, setState] = useState<PageState>(() =>
    token ? { status: "idle" } : { status: "error", message: t("errors.missingToken") },
  );

  const handleUnsubscribe = async () => {
    setState({ status: "loading" });
    try {
      const response = await fetch(API_ROUTES.NEWSLETTER.UNSUBSCRIBE, {
        method: "POST",
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
        const errorMessages: Record<string, string> = {
          not_subscribed: t("errors.notSubscribed"),
          invalid_token: t("errors.invalidToken"),
        };
        setState({ status: "error", message: errorMessages[data.error] ?? t("errors.generic") });
      }
    } catch {
      setState({ status: "error", message: t("errors.generic") });
    }
  };

  const getSuccessMessage = (email: string, from: "newsletter" | "account" | "both") => {
    const keys = {
      newsletter: "success.messageNewsletter",
      account: "success.messageAccount",
      both: "success.messageBoth",
    } as const;
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
              <Button href={PAGE_ROUTES.HOME} variant="glass-secondary">
                {t("backToHome")}
              </Button>
            </div>
          </div>
        ) : state.status === "error" ? (
          <div className="glass-card no-hover-pop p-8 text-center sm:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-red-500 shadow-lg shadow-rose-500/30">
              <CloseIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-neutral-900 dark:text-white">
              {t("error.title")}
            </h2>
            <p className="mx-auto max-w-md text-neutral-600 dark:text-neutral-400">
              {state.message}
            </p>
            <div className="mt-8">
              <Button href={PAGE_ROUTES.HOME} variant="glass-secondary">
                {t("backToHome")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="glass-card no-hover-pop p-8 sm:p-12">
            <div className="mb-8 flex justify-center">
              <div className="form-header-icon">
                <MailIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="mb-8 text-center text-lg text-neutral-600 dark:text-neutral-400">
              {t("confirmMessage")}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                onClick={handleUnsubscribe}
                disabled={state.status === "loading"}
                variant="glass"
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
