"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { CheckIcon, CloseIcon, MailIcon } from "@/components/shared/icons";
import { AccentBar } from "@/components/ui/AccentBar";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function UnsubscribePage() {
  const t = useTranslations("sections.newsletterUnsubscribe");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [unsubscribedEmail, setUnsubscribedEmail] = useState("");

  const handleUnsubscribe = async () => {
    if (!token) {
      setStatus("error");
      setErrorMessage(t("errors.invalidToken"));
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/v1/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setUnsubscribedEmail(data.email);
      } else {
        setStatus("error");
        setErrorMessage(
          data.error === "not_subscribed" ? t("errors.notSubscribed") : t("errors.generic"),
        );
      }
    } catch {
      setStatus("error");
      setErrorMessage(t("errors.generic"));
    }
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

        {status === "success" ? (
          <div className="glass-card no-hover-pop p-8 text-center sm:p-12">
            <div className="form-success-icon">
              <CheckIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-neutral-900 dark:text-white">
              {t("success.title")}
            </h2>
            <p className="mx-auto max-w-md text-neutral-600 dark:text-neutral-400">
              {t("success.message", { email: unsubscribedEmail })}
            </p>
            <div className="mt-8">
              <Button href="/" variant="glass-secondary">
                {t("backToHome")}
              </Button>
            </div>
          </div>
        ) : status === "error" ? (
          <div className="glass-card no-hover-pop p-8 text-center sm:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-red-500 shadow-lg shadow-rose-500/30">
              <CloseIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-neutral-900 dark:text-white">
              {t("error.title")}
            </h2>
            <p className="mx-auto max-w-md text-neutral-600 dark:text-neutral-400">
              {errorMessage}
            </p>
            <div className="mt-8">
              <Button href="/" variant="glass-secondary">
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
                disabled={!token || status === "loading"}
                variant="glass"
                className="w-full sm:w-auto"
              >
                {status === "loading" ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    {t("unsubscribing")}
                  </>
                ) : (
                  t("unsubscribe")
                )}
              </Button>

              <Button href="/" variant="glass-secondary" className="w-full sm:w-auto">
                {t("cancel")}
              </Button>
            </div>

            {!token && (
              <p className="form-error-text mt-4 text-center">{t("errors.missingToken")}</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
