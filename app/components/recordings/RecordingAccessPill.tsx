"use client";

import { useTranslations } from "next-intl";

import { GuildIcon, LogInIcon } from "@/components/shared/Icons";
import { ENGAGEMENT_BRANDING, getAccessPillClasses } from "@/lib/config/engagement-branding";
import { getRecordingAccessState, type RecordingAccessPolicy } from "@/lib/recordings/early-access";

export function RecordingAccessPill({
  access,
  className = "",
}: {
  access?: RecordingAccessPolicy;
  className?: string;
}) {
  const t = useTranslations("recordings");
  const { isEarlyAccess, isRestricted, requiredMembershipTier } = getRecordingAccessState(access);

  if (!isRestricted) {
    return null;
  }

  const isSignInAccess = requiredMembershipTier === 0;
  const stateLabel = isEarlyAccess ? t("earlyAccessShort") : t("accessLockedShort");

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] uppercase shadow-sm ${getAccessPillClasses(
        isSignInAccess,
      )} ${className}`}
    >
      <span className={ENGAGEMENT_BRANDING.access.classes.chip}>{stateLabel}</span>
      <span className="h-3 w-px rounded-full bg-black/20 dark:bg-white/25" />
      <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black/15 dark:bg-white/20">
        {isSignInAccess ? (
          <LogInIcon className="h-2.5 w-2.5" />
        ) : (
          <GuildIcon className="h-2.5 w-2.5" />
        )}
      </span>
    </div>
  );
}
