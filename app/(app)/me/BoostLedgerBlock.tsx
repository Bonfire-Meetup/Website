"use client";

import { useLocale, useTranslations } from "next-intl";

import { RefreshIcon } from "@/components/shared/Icons";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Link } from "@/i18n/navigation";
import type { BoostLedgerItem } from "@/lib/api/user-profile";
import { getBoostLedgerKindLabel } from "@/lib/boost-ledger";
import { formatDateTimeUTC } from "@/lib/utils/locale";

interface BoostLedgerBlockProps {
  error: string | null;
  items: BoostLedgerItem[];
  loading: boolean;
  onRefresh: () => void;
  refreshing: boolean;
}

function getDeltaTone(delta: number) {
  if (delta === 0) {
    return "bg-neutral-100 text-neutral-500 dark:bg-white/10 dark:text-neutral-300";
  }

  if (delta > 0) {
    return "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300";
  }

  return "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300";
}

export function BoostLedgerBlock({
  error,
  items,
  loading,
  onRefresh,
  refreshing,
}: BoostLedgerBlockProps) {
  const t = useTranslations("account.ledger");
  const locale = useLocale();

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/70 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3 dark:border-white/5">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{t("title")}</h3>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label={refreshing ? t("refreshing") : t("refresh")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200/80 bg-white/80 text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-900 disabled:cursor-default disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:border-white/20 dark:hover:text-white"
        >
          {refreshing ? (
            <LoadingSpinner size="sm" ariaLabel={t("refreshing")} />
          ) : (
            <RefreshIcon className="h-4 w-4" />
          )}
        </button>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="max-h-[280px] space-y-2 overflow-y-auto overscroll-contain sm:max-h-[320px]">
            {Array.from(
              { length: 4 },
              (_, skeletonIndex) => `boost-ledger-skeleton-${skeletonIndex}`,
            ).map((skeletonId) => (
              <div
                key={skeletonId}
                className="flex animate-pulse items-center justify-between rounded-xl bg-neutral-50 px-3 py-2 dark:bg-white/5"
              >
                <div className="space-y-1">
                  <div className="h-3 w-36 rounded bg-neutral-200/70 dark:bg-white/10" />
                  <div className="h-2.5 w-24 rounded bg-neutral-200/50 dark:bg-white/5" />
                </div>
                <div className="h-6 w-14 rounded-full bg-neutral-200/50 dark:bg-white/5" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
            {t("empty")}
          </div>
        ) : (
          <div>
            <div className="-mx-4 max-h-[280px] space-y-1.5 overflow-y-auto overscroll-contain px-4 sm:max-h-[320px]">
              {items.map((entry, index) => {
                const showBackfillDivider = entry.isBackfill && !items[index - 1]?.isBackfill;
                const title = getBoostLedgerKindLabel(entry.kind, t);
                const resource =
                  entry.resourceLabel && entry.href ? (
                    <Link
                      href={entry.href}
                      prefetch={false}
                      className="hover:text-brand-600 dark:hover:text-brand-300 font-medium text-neutral-900 transition dark:text-white"
                    >
                      {entry.resourceLabel}
                    </Link>
                  ) : entry.resourceLabel ? (
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {entry.resourceLabel}
                    </span>
                  ) : null;
                const context =
                  !entry.resourceLabel && entry.contextLabel && entry.href ? (
                    <Link
                      href={entry.href}
                      prefetch={false}
                      className="hover:text-brand-600 dark:hover:text-brand-300 truncate text-[11px] text-neutral-500 transition dark:text-neutral-400"
                    >
                      {entry.contextLabel}
                    </Link>
                  ) : entry.contextLabel ? (
                    <div className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                      {entry.contextLabel}
                    </div>
                  ) : null;

                return (
                  <div key={entry.id}>
                    {showBackfillDivider && (
                      <div className="my-2.5 flex items-center gap-3">
                        <div className="h-px flex-1 bg-neutral-200 dark:bg-white/10" />
                        <span className="shrink-0 text-[11px] font-medium tracking-[0.16em] text-neutral-400 uppercase dark:text-neutral-500">
                          {t("backfillDivider")}
                        </span>
                        <div className="h-px flex-1 bg-neutral-200 dark:bg-white/10" />
                      </div>
                    )}
                    <div
                      className={`flex items-start justify-between gap-2.5 rounded-xl px-3 py-2 ${
                        entry.isBackfill
                          ? "bg-neutral-50/70 opacity-80 dark:bg-white/5 dark:opacity-75"
                          : "bg-neutral-50 dark:bg-white/5"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-sm font-medium ${
                            entry.isBackfill
                              ? "text-neutral-700 dark:text-neutral-300"
                              : "text-neutral-900 dark:text-white"
                          }`}
                        >
                          {title}
                        </div>
                        {resource && <div className="truncate text-xs leading-4">{resource}</div>}
                        {context && <div className="leading-4">{context}</div>}
                        <div className="mt-0.5 text-[11px] leading-4 text-neutral-400 dark:text-neutral-500">
                          {formatDateTimeUTC(entry.createdAt, locale)}
                          {!entry.isBackfill && (
                            <>
                              <span className="mx-1">•</span>
                              {t("balanceAfter", { count: entry.balanceAfter })}
                            </>
                          )}
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${getDeltaTone(entry.delta)}`}
                      >
                        {entry.delta > 0 ? `+${entry.delta}` : String(entry.delta)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
