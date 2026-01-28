"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { UserAvatar } from "@/components/user/UserAvatar";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { ProfileShareButton } from "./ProfileShareButton";
import { RoleBadges } from "./RoleBadges";

interface UserData {
  publicId: string;
  name: string | null;
  memberSince: string;
  roles: string[];
  membershipTier: number | null;
  isMember: boolean;
}

interface UserProfileContentProps {
  user: UserData;
  boostedVideosSlot: ReactNode;
  checkedInEventsSlot: ReactNode;
}

export function UserProfileContent({
  user,
  boostedVideosSlot,
  checkedInEventsSlot,
}: UserProfileContentProps) {
  const t = useTranslations("account.userProfile");

  const profileUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ""}${PAGE_ROUTES.USER(user.publicId)}`;
  const shareText = user.name ? `${user.name}'s profile` : "Community member profile";

  return (
    <main className="gradient-bg min-h-screen pb-20">
      <div className="relative overflow-hidden px-4 pt-28 sm:px-6 sm:pt-32 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-brand-glow-5),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,var(--color-brand-glow-6),transparent_60%)]" />

        <div className="relative mx-auto max-w-4xl">
          <div
            className={`relative mb-8 overflow-hidden rounded-3xl border bg-white/95 shadow-2xl backdrop-blur-xl dark:bg-neutral-900/95 ${
              user.isMember
                ? "border-red-300/50 shadow-red-500/20 dark:border-red-500/30"
                : "border-neutral-200/60 dark:border-white/10"
            }`}
          >
            <div
              className={`absolute top-0 left-0 h-32 w-full bg-gradient-to-br ${
                user.isMember
                  ? "from-red-500/25 via-rose-500/20 to-red-400/15 dark:from-red-500/15 dark:via-rose-500/10 dark:to-red-400/10"
                  : "from-brand-500/20 dark:from-brand-500/10 via-rose-500/20 to-orange-500/20 dark:via-rose-500/10 dark:to-orange-500/10"
              }`}
            />

            <div className="absolute top-4 right-4 z-10 sm:top-6 sm:right-6">
              <ProfileShareButton shareUrl={profileUrl} shareText={shareText} />
            </div>

            <div className="relative px-6 pt-6 pb-8 sm:px-10 sm:pt-8 sm:pb-10">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div
                    className={`absolute inset-0 -m-2 rounded-full bg-gradient-to-br blur-xl ${
                      user.isMember
                        ? "from-red-400/35 via-rose-400/30 to-red-300/25"
                        : "from-brand-400/30 via-rose-400/30 to-orange-400/30"
                    }`}
                  />
                  <UserAvatar
                    avatarSeed={user.publicId}
                    size={120}
                    name={user.name}
                    className="relative border-4 border-white shadow-2xl dark:border-neutral-900"
                  />
                </div>

                <div className="w-full space-y-4">
                  {user.name && (
                    <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
                      {user.name}
                    </h1>
                  )}

                  <RoleBadges
                    roles={user.roles}
                    membershipTier={user.isMember ? user.membershipTier : null}
                  />

                  <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center">
                    <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-200/70 bg-neutral-50/80 px-4 py-2 text-sm font-medium text-neutral-700 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
                      <svg
                        className="text-brand-500 dark:text-brand-400 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>
                        {t("memberSince")} {user.memberSince}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {boostedVideosSlot}

          <div className="mt-8">{checkedInEventsSlot}</div>
        </div>
      </div>
    </main>
  );
}

export function PrivateProfileContent() {
  const t = useTranslations("account.userProfile");

  return (
    <main className="gradient-bg min-h-screen px-4 pt-32 pb-20">
      <div className="mx-auto max-w-2xl">
        <div className="relative overflow-hidden rounded-3xl border border-neutral-200/60 bg-white/90 p-10 text-center shadow-2xl shadow-black/5 backdrop-blur-md sm:p-12 dark:border-white/10 dark:bg-neutral-900/90 dark:shadow-black/25">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,var(--color-brand-glow-3)_50%,transparent_100%)] dark:bg-[linear-gradient(to_right,transparent_0%,var(--color-brand-glow-4)_50%,transparent_100%)]" />

          <div className="relative">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 shadow-lg dark:from-neutral-800 dark:to-neutral-700">
              <svg
                className="h-10 w-10 text-neutral-500 dark:text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            <h1 className="mb-3 text-2xl font-black text-neutral-900 sm:text-3xl dark:text-white">
              {t("private.title")}
            </h1>
            <p className="text-base text-neutral-600 dark:text-neutral-400">
              {t("private.message")}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
