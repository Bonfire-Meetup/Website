"use client";

import { useTranslations } from "next-intl";

const TAG_CLOUD_PANEL_CLASS =
  "sm:rounded-[24px] sm:border sm:border-white/65 sm:bg-white/70 sm:p-4 sm:shadow-[0_18px_42px_-30px_rgba(15,23,42,0.28)] sm:ring-1 sm:ring-white/35 sm:backdrop-blur-xl dark:sm:border-white/10 dark:sm:bg-white/5 dark:sm:ring-white/10 dark:sm:shadow-[0_22px_48px_-32px_rgba(0,0,0,0.78)]";

const TAG_CLOUD_BUTTON_BASE_CLASS =
  "inline-flex items-center gap-2 rounded-full border font-medium tracking-[-0.01em] transition-[background-color,border-color,color,box-shadow] duration-200";

const TAG_CLOUD_WEIGHT_CLASSES = {
  high: "min-h-8 px-3 py-1 text-xs sm:min-h-10 sm:px-4 sm:py-2 sm:text-sm sm:shadow-[0_14px_28px_-22px_rgba(15,23,42,0.22)]",
  low: "min-h-8 px-2.5 py-1 text-xs sm:min-h-9 sm:px-3 sm:py-1.5 sm:text-sm",
} as const;

const TAG_CLOUD_TONE_CLASSES = [
  "border-rose-200/70 bg-rose-50/78 text-rose-950 hover:border-rose-300/80 hover:bg-rose-100/78 dark:border-rose-500/18 dark:bg-rose-500/10 dark:text-rose-100 dark:hover:bg-rose-500/14",
  "border-orange-200/70 bg-orange-50/78 text-orange-950 hover:border-orange-300/80 hover:bg-orange-100/78 dark:border-orange-500/18 dark:bg-orange-500/10 dark:text-orange-100 dark:hover:bg-orange-500/14",
  "border-amber-200/70 bg-amber-50/78 text-amber-950 hover:border-amber-300/80 hover:bg-amber-100/78 dark:border-amber-500/18 dark:bg-amber-500/10 dark:text-amber-100 dark:hover:bg-amber-500/14",
  "border-sky-200/70 bg-sky-50/78 text-sky-950 hover:border-sky-300/80 hover:bg-sky-100/78 dark:border-sky-500/18 dark:bg-sky-500/10 dark:text-sky-100 dark:hover:bg-sky-500/14",
] as const;

export interface WatchLaterTagCloudItem {
  accentIndex: number;
  count: number;
  tag: string;
  weight: keyof typeof TAG_CLOUD_WEIGHT_CLASSES;
}

interface WatchLaterTagCloudProps {
  activeTag: string;
  items: WatchLaterTagCloudItem[];
  onTagChange: (tag: string) => void;
}

export function WatchLaterTagCloud({ activeTag, items, onTagChange }: WatchLaterTagCloudProps) {
  const t = useTranslations("watchLaterPage");

  if (items.length === 0) {
    return null;
  }

  return (
    <section className={TAG_CLOUD_PANEL_CLASS}>
      <p className="text-xs font-bold tracking-[0.28em] text-neutral-500 uppercase dark:text-neutral-500">
        {t("topicsLabel")}
      </p>

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
        <button
          type="button"
          onClick={() => onTagChange("all")}
          aria-pressed={activeTag === "all"}
          className={`${TAG_CLOUD_BUTTON_BASE_CLASS} shrink-0 whitespace-nowrap ${TAG_CLOUD_WEIGHT_CLASSES.high} ${
            activeTag === "all"
              ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950"
              : "border-black/8 bg-white/82 text-neutral-800 hover:border-black/12 hover:bg-white dark:border-white/10 dark:bg-white/7 dark:text-neutral-100 dark:hover:bg-white/12"
          }`}
        >
          <span>{t("allTags")}</span>
        </button>

        {items.map((item) => {
          const isActive = activeTag === item.tag;

          return (
            <button
              key={item.tag}
              type="button"
              onClick={() => onTagChange(item.tag)}
              aria-pressed={isActive}
              className={`${TAG_CLOUD_BUTTON_BASE_CLASS} shrink-0 whitespace-nowrap ${TAG_CLOUD_WEIGHT_CLASSES[item.weight]} ${
                isActive
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                  : TAG_CLOUD_TONE_CLASSES[item.accentIndex % TAG_CLOUD_TONE_CLASSES.length]
              }`}
            >
              <span className="capitalize">#{item.tag}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold sm:text-[11px] ${
                  isActive
                    ? "bg-white/14 text-white dark:bg-neutral-950/10 dark:text-neutral-950"
                    : "bg-black/5 text-current dark:bg-white/10"
                }`}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
