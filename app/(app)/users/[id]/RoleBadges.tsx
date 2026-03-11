"use client";

import { useTranslations } from "next-intl";

import { CrewIcon, MicIcon } from "@/components/shared/Icons";
import { QuestionActivityBadge } from "@/components/user/QuestionActivityBadge";
import { hasMembership } from "@/lib/config/membership";
import type { QuestionActivityLevel } from "@/lib/config/question-activity";
import { USER_ROLES } from "@/lib/config/roles";

interface RoleBadgesProps {
  roles: string[];
  membershipTier?: number | null;
  questionActivityLevel?: QuestionActivityLevel | null;
}

const roleConfig = {
  [USER_ROLES.CREW]: {
    labelKey: "crew" as const,
    gradient:
      "from-blue-500 via-indigo-500 to-rose-500 dark:from-blue-400 dark:via-indigo-400 dark:to-rose-400",
    glow: "rgba(99, 102, 241, 0.4)",
    iconColor: "text-indigo-500 dark:text-indigo-400",
    icon: <CrewIcon className="h-4 w-4" />,
  },
  [USER_ROLES.SPEAKER]: {
    labelKey: "speaker" as const,
    gradient:
      "from-orange-500 via-rose-500 to-pink-500 dark:from-orange-400 dark:via-rose-400 dark:to-pink-400",
    glow: "rgba(251, 113, 133, 0.4)",
    iconColor: "text-rose-500 dark:text-rose-400",
    icon: <MicIcon className="h-4 w-4" />,
  },
} as const;

export function RoleBadges({
  roles,
  membershipTier,
  questionActivityLevel = null,
}: RoleBadgesProps) {
  const t = useTranslations("account.userProfile.roles");
  const displayRoles = roles.filter((role) => role in roleConfig);
  const hasGuild = hasMembership(membershipTier);

  if (displayRoles.length === 0 && !hasGuild && questionActivityLevel === null) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
      {displayRoles.map((role) => {
        const config = roleConfig[role as keyof typeof roleConfig];
        return (
          <div key={role} className="group relative">
            <div
              className="absolute -inset-1 rounded-full opacity-60 blur-md transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: `linear-gradient(135deg, ${config.glow}, transparent)` }}
            />
            <div className="relative flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-4 py-2 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
              <span className={config.iconColor}>{config.icon}</span>
              <span
                className={`bg-gradient-to-r ${config.gradient} bg-clip-text text-sm font-bold tracking-wide text-transparent uppercase`}
              >
                {t(config.labelKey)}
              </span>
            </div>
          </div>
        );
      })}
      <QuestionActivityBadge level={questionActivityLevel} />
    </div>
  );
}
