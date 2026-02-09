"use client";

import { useTranslations } from "next-intl";

import { BoltIcon } from "@/components/shared/Icons";
import { getBoostTier } from "@/lib/config/boost-rewards";

interface BoostTitleBadgeProps {
  boostCount: number;
  boostStreak?: number;
}

export function BoostTitleBadge({ boostCount, boostStreak = 0 }: BoostTitleBadgeProps) {
  const t = useTranslations("account.userProfile.boostRewards.titles");

  const tier = getBoostTier(boostCount);
  const hasActiveStreak = boostStreak > 0;

  if (!tier) {
    return null;
  }

  return (
    <div className="group relative">
      <div
        className={`absolute -inset-1 rounded-full blur-md transition-opacity duration-300 group-hover:opacity-100 ${
          hasActiveStreak ? "animate-pulse opacity-50" : "opacity-40"
        }`}
        style={{
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(34, 197, 94, 0.2))",
        }}
      />
      <div
        className={`relative flex items-center gap-2 rounded-full border bg-white/80 px-4 py-2 backdrop-blur-sm transition-all duration-300 dark:bg-neutral-900/80 ${
          hasActiveStreak
            ? "border-emerald-500/20 dark:border-emerald-500/25"
            : "border-neutral-200 dark:border-white/10"
        }`}
      >
        <BoltIcon className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
        <span
          className={`bg-gradient-to-r ${tier.gradient} bg-clip-text text-sm font-bold tracking-wide text-transparent uppercase`}
        >
          {t(tier.titleKey)}
        </span>
      </div>
    </div>
  );
}
