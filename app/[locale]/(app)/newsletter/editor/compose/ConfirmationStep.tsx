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

      <div className="space-y-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4 dark:border-white/10 dark:bg-neutral-800/50">
        <h3 className="font-semibold text-neutral-900 dark:text-white">{t("previewSubject")}</h3>
        <p className="text-neutral-700 dark:text-neutral-300">{data.subject}</p>

        {data.previewText && (
          <>
            <h3 className="font-semibold text-neutral-900 dark:text-white">
              {t("previewPreviewText")}
            </h3>
            <p className="text-neutral-700 dark:text-neutral-300">{data.previewText}</p>
          </>
        )}

        <h3 className="font-semibold text-neutral-900 dark:text-white">{t("previewContent")}</h3>
        <div className="space-y-4">
          {allSections.map((section, index) => (
            <div
              key={section.id}
              className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800"
            >
              <div className="flex items-center gap-2">
                <span className="rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-500/20 dark:text-violet-200">
                  {index === 0 ? t("primaryLabel") : t("secondaryLabel", { number: index })}
                </span>
              </div>
              <h4 className="mt-2 font-semibold text-neutral-900 dark:text-white">
                {section.title}
              </h4>
              <p className="mt-1 text-sm whitespace-pre-wrap text-neutral-600 dark:text-neutral-400">
                {section.text.length > 200 ? `${section.text.slice(0, 200)}...` : section.text}
              </p>
              {section.imageUrl && (
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">
                  {t("hasImage")}
                </p>
              )}
              {section.ctaLabel && section.ctaHref && (
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">
                  {t("hasCta", { label: section.ctaLabel })}
                </p>
              )}
            </div>
          ))}
        </div>

        <h3 className="font-semibold text-neutral-900 dark:text-white">{t("previewAudience")}</h3>
        <p className="text-neutral-700 dark:text-neutral-300">{getAudienceLabel()}</p>
        {data.audience.manualEmails.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t("manualEmailsList")}:
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {data.audience.manualEmails.map((email) => (
                <span
                  key={email}
                  className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
                >
                  {email}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button
          onClick={() => handleSend(true)}
          disabled={isTestSending || isSending}
          variant="secondary"
          className="flex-1"
        >
          {isTestSending ? t("testSending") : t("testSend")}
        </Button>
        <Button
          onClick={() => handleSend(false)}
          disabled={isTestSending || isSending}
          className="flex-1 bg-gradient-to-r from-violet-600 to-rose-500 text-white hover:from-violet-700 hover:to-rose-600 disabled:opacity-50"
        >
          {isSending ? t("sending") : t("send")}
        </Button>
      </div>
    </div>
  );
}
