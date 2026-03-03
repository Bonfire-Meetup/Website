"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { NewsletterSectionCard } from "@/components/newsletter/NewsletterSectionCard";
import { CheckCircleIcon, MailIcon } from "@/components/shared/Icons";
import { Button } from "@/components/ui/Button";
import { getValidAccessTokenAsync } from "@/lib/api/query-utils";
import { API_ROUTES } from "@/lib/api/routes";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { createJsonAuthHeaders } from "@/lib/utils/http";
import { logWarn } from "@/lib/utils/log-client";

import type { NewsletterWizardData } from "./types";

interface ConfirmationStepProps {
  data: NewsletterWizardData;
  recipientCount: number | null;
  /** When provided, the "Send New Newsletter" button resets the wizard in-place instead of navigating. */
  onSendAnother?: () => void;
  /** When set, reuses the existing newsletter archive record (same public URL). */
  resendSlug?: string;
}

type SendPhase = "idle" | "sending" | "done";

interface SendResult {
  sentCount: number;
  errorCount: number;
  durationMs: number;
}

function formatDuration(ms: number): string {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
}

export function ConfirmationStep({
  data,
  recipientCount,
  onSendAnother,
  resendSlug,
}: ConfirmationStepProps) {
  const t = useTranslations("newsletterEditor");
  const router = useRouter();
  const [sendPhase, setSendPhase] = useState<SendPhase>("idle");
  const [isTestSending, setIsTestSending] = useState(false);
  const [sendConfirmed, setSendConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ sent: number; total: number } | null>(null);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);
  const startTimeRef = useRef<number>(0);

  const allSections = [data.primaryNews, ...data.secondaryNews];

  const handleSend = async (testMode = false) => {
    if (testMode) {
      setIsTestSending(true);
      setTestSuccess(null);
    } else {
      setSendPhase("sending");
      startTimeRef.current = Date.now();
    }
    setError(null);

    let sendError = false;
    try {
      const accessToken = await getValidAccessTokenAsync();
      if (!accessToken) {
        sendError = true;
      } else {
        const url = resendSlug
          ? API_ROUTES.NEWSLETTER.SENDS(resendSlug)
          : API_ROUTES.NEWSLETTER.LIST;
        const body = resendSlug
          ? JSON.stringify({ audience: data.audience, testMode })
          : JSON.stringify({
              subject: data.subject,
              previewText: data.previewText,
              sections: allSections,
              audience: data.audience,
              testMode,
            });
        const response = await fetch(url, {
          method: "POST",
          headers: createJsonAuthHeaders(accessToken),
          body,
        });

        if (!response.ok || !response.body) {
          sendError = true;
        } else {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            // eslint-disable-next-line no-await-in-loop
            const { done, value } = await reader.read();
            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (line.trim()) {
                try {
                  const chunk = JSON.parse(line) as Record<string, unknown>;
                  if (typeof chunk.sent === "number" && typeof chunk.total === "number") {
                    setProgress({ sent: chunk.sent, total: chunk.total });
                  }
                  if (chunk.done) {
                    if (testMode) {
                      setTestSuccess(t("testSendSuccess"));
                    } else {
                      setSendResult({
                        sentCount: typeof chunk.sentCount === "number" ? chunk.sentCount : 0,
                        errorCount: typeof chunk.errorCount === "number" ? chunk.errorCount : 0,
                        durationMs: Date.now() - startTimeRef.current,
                      });
                      setSendPhase("done");
                    }
                  }
                } catch {
                  // Ignore malformed lines
                }
              }
            }
          }
        }
      }
    } catch (err) {
      logWarn("newsletter.send_failed", { error: String(err), testMode });
      sendError = true;
    }

    setProgress(null);
    if (sendError) {
      setError(t("sendError"));
      if (!testMode) {
        setSendPhase("idle");
      }
    }
    if (testMode) {
      setIsTestSending(false);
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

  if (sendPhase === "sending") {
    const pct = progress ? Math.round((progress.sent / progress.total) * 100) : 0;
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-8 py-8">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-neutral-200 border-t-rose-500 dark:border-neutral-700 dark:border-t-rose-400" />
          <MailIcon className="h-6 w-6 text-rose-500 dark:text-rose-400" />
        </div>

        <div className="w-full max-w-sm space-y-3 text-center">
          <p className="font-semibold text-neutral-900 dark:text-white">{t("sending")}</p>

          {progress && (
            <>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {t("sendingProgress", { sent: progress.sent, total: progress.total })}
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-500 transition-[width] duration-300 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-neutral-400 tabular-nums dark:text-neutral-500">{pct}%</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (sendPhase === "done" && sendResult) {
    const hasErrors = sendResult.errorCount > 0;
    return (
      <div className="flex flex-col items-center gap-8 py-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
          <CheckCircleIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>

        <h2 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
          {t("sendResultTitle")}
        </h2>

        <div className="grid w-full max-w-xs grid-cols-2 gap-3">
          <div className="rounded-xl bg-emerald-50 px-4 py-4 text-center dark:bg-emerald-500/10">
            <p className="text-3xl font-black text-emerald-700 tabular-nums dark:text-emerald-400">
              {sendResult.sentCount.toLocaleString()}
            </p>
            <p className="mt-1 text-xs font-medium text-emerald-600/80 dark:text-emerald-400/70">
              {t("sendResultSent")}
            </p>
          </div>

          {hasErrors ? (
            <div className="rounded-xl bg-rose-50 px-4 py-4 text-center dark:bg-rose-500/10">
              <p className="text-3xl font-black text-rose-700 tabular-nums dark:text-rose-400">
                {sendResult.errorCount.toLocaleString()}
              </p>
              <p className="mt-1 text-xs font-medium text-rose-600/80 dark:text-rose-400/70">
                {t("sendResultErrors")}
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-neutral-100 px-4 py-4 text-center dark:bg-white/5">
              <p className="text-3xl font-black text-neutral-700 tabular-nums dark:text-neutral-300">
                {formatDuration(sendResult.durationMs)}
              </p>
              <p className="mt-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {t("sendResultDuration")}
              </p>
            </div>
          )}

          {hasErrors && (
            <div className="col-span-2 rounded-xl bg-neutral-100 px-4 py-4 text-center dark:bg-white/5">
              <p className="text-2xl font-black text-neutral-700 tabular-nums dark:text-neutral-300">
                {formatDuration(sendResult.durationMs)}
              </p>
              <p className="mt-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {t("sendResultDuration")}
              </p>
            </div>
          )}
        </div>

        <div className="flex w-full max-w-xs flex-col gap-3">
          {onSendAnother && (
            <Button onClick={onSendAnother} variant="primary" size="sm" className="w-full">
              {t("sendAnother")}
            </Button>
          )}
          <Button
            onClick={() => router.push(PAGE_ROUTES.HOME)}
            variant="glass-secondary"
            size="sm"
            className="w-full"
          >
            {t("backToHomepage")}
          </Button>
        </div>
      </div>
    );
  }

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

      {testSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          {testSuccess}
        </div>
      )}

      <div className="mx-auto max-w-[600px] overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-neutral-900 dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
        <div className="max-h-[560px] overflow-y-auto">
          <div className="border-b border-neutral-200/80 px-5 py-4 dark:border-white/10">
            <p className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
              {t("previewSubject")}
            </p>
            <p className="mt-1 font-semibold text-neutral-900 dark:text-white">{data.subject}</p>
            {data.previewText && (
              <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                {data.previewText}
              </p>
            )}
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-white/5">
            {allSections.map((section, index) => (
              <NewsletterSectionCard
                key={section.id}
                section={section}
                secondaryLabel={index > 0 ? t("secondaryLabel", { number: index }) : undefined}
                variant="preview"
              />
            ))}
          </div>
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
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 text-rose-600 accent-rose-600 focus:ring-rose-500 dark:border-neutral-600 dark:accent-rose-500"
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
          disabled={isTestSending || sendPhase !== "idle"}
          variant="glass-secondary"
          size="sm"
          className="flex-1"
        >
          {isTestSending ? t("testSending") : t("testSend")}
        </Button>
        <Button
          onClick={() => handleSend(false)}
          disabled={!sendConfirmed || isTestSending || sendPhase !== "idle"}
          variant="primary"
          size="sm"
          className="flex-1"
        >
          {recipientCount !== null
            ? `${t("send")} (${recipientCount.toLocaleString()})`
            : t("send")}
        </Button>
      </div>
    </div>
  );
}
