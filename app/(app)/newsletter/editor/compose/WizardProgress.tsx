"use client";

import type { WizardStep } from "./types";
import { useTranslations } from "next-intl";

interface WizardProgressProps {
  currentStep: WizardStep;
  steps: WizardStep[];
}

const STEP_LABELS: Record<WizardStep, string> = {
  editor: "editor",
  audience: "audience",
  confirmation: "confirmation",
};

export function WizardProgress({ currentStep, steps }: WizardProgressProps) {
  const t = useTranslations("newsletterEditor");
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center gap-2">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isLast = index === steps.length - 1;

          return (
            <div key={step} className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-gradient-to-br from-fuchsia-700 via-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25"
                    : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400"
                }`}
              >
                {isCompleted ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`ml-2 hidden text-sm font-medium sm:block ${
                  isActive
                    ? "text-fuchsia-600 dark:text-fuchsia-400"
                    : isCompleted
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-neutral-500 dark:text-neutral-500"
                }`}
              >
                {t(`step_${STEP_LABELS[step]}`)}
              </span>
              {!isLast && (
                <div
                  className={`mx-3 h-0.5 w-8 sm:w-12 ${
                    isCompleted
                      ? "bg-gradient-to-r from-fuchsia-500 via-orange-500 to-red-500"
                      : "bg-neutral-200 dark:bg-neutral-700"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
