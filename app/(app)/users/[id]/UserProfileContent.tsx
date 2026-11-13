"use client";

import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";

import { PROFILE_EYEBROW, PROFILE_SURFACE, PROFILE_TONE } from "@/components/profile/surface";
import {
  BoltIcon,
  CalendarIcon,
  CheckIcon,
  FireIcon,
  GuildIcon,
  HashIcon,
  LockClosedIcon,
} from "@/components/shared/Icons";
import { SpeakerPhoto } from "@/components/speakers/SpeakerPhoto";
import { AccentBar } from "@/components/ui/AccentBar";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/user/UserAvatar";
import { resolveGuildTierPillStyle } from "@/lib/billing/guild-tier-styles";
import { MEMBERSHIP_TIER_LABELS, type MembershipTier } from "@/lib/config/membership";
import type { QuestionActivityLevel } from "@/lib/config/question-activity";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { makeAvatarSeedFromPublicId } from "@/lib/utils/hash-rng";
import { formatLongDateUTC, formatShortDateUTC } from "@/lib/utils/locale";
import { usePrefersReducedMotion } from "@/lib/utils/prefers-reduced-motion";

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
  questionActivityLevel: QuestionActivityLevel | null;
  boostCount: number;
  boostsThisMonth: number;
  boostStreak: number;
}

interface UserProfileStats {
  lastBoostedAt: string | null;
  lastCheckedInAt: string | null;
}

interface SpeakerSummary {
  href: string;
  name: string;
  photoUrl?: string;
  talks: { date: string; eventId: string; eventTitle: string; topic: string }[];
}

function isUpcomingTalk(date: string, nowMs: number) {
  return /^\d{4}-\d{2}-\d{2}$/u.test(date) && new Date(`${date}T23:59:59Z`).getTime() >= nowMs;
}

interface UserProfileContentProps {
  user: UserData;
  speaker?: SpeakerSummary;
  stats: UserProfileStats;
  upcomingRsvpsSlot: ReactNode;
  boostedVideosSlot: ReactNode;
  checkedInEventsSlot: ReactNode;
}

