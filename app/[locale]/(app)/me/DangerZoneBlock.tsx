"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";

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
  const stepIndex = step === "idle" ? 0 : step === "confirm" ? 1 : step === "verify" ? 2 : 3;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
        {t("dangerZone")}
      </h2>
      <div className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/70 dark:border-white/10 dark:bg-white/5">
        <div className="flex border-b border-neutral-200/70 dark:border-white/10">
          {[t("steps.intent"), t("steps.send"), t("steps.verify")].map((label, i) => (
            <div
              key={label}
              className={`flex flex-1 items-center justify-center gap-2 px-3 py-3 text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors ${
                i <= stepIndex
                  ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
                  : "text-neutral-400 dark:text-neutral-500"
              } ${i < 2 ? "border-r border-neutral-200/70 dark:border-white/10" : ""}`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  i < stepIndex
                    ? "bg-rose-500 text-white dark:bg-rose-400"
                    : i === stepIndex
                      ? "bg-rose-500 text-white dark:bg-rose-400"
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
          <div className="mb-4">
            <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
              {t("title")}
            </h3>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t("body")}</p>
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <label className="block text-xs tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400">
                  {t("codeLabel")}
                </label>
                <input
                  value={code}
                  onChange={(event) => onCodeChange(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-center text-lg tracking-[0.5em] text-neutral-900 transition outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-300/40 sm:w-48 dark:border-white/10 dark:bg-white/5 dark:text-neutral-100"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="cursor-pointer px-3 py-2 text-sm text-neutral-500 transition hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                  {t("cancel")}
                </button>
                <Button
                  variant="plain"
                  size="sm"
                  disabled={loading}
                  onClick={onConfirm}
                  className="rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                >
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    {loading && (
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className="opacity-70"
                          fill="currentColor"
                          d="M20 12a8 8 0 0 1-8 8v-3a5 5 0 0 0 5-5h3z"
                        />
                      </svg>
                    )}
                    {loading ? t("confirming") : t("confirm")}
                  </span>
                </Button>
              </div>
            </div>
          ) : step === "confirm" ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{t("sendIntro")}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="cursor-pointer px-3 py-2 text-sm text-neutral-500 transition hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                  {t("cancel")}
                </button>
                <Button
                  variant="plain"
                  size="sm"
                  disabled={loading}
                  onClick={onSendCode}
                  className="rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                >
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    {loading && (
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className="opacity-70"
                          fill="currentColor"
                          d="M20 12a8 8 0 0 1-8 8v-3a5 5 0 0 0 5-5h3z"
                        />
                      </svg>
                    )}
                    {loading ? t("sendingCode") : t("sendCode")}
                  </span>
                </Button>
              </div>
            </div>
          ) : step === "done" ? null : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex cursor-pointer items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={intentChecked}
                  onChange={(event) => onIntentChange(event.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-neutral-300 text-rose-600 focus:ring-rose-300/40 dark:border-neutral-600 dark:bg-white/5"
                />
                <span>{t("intentLabel")}</span>
              </label>
              <Button
                variant="plain"
                size="sm"
                disabled={loading || !intentChecked}
                onClick={onProceed}
                className="rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-40"
              >
                {t("proceed")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
