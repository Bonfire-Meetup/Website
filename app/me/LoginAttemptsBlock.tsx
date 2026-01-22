"use client";

import { useLocale, useTranslations } from "next-intl";

interface Attempt {
  id: string;
  outcome: string;
  createdAt: string;
}

interface LoginAttemptsBlockProps {
  items: Attempt[];
  loading: boolean;
  error: string | null;
}

export function LoginAttemptsBlock({ items, loading, error }: LoginAttemptsBlockProps) {
  const t = useTranslations("account.attempts");
  const locale = useLocale();
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
    <div className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/70 dark:border-white/10 dark:bg-white/5">
      <div className="border-b border-neutral-100 px-4 py-3 dark:border-white/5">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{t("title")}</h3>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="max-h-[280px] space-y-2 overflow-y-auto overscroll-contain sm:max-h-[320px]">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`attempt-skeleton-${index}`}
                className="flex animate-pulse items-center justify-between rounded-xl bg-neutral-50 px-3 py-2.5 dark:bg-white/5"
              >
                <div className="space-y-1.5">
                  <div className="h-3 w-28 rounded bg-neutral-200/70 dark:bg-white/10" />
                  <div className="h-2.5 w-20 rounded bg-neutral-200/50 dark:bg-white/5" />
                </div>
                <div className="h-5 w-16 rounded-full bg-neutral-200/50 dark:bg-white/5" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
            {t("error")}
          </div>
        ) : items.length === 0 ? (
          <div className="py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
            {t("empty")}
          </div>
        ) : (
          <div className="-mx-4 max-h-[280px] space-y-2 overflow-y-auto overscroll-contain px-4 sm:max-h-[320px]">
            {items.map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 px-3 py-2.5 dark:bg-white/5"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-neutral-900 dark:text-white">
                    {t(`outcomes.${attempt.outcome}`) ?? attempt.outcome}
                  </div>
                  <div className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {new Date(attempt.createdAt).toLocaleString(locale)}
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${getOutcomeStyle(attempt.outcome)}`}
                >
                  {attempt.outcome}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