function getValidDateMs(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

export function UserProfileContent({
  user,
  speaker,
  stats,
  upcomingRsvpsSlot,
  boostedVideosSlot,
  checkedInEventsSlot,
}: UserProfileContentProps) {
  const t = useTranslations("account.userProfile");
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const profileUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ""}${PAGE_ROUTES.USER(user.publicId)}`;
  const shareText = user.name ? t("shareText", { name: user.name }) : t("shareTextAnonymous");
  const lastBoostedDate = formatShortDateUTC(stats.lastBoostedAt, locale) || null;
  const lastCheckedInDate = formatShortDateUTC(stats.lastCheckedInAt, locale) || null;
  const RECENT_ACTIVITY_WINDOW_DAYS = 30;
  const now = Date.now();
  const recentWindowMs = RECENT_ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const lastBoostedAtMs = getValidDateMs(stats.lastBoostedAt);
  const lastCheckedInAtMs = getValidDateMs(stats.lastCheckedInAt);
  const hasRecentBoost = lastBoostedAtMs !== null && now - lastBoostedAtMs <= recentWindowMs;
  const hasRecentCheckIn = lastCheckedInAtMs !== null && now - lastCheckedInAtMs <= recentWindowMs;
  const isRecentlyActive = hasRecentBoost || hasRecentCheckIn;
  // The soonest talk still ahead gets the spotlight; otherwise the latest one is shown quietly.
  const nextTalk = speaker?.talks.filter((talk) => isUpcomingTalk(talk.date, now)).at(-1);
  const latestTalk = speaker?.talks[0];
  const membershipLabel =
    user.isMember && user.membershipTier
      ? (MEMBERSHIP_TIER_LABELS[user.membershipTier as MembershipTier] ??
        t("roles.tierFallback", { tier: user.membershipTier }))
      : null;
  const tierPillStyle = resolveGuildTierPillStyle(user.membershipTier);

  const handleCopyId = async () => {
    await copyToClipboard(user.publicId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main className="gradient-bg min-h-screen px-4 pt-28 pb-24 sm:px-6 sm:pt-32 lg:px-8">
      <div>
        <div className="mx-auto max-w-5xl">
          <div className="relative">
            <header className="flex flex-col items-center gap-8 text-center sm:flex-row sm:items-end sm:gap-10 sm:text-left">
              <div className="relative shrink-0">
                <div className="absolute inset-0 translate-y-3 scale-105 rounded-full bg-gradient-to-br from-fuchsia-600/35 via-rose-500/35 to-orange-500/35 blur-2xl" />
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-rose-400 via-orange-400 to-rose-400 opacity-60 dark:opacity-80" />
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
                {membershipLabel && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <div className="group relative">
                      <div
                        className="absolute -inset-2 animate-pulse rounded-full opacity-40 blur-xl"
                        style={{ background: tierPillStyle.glow }}
                      />
                      <div
                        className="absolute -inset-1 rounded-full opacity-70 blur-md transition-opacity duration-300 group-hover:opacity-100"
                        style={{ background: tierPillStyle.blur }}
                      />
                      <div
                        className={`relative flex items-center gap-2 rounded-full border bg-white/90 px-4 py-2 shadow-lg backdrop-blur-sm dark:bg-neutral-900/90 ${tierPillStyle.border} ${tierPillStyle.shadow}`}
                      >
                        <GuildIcon className={`h-4 w-4 ${tierPillStyle.icon}`} />
                        <span
                          className={`bg-gradient-to-r bg-clip-text text-xs font-black tracking-wide text-transparent uppercase ${tierPillStyle.text}`}
                        >
                          {membershipLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col items-center pb-2 sm:items-start">
                <p className={`${PROFILE_EYEBROW} mb-3 text-rose-600 dark:text-rose-400`}>
                  {t("eyebrow")}
                </p>
                <div className="order-last mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-start">
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs font-medium tracking-wide text-neutral-500 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
                  >
                    {copied ? (
                      <CheckIcon className="h-3 w-3 shrink-0 -translate-y-px text-emerald-500 dark:text-emerald-400" />
                    ) : (
                      <HashIcon className="h-3 w-3 shrink-0 -translate-y-px" />
                    )}
                    <span className={copied ? "text-emerald-500 dark:text-emerald-400" : ""}>
                      {user.publicId}
                    </span>
                  </button>
                  <ProfileShareButton shareUrl={profileUrl} shareText={shareText} />
                  <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-3 py-1.5 text-xs text-neutral-600 dark:border-white/10 dark:bg-neutral-900/70 dark:text-neutral-300">
                    <CalendarIcon className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
                    <span>
                      {t("memberSince")}{" "}
                      <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                        {user.memberSince}
                      </span>
                    </span>
                  </div>
                </div>

                {user.name ? (
                  <h1 className="text-4xl font-black tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white">
                    {user.name}
                  </h1>
                ) : (
                  <h1 className="text-4xl font-black tracking-tight text-neutral-400 sm:text-5xl lg:text-6xl">
                    {t("anonymousMember")}
                  </h1>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                  <RoleBadges
                    roles={user.roles}
                    membershipTier={user.isMember ? user.membershipTier : null}
                    questionActivityLevel={user.questionActivityLevel}
                  />
                  <BoostTitleBadge boostCount={user.boostCount} boostStreak={user.boostStreak} />
                </div>
              </div>
            </header>
          </div>

          <div className="section-divider my-12" />

          {speaker && nextTalk && (
            <section
              className={`${PROFILE_SURFACE} relative mb-6 border-orange-500/40 p-6 shadow-[0_18px_50px_-24px_rgba(244,63,94,0.55)] sm:p-7 dark:border-orange-400/40`}
              aria-labelledby="profile-speaker-heading"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-orange-500/15 via-rose-500/10 to-transparent dark:from-orange-500/20 dark:via-rose-500/10" />
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-rose-500 to-red-500" />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
                <SpeakerPhoto
                  name={speaker.name}
                  photoUrl={speaker.photoUrl}
                  sizes="96px"
                  className="w-24 shrink-0"
                  initialsClassName="text-2xl"
                />
                <div className="min-w-0 flex-1">
                  <p
                    id="profile-speaker-heading"
                    className={`${PROFILE_EYEBROW} flex items-center gap-2 text-orange-600 dark:text-orange-400`}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-60 motion-reduce:animate-none" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
                    </span>
                    {t("speaker.upcomingEyebrow")}
                  </p>
                  <p className="mt-2 text-xl font-bold tracking-tight text-balance text-neutral-900 sm:text-2xl dark:text-white">
                    {nextTalk.topic}
                  </p>
                  <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-600 dark:text-neutral-300">
                    <CalendarIcon className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {formatLongDateUTC(nextTalk.date, locale)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{nextTalk.eventTitle}</span>
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-3 sm:flex-col sm:items-stretch">
                  <Button href={PAGE_ROUTES.EVENT(nextTalk.eventId)} variant="primary" size="sm">
                    {t("speaker.viewEvent")}
                  </Button>
                  <Button href={speaker.href} variant="secondary" size="sm">
                    {t("speaker.viewPage")}
                  </Button>
                </div>
              </div>
            </section>
          )}

          {speaker && !nextTalk && latestTalk && (
            <section
              className={`${PROFILE_SURFACE} ${PROFILE_TONE.speaker} mb-6 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-7`}
              aria-labelledby="profile-speaker-heading"
            >
              <SpeakerPhoto
                name={speaker.name}
                photoUrl={speaker.photoUrl}
                sizes="72px"
                className="w-[72px] shrink-0"
                initialsClassName="text-xl"
              />
              <div className="min-w-0 flex-1">
                <p
                  id="profile-speaker-heading"
                  className={`${PROFILE_EYEBROW} text-orange-600 dark:text-orange-400`}
                >
                  {t("speaker.eyebrow")}
                </p>
                <p className="mt-1.5 text-lg font-bold tracking-tight text-balance text-neutral-900 dark:text-white">
                  {latestTalk.topic}
                </p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {t("speaker.talkCount", { count: speaker.talks.length })}
                </p>
              </div>
              <Button href={speaker.href} variant="secondary" size="sm" className="shrink-0">
                {t("speaker.viewPage")}
              </Button>
            </section>
          )}

          <section
            className={`${PROFILE_SURFACE} ${PROFILE_TONE.community} mb-8 p-6 sm:p-7`}
            aria-labelledby="profile-activity-heading"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1 space-y-4 text-sm text-neutral-600 dark:text-neutral-300">
                <div className="flex items-start justify-between gap-3 sm:block">
                  <div className="flex items-center gap-3">
                    <AccentBar />
                    <h2
                      id="profile-activity-heading"
                      className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white"
                    >
                      {t("activity.title")}
                    </h2>
                  </div>
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
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">
                        <BoltIcon className="h-3 w-3 shrink-0" />
                        <span>
                          <span className="font-bold">{user.boostCount}</span>{" "}
                          {t("activity.totalBoostsLabel", { count: user.boostCount })}
                        </span>
                      </div>
                      {user.boostsThisMonth > 0 && (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-300">
                          <CalendarIcon className="h-3 w-3 shrink-0" />
                          <span>
                            <span className="font-bold">{user.boostsThisMonth}</span>{" "}
                            {t("activity.boostsThisMonthLabel", { count: user.boostsThisMonth })}
                          </span>
                        </div>
                      )}
                      {user.boostStreak > 0 && (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300">
                          <FireIcon className="h-3 w-3 shrink-0" />
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
                className={`hidden items-center self-start rounded-full px-3 py-1.5 text-xs font-semibold sm:inline-flex ${
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
              <LockClosedIcon className="h-12 w-12 text-neutral-400 dark:text-neutral-600" />
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
