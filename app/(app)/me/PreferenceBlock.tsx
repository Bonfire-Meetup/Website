"use client";

import { useTranslations } from "next-intl";

import { CheckIcon } from "@/components/shared/Icons";

interface PreferenceBlockProps {
  enabled: boolean;
  disabled?: boolean;
  onToggle: () => void | Promise<void>;
  translationKey: "communityEmails" | "publicProfile";
}

export function PreferenceBlock({
  enabled,
  disabled,
  onToggle,
  translationKey,
}: PreferenceBlockProps) {
  const t = useTranslations(`account.${translationKey}`);

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-linear-to-br from-white via-white to-neutral-50/80 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.22)] transition dark:border-white/10 dark:from-white/8 dark:via-white/5 dark:to-white/[0.03] dark:shadow-none">
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <div className="text-sm font-medium text-neutral-900 dark:text-white">{t("title")}</div>
          <div className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
            {t("body")}
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border shadow-sm transition ${
            enabled
              ? "border-emerald-400/70 bg-emerald-500 dark:border-emerald-400/30 dark:bg-emerald-500"
              : "border-neutral-200 bg-neutral-100 dark:border-white/10 dark:bg-neutral-800"
          } ${disabled ? "cursor-wait opacity-70" : ""} `}
          aria-pressed={enabled}
        >
          <span
            className={`inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white text-emerald-500 shadow-sm transition ${
              enabled ? "translate-x-6" : "translate-x-1 text-transparent"
            }`}
          >
            <CheckIcon className="h-3 w-3" />
          </span>
          <span className="sr-only">{enabled ? t("enabled") : t("disabled")}</span>
        </button>
      </div>
    </div>
  );
}
