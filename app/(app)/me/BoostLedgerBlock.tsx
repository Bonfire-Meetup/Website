"use client";

import { useLocale, useTranslations } from "next-intl";

import { RefreshIcon, SparklesIcon } from "@/components/shared/Icons";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Link } from "@/i18n/navigation";
import type { BoostLedgerItem } from "@/lib/api/user-profile";
import { getBoostLedgerKindLabel } from "@/lib/boost-ledger";
import { formatDateTimeUTC } from "@/lib/utils/locale";

import { AccountPanel, AccountPanelRow, AccountPanelScrollArea } from "./AccountPanel";

interface BoostLedgerBlockProps {
  error: string | null;
  items: BoostLedgerItem[];
  loading: boolean;
  onRefresh: () => void;
  refreshing: boolean;
}

function getDeltaTone(delta: number) {
  if (delta === 0) {
    return "border border-neutral-200/80 bg-white/90 text-neutral-500 shadow-sm shadow-neutral-200/40 dark:border-white/10 dark:bg-white/10 dark:text-neutral-300 dark:shadow-none";
  }

  if (delta > 0) {
    return "border border-emerald-200/70 bg-emerald-50/90 text-emerald-700 shadow-sm shadow-emerald-100/80 dark:border-emerald-500/20 dark:bg-emerald-500/12 dark:text-emerald-300 dark:shadow-none";
  }

  return "border border-rose-200/70 bg-rose-50/90 text-rose-700 shadow-sm shadow-rose-100/80 dark:border-rose-500/20 dark:bg-rose-500/12 dark:text-rose-300 dark:shadow-none";
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
    <AccountPanel
      title={
        <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
          <SparklesIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          {t("title")}
        </h3>
      }
      action={
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label={refreshing ? t("refreshing") : t("refresh")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200/80 bg-white/90 text-neutral-500 shadow-sm shadow-neutral-200/50 transition hover:-translate-y-px hover:border-neutral-300 hover:text-neutral-900 disabled:translate-y-0 disabled:cursor-default disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:shadow-none dark:hover:border-white/20 dark:hover:text-white"
        >
          {refreshing ? (
            <LoadingSpinner size="sm" ariaLabel={t("refreshing")} />
          ) : (
            <RefreshIcon className="h-4 w-4" />
          )}
        </button>
      }
    >
      {loading ? (
        <AccountPanelScrollArea className="max-h-[280px] space-y-2 sm:max-h-[320px]">
          {Array.from(
            { length: 4 },
            (_, skeletonIndex) => `boost-ledger-skeleton-${skeletonIndex}`,
          ).map((skeletonId) => (
            <AccountPanelRow key={skeletonId} className="animate-pulse py-2 dark:bg-white/5">
              <div className="space-y-1">
                <div className="h-3 w-36 rounded bg-neutral-200/70 dark:bg-white/10" />
                <div className="h-2.5 w-24 rounded bg-neutral-200/50 dark:bg-white/5" />
              </div>
              <div className="h-6 w-14 rounded-full bg-neutral-200/50 dark:bg-white/5" />
            </AccountPanelRow>
          ))}
        </AccountPanelScrollArea>
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
          <AccountPanelScrollArea className="max-h-[280px] space-y-1.5 sm:max-h-[320px]">
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
                      <div className="h-px flex-1 bg-linear-to-r from-transparent via-neutral-200 to-transparent dark:via-white/10" />
                      <span className="shrink-0 rounded-full border border-neutral-200/80 bg-white/80 px-2 py-0.5 text-[10px] font-medium tracking-[0.16em] text-neutral-400 uppercase dark:border-white/10 dark:bg-white/5 dark:text-neutral-500">
                        {t("backfillDivider")}
                      </span>
                      <div className="h-px flex-1 bg-linear-to-r from-transparent via-neutral-200 to-transparent dark:via-white/10" />
                    </div>
                  )}
                  <AccountPanelRow
                    className={`items-start gap-2.5 py-2 ${
                      entry.isBackfill
                        ? "border-neutral-200/50 bg-neutral-50/75 opacity-80 dark:border-white/6 dark:bg-white/5 dark:opacity-75"
                        : "hover:-translate-y-px hover:border-neutral-300/80 hover:shadow-neutral-200/50 dark:hover:border-white/12"
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
                      {resource && (
                        <div className="truncate pt-0.5 text-xs leading-4">{resource}</div>
                      )}
                      {context && <div className="leading-4">{context}</div>}
                      <div className="mt-1 text-[11px] leading-4 text-neutral-400 dark:text-neutral-500">
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
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${getDeltaTone(entry.delta)}`}
                    >
                      {entry.delta > 0 ? `+${entry.delta}` : String(entry.delta)}
                    </span>
                  </AccountPanelRow>
                </div>
              );
            })}
          </AccountPanelScrollArea>
        </div>
      )}
    </AccountPanel>
  );
}
