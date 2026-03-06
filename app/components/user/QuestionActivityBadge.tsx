"use client";

import { useTranslations } from "next-intl";

import { QuestionMarkCircleIcon } from "@/components/shared/Icons";
import {
  getQuestionActivityBadge,
  type QuestionActivityLevel,
} from "@/lib/config/question-activity";

interface QuestionActivityBadgeProps {
  level: QuestionActivityLevel | null;
}

export function QuestionActivityBadge({ level }: QuestionActivityBadgeProps) {
  const t = useTranslations("account.userProfile.questionActivity");
  const badge = getQuestionActivityBadge(level);

  if (!badge) {
    return null;
  }

  return (
    <div className="group relative">
      <div
        className={`absolute -inset-1 rounded-full opacity-70 blur-md transition-opacity duration-300 group-hover:opacity-100 ${badge.appearance.glowClassName}`}
      />
      <div className="relative flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-4 py-2 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
        <QuestionMarkCircleIcon className={`h-4 w-4 ${badge.appearance.iconClassName}`} />
        <span
          className={`bg-gradient-to-r bg-clip-text text-sm font-bold tracking-wide text-transparent uppercase ${badge.appearance.labelClassName}`}
        >
          {t(badge.titleKey)}
        </span>
      </div>
    </div>
  );
}
