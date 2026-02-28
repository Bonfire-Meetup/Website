"use client";

import { useTranslations } from "next-intl";

import { GuildIcon, MicIcon, UsersIcon } from "@/components/shared/Icons";
import {
  hasMembership,
  MEMBERSHIP_TIER_LABELS,
  type MembershipTier,
} from "@/lib/config/membership";
import { USER_ROLES } from "@/lib/config/roles";

interface RoleBadgesProps {
  roles: string[];
  membershipTier?: number | null;
}

const roleConfig = {
  [USER_ROLES.CREW]: {
    labelKey: "crew" as const,
    gradient:
      "from-blue-500 via-indigo-500 to-rose-500 dark:from-blue-400 dark:via-indigo-400 dark:to-rose-400",
    glow: "rgba(99, 102, 241, 0.4)",
    iconColor: "text-indigo-500 dark:text-indigo-400",
    icon: <UsersIcon className="h-4 w-4" />,
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

export function RoleBadges({ roles, membershipTier }: RoleBadgesProps) {
  const t = useTranslations("account.userProfile.roles");
  const displayRoles = roles.filter((role) => role in roleConfig);
  const hasGuild = hasMembership(membershipTier);

  if (displayRoles.length === 0 && !hasGuild) {
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
      {hasGuild && membershipTier && (
        <div className="group relative">
          <div
            className="absolute -inset-2 animate-pulse rounded-full opacity-40 blur-xl"
            style={{
              background:
                "radial-gradient(circle, rgba(251, 146, 60, 0.5) 0%, rgba(244, 63, 94, 0.3) 50%, transparent 70%)",
            }}
          />
          <div
            className="absolute -inset-1 rounded-full opacity-70 blur-md transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(135deg, rgba(251, 146, 60, 0.6), rgba(244, 63, 94, 0.4), rgba(251, 146, 60, 0.5))",
            }}
          />
          <div className="relative flex items-center gap-2 rounded-full border border-amber-400/30 bg-white/80 px-4 py-2 shadow-lg shadow-amber-500/15 backdrop-blur-sm dark:border-amber-400/40 dark:bg-neutral-900/80 dark:shadow-amber-500/20">
            <GuildIcon className="h-4 w-4 text-amber-500 dark:text-amber-400" />
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-sm font-bold tracking-wide text-transparent uppercase dark:from-amber-300 dark:via-orange-300 dark:to-rose-300">
              {MEMBERSHIP_TIER_LABELS[membershipTier as MembershipTier] ??
                t("tierFallback", { tier: membershipTier })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
