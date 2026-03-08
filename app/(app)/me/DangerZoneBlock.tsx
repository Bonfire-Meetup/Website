"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface DangerZoneBlockProps {
  status: string | null;
  error: string | null;
  step: "idle" | "confirm" | "verify" | "done";
  intentChecked: boolean;
  loading: boolean;
  code: string;
  onIntentChange: (checked: boolean) => void;
  onProceed: () => void;
  onSendCode: () => void;
  onCodeChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DangerZoneBlock({
  status,
  error,
  step,
  intentChecked,
  loading,
  code,
  onIntentChange,
  onProceed,
  onSendCode,
  onCodeChange,
  onConfirm,
  onCancel,
}: DangerZoneBlockProps) {
  const t = useTranslations("account.delete");
  const stepIndex = { idle: 0, confirm: 1, verify: 2, done: 3 }[step];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
        {t("dangerZone")}
      </h2>
      <div className="overflow-hidden rounded-2xl border border-rose-200/70 bg-linear-to-br from-white via-white to-rose-50/65 shadow-[0_16px_40px_-28px_rgba(225,29,72,0.26)] dark:border-rose-500/20 dark:from-white/8 dark:via-white/5 dark:to-rose-500/[0.06] dark:shadow-none">
        <div className="flex border-b border-rose-200/70 bg-white/70 backdrop-blur-sm dark:border-rose-500/15 dark:bg-white/[0.03]">
          {[t("steps.intent"), t("steps.send"), t("steps.verify")].map((label, i) => (
            <div
              key={label}
              className={`flex flex-1 items-center justify-center gap-2 px-3 py-3 text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors ${
                i <= stepIndex
                  ? "bg-rose-50/80 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                  : "text-neutral-400 dark:text-neutral-500"
              } ${i < 2 ? "border-r border-rose-200/70 dark:border-rose-500/15" : ""}`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  i < stepIndex
                    ? "bg-rose-500 text-white shadow-sm shadow-rose-200/80 dark:bg-rose-400 dark:shadow-none"
                    : i === stepIndex
                      ? "bg-rose-500 text-white shadow-sm shadow-rose-200/80 dark:bg-rose-400 dark:shadow-none"
                      : "bg-neutral-200 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"
                }`}
              >
                {i < stepIndex ? "✓" : i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </div>
          ))}
        </div>

        <div className="p-5">
          <div className="mb-5">
            <h3 className="text-lg font-bold tracking-tight text-neutral-950 dark:text-white">
              {t("title")}
            </h3>
            <p className="mt-1 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
              {t("body")}
            </p>
          </div>

          {status && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              {status}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          )}

          {step === "verify" ? (
            <div className="rounded-2xl border border-rose-200/70 bg-white/60 p-4 dark:border-rose-500/15 dark:bg-white/[0.03]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <label className="block text-xs tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400">
                    {t("codeLabel")}
                  </label>
                  <input
                    value={code}
                    onChange={(event) => onCodeChange(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-center text-base tracking-[0.35em] text-neutral-900 transition outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-300/40 sm:w-48 sm:text-lg sm:tracking-[0.5em] dark:border-white/10 dark:bg-white/5 dark:text-neutral-100"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                  />
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="cursor-pointer rounded-xl border border-neutral-200/80 bg-white/80 px-3 py-2 text-sm text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-700 sm:border-transparent sm:bg-transparent dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:text-neutral-200"
                  >
                    {t("cancel")}
                  </button>
                  <Button
                    variant="plain"
                    size="sm"
                    disabled={loading}
                    onClick={onConfirm}
                    className="w-full rounded-xl bg-rose-600 text-white shadow-sm shadow-rose-200/80 hover:bg-rose-700 sm:w-auto dark:shadow-none"
                  >
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      {loading && <LoadingSpinner size="sm" />}
                      {loading ? t("confirming") : t("confirm")}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          ) : step === "confirm" ? (
            <div className="rounded-2xl border border-rose-200/70 bg-white/60 p-4 dark:border-rose-500/15 dark:bg-white/[0.03]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                  {t("sendIntro")}
                </p>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="cursor-pointer rounded-xl border border-neutral-200/80 bg-white/80 px-3 py-2 text-sm text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-700 sm:border-transparent sm:bg-transparent dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:text-neutral-200"
                  >
                    {t("cancel")}
                  </button>
                  <Button
                    variant="plain"
                    size="sm"
                    disabled={loading}
                    onClick={onSendCode}
                    className="w-full rounded-xl bg-rose-600 text-white shadow-sm shadow-rose-200/80 hover:bg-rose-700 sm:w-auto dark:shadow-none"
                  >
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      {loading && <LoadingSpinner size="sm" />}
                      {loading ? t("sendingCode") : t("sendCode")}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          ) : step === "done" ? null : (
            <div className="rounded-2xl border border-rose-200/70 bg-white/60 p-4 dark:border-rose-500/15 dark:bg-white/[0.03]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex cursor-pointer items-start gap-3 text-sm text-neutral-700 sm:items-center dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={intentChecked}
                    onChange={(event) => onIntentChange(event.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-neutral-300 text-rose-600 focus:ring-rose-300/40 sm:mt-0 dark:border-neutral-600 dark:bg-white/5"
                  />
                  <span>{t("intentLabel")}</span>
                </label>
                <Button
                  variant="plain"
                  size="sm"
                  disabled={loading || !intentChecked}
                  onClick={onProceed}
                  className="w-full rounded-xl bg-rose-600 text-white shadow-sm shadow-rose-200/80 hover:bg-rose-700 disabled:opacity-40 sm:w-auto dark:shadow-none"
                >
                  {t("proceed")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
