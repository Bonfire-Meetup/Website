"use client";

import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useEffect, useState } from "react";

import { BoltIcon } from "@/components/shared/Icons";
import { UserAvatar } from "@/components/user/UserAvatar";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { makeAvatarSeedFromPublicId } from "@/lib/utils/hash-rng";

import { BoostTitleBadge } from "./BoostTitleBadge";
import { ProfileShareButton } from "./ProfileShareButton";
import { RoleBadges } from "./RoleBadges";

interface UserData {
  publicId: string;
  name: string | null;
  memberSince: string;
  roles: string[];
  membershipTier: number | null;
  isMember: boolean;
  boostCount: number;
  boostsThisMonth: number;
  boostStreak: number;
}

interface UserProfileStats {
  lastBoostedAt: string | null;
  lastCheckedInAt: string | null;
}

interface UserProfileContentProps {
  user: UserData;
  stats: UserProfileStats;
  upcomingRsvpsSlot: ReactNode;
  boostedVideosSlot: ReactNode;
  checkedInEventsSlot: ReactNode;
}

export function UserProfileContent({
  user,
  stats,
  upcomingRsvpsSlot,
  boostedVideosSlot,
  checkedInEventsSlot,
}: UserProfileContentProps) {
  const t = useTranslations("account.userProfile");
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const profileUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ""}${PAGE_ROUTES.USER(user.publicId)}`;
  const shareText = user.name ? t("shareText", { name: user.name }) : t("shareTextAnonymous");
  const lastBoostedDate = stats.lastBoostedAt
    ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(
        new Date(stats.lastBoostedAt),
      )
    : null;
  const lastCheckedInDate = stats.lastCheckedInAt
    ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(
        new Date(stats.lastCheckedInAt),
      )
    : null;
  const RECENT_ACTIVITY_WINDOW_DAYS = 30;
  const now = Date.now();
  const recentWindowMs = RECENT_ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const hasRecentBoost =
    stats.lastBoostedAt !== null && now - new Date(stats.lastBoostedAt).getTime() <= recentWindowMs;
  const hasRecentCheckIn =
    stats.lastCheckedInAt !== null &&
    now - new Date(stats.lastCheckedInAt).getTime() <= recentWindowMs;
  const isRecentlyActive = hasRecentBoost || hasRecentCheckIn;

  const handleCopyId = async () => {
    await copyToClipboard(user.publicId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(217,70,239,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(217,70,239,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_70%_20%,rgba(249,115,22,0.05),transparent)] dark:bg-[radial-gradient(ellipse_60%_40%_at_70%_20%,rgba(249,115,22,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_30%_80%,rgba(139,92,246,0.04),transparent)] dark:bg-[radial-gradient(ellipse_50%_30%_at_30%_80%,rgba(139,92,246,0.08),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative px-4 pt-24 pb-20 sm:px-6 sm:pt-32 lg:px-8 lg:pt-40">
        <div className="mx-auto max-w-5xl">
          <div className="relative mb-12 sm:mb-16">
            <div className="flex flex-col items-center lg:flex-row lg:items-start lg:gap-12">
              <div className="relative mb-8 lg:mb-0">
                <div className="absolute -inset-8 rounded-full bg-gradient-to-br from-fuchsia-500/10 via-orange-500/8 to-violet-500/10 blur-2xl dark:from-fuchsia-500/20 dark:via-orange-500/15 dark:to-violet-500/20" />
                <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-fuchsia-500/15 via-orange-500/12 to-violet-500/15 blur-xl dark:from-fuchsia-500/30 dark:via-orange-500/25 dark:to-violet-500/30" />
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-fuchsia-400 via-orange-400 to-violet-400 opacity-60 dark:opacity-80" />
                  <UserAvatar
                    avatarSeed={makeAvatarSeedFromPublicId(user.publicId)}
                    size={180}
                    name={user.name}
                    animated={!prefersReducedMotion}
                    className={`relative ring-4 ring-neutral-50 dark:ring-neutral-950 ${
                      user.boostCount >= 10 ? "ring-emerald-500/30 dark:ring-emerald-500/40" : ""
                    } ${
                      user.boostCount >= 25
                        ? "ring-8 ring-emerald-500/50 dark:ring-emerald-500/60"
                        : ""
                    } ${
                      user.boostCount >= 50
                        ? "animate-pulse ring-8 ring-emerald-400/60 ring-orange-400/40 dark:ring-emerald-400/70 dark:ring-orange-400/50"
                        : ""
                    }`}
                  />
                </div>
                {user.isMember && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 blur-md" />
                      <div className="relative flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-4 py-1.5 text-xs font-black tracking-widest text-neutral-950 uppercase shadow-2xl">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                        <span>{t("memberBadge")}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:pt-4 lg:text-left">
                <div className="mb-4 flex items-baseline gap-2">
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs font-medium tracking-wide text-neutral-500 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
                  >
                    {copied ? (
                      <svg
                        className="h-3 w-3 shrink-0 -translate-y-px text-emerald-500 dark:text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg
                        className="h-3 w-3 shrink-0 -translate-y-px"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                        />
                      </svg>
                    )}
                    <span className={copied ? "text-emerald-500 dark:text-emerald-400" : ""}>
                      {user.publicId}
                    </span>
                  </button>
                  <ProfileShareButton shareUrl={profileUrl} shareText={shareText} />
                </div>

                {user.name ? (
                  <h1 className="mb-5 text-4xl font-black tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white">
                    {user.name}
                  </h1>
                ) : (
                  <h1 className="mb-5 text-4xl font-black tracking-tight text-neutral-400 sm:text-5xl lg:text-6xl">
                    {t("anonymousMember")}
                  </h1>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <RoleBadges
                    roles={user.roles}
                    membershipTier={user.isMember ? user.membershipTier : null}
                  />
                  <BoostTitleBadge boostCount={user.boostCount} boostStreak={user.boostStreak} />
                </div>

                <div className="mt-6 w-full max-w-md">
                  <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-3 py-1.5 text-xs text-neutral-600 dark:border-white/10 dark:bg-neutral-900/70 dark:text-neutral-300">
                    <svg
                      className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.75}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                      />
                    </svg>
                    <span>
                      {t("memberSince")}{" "}
                      <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                        {user.memberSince}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section
            className="mb-8 rounded-2xl border border-neutral-200 bg-white/75 px-4 py-4 backdrop-blur-sm sm:px-6 sm:py-5 dark:border-white/10 dark:bg-neutral-900/60"
            aria-labelledby="profile-activity-heading"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1 space-y-3 text-[11px] text-neutral-500 dark:text-neutral-400">
                <div className="flex items-start justify-between gap-3 sm:block">
                  <p id="profile-activity-heading" className="font-semibold uppercase">
                    {t("activity.title")}
                  </p>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold sm:hidden ${
                      isRecentlyActive
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "bg-neutral-500/15 text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {isRecentlyActive ? t("activity.activeStatus") : t("activity.quietStatus")}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <p>
                    {t("activity.lastBoosted", { date: lastBoostedDate ?? t("activity.none") })}
                  </p>
                  <p>
                    {t("activity.lastCheckedIn", {
                      date: lastCheckedInDate ?? t("activity.none"),
                    })}
                  </p>
                  {user.boostCount > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-2.5">
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">
                        <BoltIcon className="h-3 w-3 shrink-0" />
                        <span>
                          <span className="font-bold">{user.boostCount}</span>{" "}
                          {t("activity.totalBoostsLabel", { count: user.boostCount })}
                        </span>
                      </div>
                      {user.boostsThisMonth > 0 && (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-[10px] font-semibold text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-300">
                          <svg
                            className="h-3 w-3 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                            />
                          </svg>
                          <span>
                            <span className="font-bold">{user.boostsThisMonth}</span>{" "}
                            {t("activity.boostsThisMonthLabel", { count: user.boostsThisMonth })}
                          </span>
                        </div>
                      )}
                      {user.boostStreak > 0 && (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[10px] font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300">
                          <svg
                            className="h-3 w-3 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
                            />
                          </svg>
                          <span>
                            <span className="font-bold">{user.boostStreak}</span>{" "}
                            {t("activity.boostStreakLabel", { count: user.boostStreak })}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <span
                className={`hidden items-center self-start rounded-full px-2.5 py-1 text-[10px] font-semibold sm:inline-flex ${
                  isRecentlyActive
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "bg-neutral-500/15 text-neutral-700 dark:text-neutral-300"
                }`}
              >
                {isRecentlyActive ? t("activity.activeStatus") : t("activity.quietStatus")}
              </span>
            </div>
          </section>

          <div className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
              {upcomingRsvpsSlot}
              {checkedInEventsSlot}
            </div>
            {boostedVideosSlot}
          </div>
        </div>
      </div>
    </main>
  );
}

export function PrivateProfileContent() {
  const t = useTranslations("account.userProfile");

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(100,100,100,0.04),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(100,100,100,0.08),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-20">
        <div className="w-full max-w-md text-center">
          <div className="relative mx-auto mb-8 h-24 w-24">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neutral-300 to-neutral-400 opacity-30 blur-xl dark:from-neutral-700 dark:to-neutral-800 dark:opacity-50" />
            <div className="relative flex h-full w-full items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-100/90 dark:border-neutral-800 dark:bg-neutral-900/90">
              <svg
                className="h-12 w-12 text-neutral-400 dark:text-neutral-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
          </div>

          <h1 className="mb-3 text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
            {t("private.title")}
          </h1>
          <p className="text-base text-neutral-500">{t("private.message")}</p>
        </div>
      </div>
    </main>
  );
}
