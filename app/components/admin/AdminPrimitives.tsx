"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatDateTimeLocal } from "@/lib/utils/locale";

const COLLAPSE_AFTER_CHARS = 320;

export function AdminListState({
  isLoading,
  isError,
  isEmpty,
  emptyMessage,
  onRetry,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  emptyMessage: string;
  onRetry: () => void;
  children: ReactNode;
}) {
  const t = useTranslations("admin.common");

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <LoadingSpinner size="lg" className="text-rose-600 dark:text-rose-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="surface mx-auto flex max-w-md flex-col items-center gap-3 p-6 text-center">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{t("loadError")}</p>
        <button
          type="button"
          onClick={onRetry}
          className="text-sm font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  if (isEmpty) {
    return <EmptyState message={emptyMessage} className="max-w-md p-8" />;
  }

  return children;
}

export function AdminToolbar({ children, count }: { children: ReactNode; count: number }) {
  const t = useTranslations("admin.common");

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">{children}</div>
      <p className="text-sm font-medium text-neutral-500 tabular-nums dark:text-neutral-400">
        {t("count", { count })}
      </p>
    </div>
  );
}

const FIELD_CLASS_NAME =
  "surface h-10 px-3 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-rose-400/60 focus:ring-2 focus:ring-rose-500/20 dark:text-neutral-100";

export function AdminSearchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations("admin.common");

  return (
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={t("searchPlaceholder")}
      aria-label={t("searchPlaceholder")}
      className={`${FIELD_CLASS_NAME} w-full sm:max-w-xs`}
    />
  );
}

export function AdminSelect({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={label}
      className={`${FIELD_CLASS_NAME} w-full pr-8 sm:w-auto sm:max-w-xs`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function AdminCard({ children }: { children: ReactNode }) {
  return <article className="surface p-5 sm:p-6">{children}</article>;
}

export function AdminTimestamp({ value }: { value: string }) {
  const locale = useLocale();

  return (
    <time
      dateTime={value}
      className="text-xs font-medium text-neutral-500 tabular-nums dark:text-neutral-400"
    >
      {formatDateTimeLocal(value, locale)}
    </time>
  );
}

export function AdminTag({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent";
}) {
  const toneClassName =
    tone === "accent"
      ? "border-orange-300/50 bg-orange-50 text-orange-700 dark:border-orange-400/25 dark:bg-orange-500/10 dark:text-orange-300"
      : "border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneClassName}`}
    >
      {children}
    </span>
  );
}

export function AdminRating({ label, value }: { label: string; value: number | null }) {
  const t = useTranslations("admin.common");

  return (
    <div className="surface-inset flex flex-col gap-1 px-3 py-2">
      <span className="eyebrow text-2xs text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className="text-lg font-black text-neutral-900 tabular-nums dark:text-white">
        {value === null ? (
          <span className="text-sm font-medium text-neutral-400">{t("noAnswer")}</span>
        ) : (
          <>
            {value}
            <span className="text-sm font-semibold text-neutral-400">/5</span>
          </>
        )}
      </span>
    </div>
  );
}

export function AdminStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="surface flex flex-col gap-1 p-4">
      <span className="eyebrow text-2xs text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className="text-3xl font-black text-neutral-900 tabular-nums dark:text-white">
        {value}
      </span>
      {hint ? <span className="text-xs text-neutral-500 dark:text-neutral-400">{hint}</span> : null}
    </div>
  );
}

export function AdminDistribution({
  title,
  rows,
  total,
}: {
  title: string;
  rows: { key: string; label: string; count: number }[];
  total: number;
}) {
  const t = useTranslations("admin.common");

  return (
    <section className="surface p-5">
      <h3 className="eyebrow mb-4 text-xs text-neutral-500 dark:text-neutral-400">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{t("noAnswer")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((row) => {
            const percent = total > 0 ? Math.round((row.count / total) * 100) : 0;

            return (
              <li key={row.key} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-neutral-700 dark:text-neutral-200">{row.label}</span>
                  <span className="shrink-0 font-semibold text-neutral-900 tabular-nums dark:text-white">
                    {row.count}
                    <span className="ml-1 text-xs font-medium text-neutral-400">{percent}%</span>
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200/70 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-400 to-rose-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function AdminLongText({ text }: { text: string }) {
  const t = useTranslations("admin.common");
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > COLLAPSE_AFTER_CHARS;
  const visibleText =
    isLong && !expanded ? `${text.slice(0, COLLAPSE_AFTER_CHARS).trimEnd()}…` : text;

  return (
    <div className="flex flex-col items-start gap-1">
      <p className="text-sm leading-relaxed whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
        {visibleText}
      </p>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="text-xs font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300"
        >
          {expanded ? t("showLess") : t("showMore")}
        </button>
      ) : null}
    </div>
  );
}

export function AdminMailLink({ email, subject }: { email: string; subject?: string }) {
  const href = subject
    ? `mailto:${email}?subject=${encodeURIComponent(`Re: ${subject}`)}`
    : `mailto:${email}`;

  return (
    <a
      href={href}
      className="text-sm font-medium break-all text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300"
    >
      {email}
    </a>
  );
}

export function matchesSearch(query: string, values: (string | null | undefined)[]) {
  const needle = query.trim().toLowerCase();

  if (!needle) {
    return true;
  }

  return values.some((value) => value?.toLowerCase().includes(needle));
}
