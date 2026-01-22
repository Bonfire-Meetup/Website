"use client";

import { useTranslations } from "next-intl";

interface PreferenceBlockProps {
  enabled: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export function PreferenceBlock({ enabled, disabled, onToggle }: PreferenceBlockProps) {
  const t = useTranslations("account.communityEmails");
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/70 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <div className="text-sm font-medium text-neutral-900 dark:text-white">{t("title")}</div>
          <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{t("body")}</div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition ${
            enabled ? "bg-emerald-500 dark:bg-emerald-500" : "bg-neutral-200 dark:bg-neutral-700"
          } ${disabled ? "cursor-wait opacity-70" : ""}`}
          aria-pressed={enabled}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
          <span className="sr-only">{enabled ? t("enabled") : t("disabled")}</span>
        </button>
      </div>
    </div>
  );
}
