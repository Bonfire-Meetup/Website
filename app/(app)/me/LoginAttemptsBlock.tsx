"use client";

import { useLocale, useTranslations } from "next-intl";

import { LogInIcon } from "@/components/shared/Icons";
import { formatDateTimeUTC } from "@/lib/utils/locale";

import { AccountPanel, AccountPanelRow, AccountPanelScrollArea } from "./AccountPanel";

interface Attempt {
  id: string;
  outcome: string;
  method: string | null;
  createdAt: string;
  userAgentSummary: string | null;
}

interface LoginAttemptsBlockProps {
  items: Attempt[];
  loading: boolean;
  error: string | null;
}

export function LoginAttemptsBlock({ items, loading, error }: LoginAttemptsBlockProps) {
  const t = useTranslations("account.attempts");
  const locale = useLocale();
  const outcomeKeyMap: Record<string, string> = {
    invalidCode: "mismatch",
    maxAttempts: "max_attempts",
    rateLimited: "rate_limited",
  };

  const getOutcomeStyle = (outcome: string) => {
    if (outcome === "success") {
      return "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400";
    }

    if (outcome === "rate_limited" || outcome === "too_many_attempts") {
      return "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400";
    }

    return "bg-neutral-100 text-neutral-500 dark:bg-white/5 dark:text-neutral-400";
  };

  return (
    <AccountPanel
      title={
        <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
          <LogInIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          {t("title")}
        </h3>
      }
    >
      {loading ? (
        <AccountPanelScrollArea className="space-y-2">
          {Array.from({ length: 3 }, (_, skeletonIndex) => `attempt-skeleton-${skeletonIndex}`).map(
            (skeletonId) => (
              <AccountPanelRow key={skeletonId} className="animate-pulse">
                <div className="space-y-1.5">
                  <div className="h-3 w-28 rounded bg-neutral-200/70 dark:bg-white/10" />
                  <div className="h-2.5 w-20 rounded bg-neutral-200/50 dark:bg-white/5" />
                </div>
                <div className="h-5 w-16 rounded-full bg-neutral-200/50 dark:bg-white/5" />
              </AccountPanelRow>
            ),
          )}
        </AccountPanelScrollArea>
      ) : error ? (
        <div className="py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
          {t("error")}
        </div>
      ) : items.length === 0 ? (
        <div className="py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
          {t("empty")}
        </div>
      ) : (
        <AccountPanelScrollArea className="space-y-2">
          {items.map((attempt) => (
            <AccountPanelRow
              key={attempt.id}
              className="hover:-translate-y-px hover:border-neutral-300/80 hover:shadow-neutral-200/50 dark:hover:border-white/12"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-neutral-900 dark:text-white">
                  {t(`outcomes.${outcomeKeyMap[attempt.outcome] ?? attempt.outcome}`)}
                  {attempt.outcome === "success" && attempt.method && (
                    <span className="ml-1 text-neutral-500 dark:text-neutral-400">
                      ({t(`methods.${attempt.method}`) ?? attempt.method})
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  <div>{formatDateTimeUTC(attempt.createdAt, locale)}</div>
                  {attempt.userAgentSummary && (
                    <div className="mt-0.5 text-[11px] text-neutral-400 dark:text-neutral-500">
                      {attempt.userAgentSummary}
                    </div>
                  )}
                </div>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${getOutcomeStyle(attempt.outcome)}`}
              >
                {attempt.outcome}
              </span>
            </AccountPanelRow>
          ))}
        </AccountPanelScrollArea>
      )}
    </AccountPanel>
  );
}
