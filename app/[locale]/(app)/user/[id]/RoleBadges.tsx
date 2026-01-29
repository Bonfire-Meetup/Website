"use client";

import { useTranslations } from "next-intl";

import { GuildIcon } from "@/components/shared/icons";
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
    gradient: "from-blue-400 via-indigo-400 to-violet-400",
    glow: "rgba(99, 102, 241, 0.4)",
    iconColor: "text-indigo-400",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
  },
  [USER_ROLES.SPEAKER]: {
    labelKey: "speaker" as const,
    gradient: "from-orange-400 via-rose-400 to-pink-400",
    glow: "rgba(251, 113, 133, 0.4)",
    iconColor: "text-rose-400",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
          clipRule="evenodd"
        />
      </svg>
    ),
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
            <div className="relative flex items-center gap-2 rounded-full border border-white/10 bg-neutral-900/80 px-4 py-2 backdrop-blur-sm">
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
            className="absolute -inset-1 rounded-full opacity-60 blur-md transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(135deg, rgba(251, 146, 60, 0.5), rgba(244, 63, 94, 0.3))",
            }}
          />
          <div className="relative flex items-center gap-2 rounded-full border border-amber-500/20 bg-neutral-900/80 px-4 py-2 backdrop-blur-sm">
            <GuildIcon className="h-4 w-4 text-amber-400" />
            <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-sm font-bold tracking-wide text-transparent uppercase">
              {MEMBERSHIP_TIER_LABELS[membershipTier as MembershipTier] ??
                t("tierFallback", { tier: membershipTier })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
