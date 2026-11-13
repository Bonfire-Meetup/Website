"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatDateTimeLocal } from "@/lib/utils/locale";

const COLLAPSE_AFTER_CHARS = 320;
const MAX_SCORE = 5;

export const ADMIN_PANEL_CLASS =
  "rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-neutral-900 dark:shadow-none";

export const ADMIN_LABEL_CLASS =
  "text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400";

type ScoreTone = "good" | "ok" | "low" | "none";

function getScoreTone(value: number | null): ScoreTone {
  if (value === null) {
    return "none";
  }

  if (value >= 4) {
    return "good";
  }

  return value >= 3 ? "ok" : "low";
}

const SCORE_CHIP_CLASS: Record<ScoreTone, string> = {
  good: "bg-emerald-50 text-emerald-800 ring-emerald-600/25 dark:bg-emerald-500/12 dark:text-emerald-300 dark:ring-emerald-400/30",
  low: "bg-rose-50 text-rose-800 ring-rose-600/25 dark:bg-rose-500/12 dark:text-rose-300 dark:ring-rose-400/30",
  none: "bg-neutral-100 text-neutral-400 ring-neutral-300/70 dark:bg-white/5 dark:text-neutral-500 dark:ring-white/10",
  ok: "bg-amber-50 text-amber-800 ring-amber-600/25 dark:bg-amber-500/12 dark:text-amber-300 dark:ring-amber-400/30",
};

const SCORE_BAR_CLASS: Record<ScoreTone, string> = {
  good: "bg-emerald-500",
  low: "bg-rose-500",
  none: "bg-transparent",
  ok: "bg-amber-500",
};

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
      <div
        className={`${ADMIN_PANEL_CLASS} mx-auto flex max-w-md flex-col items-center gap-3 p-6 text-center`}
      >
        <p className="text-sm text-neutral-700 dark:text-neutral-300">{t("loadError")}</p>
        <button
          type="button"
          onClick={onRetry}
          className="cursor-pointer text-sm font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300"
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
      <p className="text-sm font-semibold text-neutral-700 tabular-nums dark:text-neutral-300">
        {t("count", { count })}
      </p>
    </div>
  );
}

const FIELD_CLASS_NAME =
  "h-10 rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-[0_1px_2px_rgba(15,23,42,0.05)] outline-none placeholder:text-neutral-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 dark:border-white/15 dark:bg-neutral-900 dark:text-neutral-100 dark:shadow-none";

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
      className={`${FIELD_CLASS_NAME} w-full cursor-pointer pr-8 font-medium sm:w-auto sm:max-w-sm`}
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
  return <article className={`${ADMIN_PANEL_CLASS} p-5 sm:p-6`}>{children}</article>;
}

export function AdminSectionTitle({ children, count }: { children: ReactNode; count?: number }) {
  return (
    <h2 className="mb-3 flex items-baseline gap-2 text-base font-bold text-neutral-900 dark:text-white">
      {children}
      {count === undefined ? null : (
        <span className="text-sm font-semibold text-neutral-400 tabular-nums">{count}</span>
      )}
    </h2>
  );
}

export function AdminTimestamp({ value }: { value: string }) {
  const locale = useLocale();

  return (
    <time
      dateTime={value}
      className="shrink-0 text-xs font-medium text-neutral-500 tabular-nums dark:text-neutral-400"
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
      ? "bg-orange-100 text-orange-800 ring-orange-600/20 dark:bg-orange-500/12 dark:text-orange-300 dark:ring-orange-400/30"
      : "bg-neutral-100 text-neutral-700 ring-neutral-300/70 dark:bg-white/6 dark:text-neutral-300 dark:ring-white/10";

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${toneClassName}`}
    >
      {children}
    </span>
  );
}

export function AdminScoreChip({ label, value }: { label: string; value: number | null }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${SCORE_CHIP_CLASS[getScoreTone(value)]}`}
    >
      {label}
      <span className="text-sm leading-none font-black tabular-nums">
        {value === null ? "–" : value}
      </span>
    </span>
  );
}

export function AdminStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className={`${ADMIN_PANEL_CLASS} flex flex-col gap-2 p-4`}>
      <span className={ADMIN_LABEL_CLASS}>{label}</span>
      <span className="text-4xl leading-none font-black text-neutral-900 tabular-nums dark:text-white">
        {value}
      </span>
      {hint ? (
        <span className="mt-auto text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export function AdminScoreStat({
  label,
  value,
  hint,
  scaleLabel,
}: {
  label: string;
  value: number | null;
  hint: string;
  scaleLabel: string;
}) {
  const tone = getScoreTone(value);
  const percent = value === null ? 0 : Math.max(0, Math.min(100, (value / MAX_SCORE) * 100));

  return (
    <div className={`${ADMIN_PANEL_CLASS} flex flex-col gap-2 p-4`}>
      <span className={ADMIN_LABEL_CLASS}>{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span
          className={`text-4xl leading-none font-black tabular-nums ${
            value === null
              ? "text-neutral-300 dark:text-neutral-600"
              : "text-neutral-900 dark:text-white"
          }`}
        >
          {value === null ? "–" : value.toFixed(1)}
        </span>
        {value === null ? null : (
          <span className="text-sm font-semibold text-neutral-400">{scaleLabel}</span>
        )}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10">
        <div
          className={`h-full rounded-full ${SCORE_BAR_CLASS[tone]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{hint}</span>
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
    <section className={`${ADMIN_PANEL_CLASS} p-5`}>
      <h3 className={`${ADMIN_LABEL_CLASS} mb-4`}>{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{t("noAnswer")}</p>
      ) : (
        <ul className="flex flex-col gap-3.5">
          {rows.map((row, index) => {
            const percent = total > 0 ? Math.round((row.count / total) * 100) : 0;

            return (
              <li key={row.key} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span
                    className={
                      index === 0
                        ? "font-semibold text-neutral-900 dark:text-white"
                        : "text-neutral-800 dark:text-neutral-200"
                    }
                  >
                    {row.label}
                  </span>
                  <span className="shrink-0 font-bold text-neutral-900 tabular-nums dark:text-white">
                    {row.count}
                    <span className="ml-1.5 inline-block w-9 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                      {percent}%
                    </span>
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-rose-500"
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
    <div className="flex flex-col items-start gap-1.5">
      <p className="text-[0.9375rem] leading-relaxed whitespace-pre-wrap text-neutral-900 dark:text-neutral-100">
        {visibleText}
      </p>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="cursor-pointer text-xs font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300"
        >
          {expanded ? t("showLess") : t("showMore")}
        </button>
      ) : null}
    </div>
  );
}

export function AdminField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-4">
      <dt className={`${ADMIN_LABEL_CLASS} sm:pt-0.5`}>{label}</dt>
      <dd className="min-w-0 text-sm leading-relaxed text-neutral-900 dark:text-neutral-100">
        {children}
      </dd>
    </div>
  );
}

export function AdminMailLink({ email, subject }: { email: string; subject?: string }) {
  const t = useTranslations("admin.common");
  const href = subject
    ? `mailto:${email}?subject=${encodeURIComponent(`Re: ${subject}`)}`
    : `mailto:${email}`;

  return (
    <a
      href={href}
      className="inline-flex h-9 max-w-full items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-900 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-white/15 dark:bg-white/5 dark:text-neutral-100 dark:shadow-none dark:hover:border-rose-400/40 dark:hover:bg-rose-500/10 dark:hover:text-rose-200"
    >
      <span className="shrink-0">{t("reply")}</span>
      <span className="truncate font-medium text-neutral-500 dark:text-neutral-400">{email}</span>
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
