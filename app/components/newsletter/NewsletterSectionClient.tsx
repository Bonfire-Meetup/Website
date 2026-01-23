"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { API_ROUTES } from "@/lib/api/routes";

import { CheckIcon } from "../shared/icons";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/LoadingSpinner";

type Status = "idle" | "loading" | "success" | "error";

export function NewsletterSectionClient() {
  const t = useTranslations("sections.newsletter");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        setStatus("idle");
        setEmail("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleReset = useCallback(() => {
    setStatus("idle");
    setEmail("");
    setError("");
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setStatus("loading");
      setError("");

      try {
        const response = await fetch(API_ROUTES.NEWSLETTER.SUBSCRIBE, {
          body: JSON.stringify({ email }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          const errorMessage = data.error || t("error");

          if (response.status === 429) {
            setError(t("rateLimitError"));
          } else {
            setError(errorMessage);
          }

          setStatus("error");
          return;
        }

        setStatus("success");
        setEmail("");
      } catch {
        setError(t("error"));
        setStatus("error");
      }
    },
    [email, t],
  );

  const inputBaseClass = "form-input-base";
  const inputNormalClass = "form-input";
  const inputErrorClass = "form-input-error";

  if (status === "success") {
    return (
      <div className="glass-card no-hover-pop mx-auto max-w-2xl p-8 text-center sm:p-12">
        <div className="form-success-icon">
          <CheckIcon className="h-8 w-8 text-white" />
        </div>
        <h3 className="mb-3 text-2xl font-bold text-neutral-900 dark:text-white">
          {t("successTitle")}
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">{t("successMessage")}</p>
        <div className="mt-6 flex justify-center">
          <Button type="button" variant="plain" onClick={handleReset}>
            {t("subscribeAnother")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card no-hover-pop mx-auto max-w-2xl p-8 sm:p-12">
      <form onSubmit={handleSubmit} className="space-y-4 md:flex md:gap-4 md:space-y-0">
        <div className="flex-1">
          <label htmlFor="newsletter-email" className="sr-only">
            {t("emailLabel")}
          </label>
          <input
            id="newsletter-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
            placeholder={t("emailPlaceholder")}
            className={`${inputBaseClass} ${status === "error" ? inputErrorClass : inputNormalClass}`}
          />
          {status === "error" && error && <p className="form-error-text">{error}</p>}
        </div>

        <Button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className="glass-button w-full md:w-auto md:shrink-0"
        >
          {status === "loading" ? (
            <>
              <LoadingSpinner className="mr-2 h-4 w-4" />
              {t("subscribing")}
            </>
          ) : (
            t("subscribe")
          )}
        </Button>
      </form>
      <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">{t("privacyNote")}</p>
    </div>
  );
}
