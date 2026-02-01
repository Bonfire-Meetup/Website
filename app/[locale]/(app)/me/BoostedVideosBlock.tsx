"use client";

import type { BoostedRecording } from "@/lib/api/user-profile";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Link } from "@/i18n/navigation";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { formatShortDateUTC } from "@/lib/utils/locale";

interface BoostedVideosBlockProps {
  loading: boolean;
  error: string | null;
  items: BoostedRecording[];
  onRemove: (shortId: string) => void;
}

export function BoostedVideosBlock({ loading, error, items, onRemove }: BoostedVideosBlockProps) {
  const t = useTranslations("account.boosted");
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showSkeletons = !mounted || loading;

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/70 dark:border-white/10 dark:bg-white/5">
      <div className="border-b border-neutral-100 px-4 py-3 dark:border-white/5">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{t("title")}</h3>
      </div>
      <div className="p-4">
        {showSkeletons ? (
          <div className="max-h-[280px] space-y-2 overflow-y-auto overscroll-contain sm:max-h-[320px]">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`boost-skeleton-${index}`}
                className="flex animate-pulse items-center justify-between rounded-xl bg-neutral-50 px-3 py-2.5 dark:bg-white/5"
              >
                <div className="space-y-1.5">
                  <div className="h-3 w-36 rounded bg-neutral-200/70 dark:bg-white/10" />
                  <div className="h-2.5 w-24 rounded bg-neutral-200/50 dark:bg-white/5" />
                </div>
                <div className="h-6 w-14 rounded bg-neutral-200/50 dark:bg-white/5" />
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
            {items.map((boost) => {
              const formattedDate = formatShortDateUTC(boost.boostedAt, locale);

              return (
                <div
                  key={boost.shortId}
                  className="group flex items-center justify-between gap-3 rounded-xl bg-neutral-50 px-3 py-2.5 transition hover:bg-neutral-100 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={PAGE_ROUTES.WATCH(boost.slug, boost.shortId)}
                      prefetch={false}
                      className="hover:text-brand-600 dark:hover:text-brand-300 block truncate text-sm font-medium text-neutral-900 dark:text-white"
                    >
                      {boost.title}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="truncate">{boost.speaker.join(", ")}</span>
                      <span className="shrink-0">•</span>
                      <span className="shrink-0">{formattedDate}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(boost.shortId)}
                    className="shrink-0 cursor-pointer rounded-lg px-2 py-1 text-xs text-neutral-400 opacity-0 transition group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                  >
                    {t("remove")}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
