"use client";

import type { NewsletterWizardData } from "./types";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/errors";
import { getValidAccessTokenAsync } from "@/lib/api/query-utils";
import { API_ROUTES } from "@/lib/api/routes";
import { createJsonAuthHeaders } from "@/lib/utils/http";
import { logWarn } from "@/lib/utils/log-client";

interface ConfirmationStepProps {
  data: NewsletterWizardData;
  onSendComplete: () => void;
}

export function ConfirmationStep({ data, onSendComplete }: ConfirmationStepProps) {
  const t = useTranslations("newsletterEditor");
  const [isSending, setIsSending] = useState(false);
  const [isTestSending, setIsTestSending] = useState(false);
  const [sendConfirmed, setSendConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const allSections = [data.primaryNews, ...data.secondaryNews];

  const handleSend = async (testMode = false) => {
    if (testMode) {
      setIsTestSending(true);
    } else {
      setIsSending(true);
    }
    setError(null);
    setSuccess(null);

    try {
      const accessToken = await getValidAccessTokenAsync();
      if (!accessToken) {
        throw new ApiError("Access token required", 401);
      }

      const response = await fetch(API_ROUTES.NEWSLETTER.SEND, {
        method: "POST",
        headers: createJsonAuthHeaders(accessToken),
        body: JSON.stringify({
          subject: data.subject,
          previewText: data.previewText,
          sections: allSections,
          audience: data.audience,
          testMode,
        }),
      });

      if (response.ok) {
        setSuccess(testMode ? t("testSendSuccess") : t("sendSuccess"));
        if (!testMode) {
          onSendComplete();
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: "unknown" }));
        throw new ApiError("Newsletter send failed", response.status, errorData);
      }
    } catch (err) {
      logWarn("newsletter.send_failed", { error: String(err), testMode });
      setError(t("sendError"));
    } finally {
      if (testMode) {
        setIsTestSending(false);
      } else {
        setIsSending(false);
      }
    }
  };

  const getAudienceLabel = () => {
    switch (data.audience.type) {
      case "all":
        return t("audienceAll");
      case "subscribers":
        return t("audienceSubscribers");
      case "registered":
        return t("audienceRegistered");
      case "manual":
        return t("audienceManual");
      default:
        return "";
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          {t("confirmationTitle")}
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{t("confirmationHint")}</p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          {success}
        </div>
      )}

      <div className="mx-auto max-w-[600px] overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-neutral-900 dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
        <div className="border-b border-neutral-200/80 px-5 py-4 dark:border-white/10">
          <p className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
            {t("previewSubject")}
          </p>
          <p className="mt-1 font-semibold text-neutral-900 dark:text-white">{data.subject}</p>
          {data.previewText && (
            <p className="mt-1.5 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
              {data.previewText}
            </p>
          )}
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-white/5">
          {allSections.map((section, index) => (
            <div key={section.id} className="bg-white dark:bg-neutral-900">
              <div className="h-1 w-full shrink-0 bg-gradient-to-r from-fuchsia-700 via-orange-500 to-red-600" />

              {section.imageUrl && (
                <div className="relative h-40 w-full bg-neutral-100 dark:bg-neutral-800">
                  <img
                    src={section.imageUrl}
                    alt=""
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              )}

              <div className="px-5 py-4">
                {!section.imageUrl && index > 0 && (
                  <p className="mb-2 text-[10px] font-bold tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
                    {t("secondaryLabel", { number: index })}
                  </p>
                )}
                <h3 className="font-semibold text-neutral-900 dark:text-white">{section.title}</h3>
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-neutral-600 dark:text-neutral-400">
                  {section.text.length > 280 ? `${section.text.slice(0, 280)}…` : section.text}
                </p>
                {section.ctaLabel && section.ctaHref && (
                  <p className="mt-3">
                    <span className="inline-flex rounded-lg bg-gradient-to-r from-fuchsia-700 via-orange-500 to-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm">
                      {section.ctaLabel}
                    </span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-200/80 px-5 py-3 dark:border-white/10">
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
            {t("previewAudience")}: {getAudienceLabel()}
            {data.audience.manualEmails.length > 0 && (
              <span className="mt-1 block truncate text-neutral-500 dark:text-neutral-400">
                {data.audience.manualEmails.join(", ")}
              </span>
            )}
          </p>
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200/80 bg-white/60 px-4 py-3 sm:px-5 dark:border-white/10 dark:bg-white/5">
        <input
          type="checkbox"
          checked={sendConfirmed}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSendConfirmed(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 text-fuchsia-600 accent-fuchsia-600 focus:ring-fuchsia-500 dark:border-neutral-600 dark:accent-fuchsia-500"
          aria-describedby="send-confirm-description"
        />
        <span
          id="send-confirm-description"
          className="text-sm text-neutral-700 dark:text-neutral-300"
        >
          {t("sendConfirmLabel")}
        </span>
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={() => handleSend(true)}
          disabled={isTestSending || isSending}
          variant="glass-secondary"
          size="sm"
          className="flex-1"
        >
          {isTestSending ? t("testSending") : t("testSend")}
        </Button>
        <Button
          onClick={() => handleSend(false)}
          disabled={!sendConfirmed || isTestSending || isSending}
          variant="primary"
          size="sm"
          className="flex-1"
        >
          {isSending ? t("sending") : t("send")}
        </Button>
      </div>
    </div>
  );
}
