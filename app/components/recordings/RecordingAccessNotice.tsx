"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

import { ArrowRightIcon, GuildIcon, LogInIcon } from "@/components/shared/Icons";
import { ENGAGEMENT_BRANDING, getAccessPillClasses } from "@/lib/config/engagement-branding";
import { PAGE_ROUTES } from "@/lib/routes/pages";

interface RecordingAccessNoticeProps {
  thumbnail: string;
  title: string;
  isEarlyAccess: boolean;
  requiredMembershipTier?: number;
  requiredAccessLabel: string;
  requiredAccessShortLabel: string;
  accessLockedTitle: string;
  accessLockedSubtitle?: string;
  countdownMs: number;
  isAccessCheckPending: boolean;
  isAuthenticated: boolean;
  loginHref: string;
}

function formatCountdown(countdownMs: number, t: ReturnType<typeof useTranslations>) {
  if (countdownMs <= 0) {
    return null;
  }

  const totalSeconds = Math.ceil(countdownMs / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return t("earlyAccessCountdownDaysHoursMinutes", {
      days: String(days),
      hours: String(hours),
      minutes: String(minutes),
    });
  }

  if (hours > 0) {
    return t("earlyAccessCountdownHoursMinutesSeconds", {
      hours: String(hours),
      minutes: String(minutes),
      seconds: String(seconds),
    });
  }

  if (minutes > 0) {
    return t("earlyAccessCountdownMinutesSeconds", {
      minutes: String(minutes),
      seconds: String(seconds),
    });
  }

  return t("earlyAccessCountdownSeconds", { seconds: String(seconds) });
}

export function RecordingAccessNotice({
  thumbnail,
  title,
  isEarlyAccess,
  requiredMembershipTier,
  requiredAccessLabel,
  requiredAccessShortLabel,
  accessLockedTitle,
  accessLockedSubtitle,
  countdownMs,
  isAccessCheckPending,
  isAuthenticated,
  loginHref,
}: RecordingAccessNoticeProps) {
  const t = useTranslations("recordings");
  const countdownText = formatCountdown(countdownMs, t);
  const isSignInAccess = requiredMembershipTier === 0;
  const isGuildLocked = Boolean(requiredMembershipTier && requiredMembershipTier > 0);
  const ambientAccentClass = isSignInAccess
    ? ENGAGEMENT_BRANDING.access.classes.signInNoticeAmbient
    : ENGAGEMENT_BRANDING.access.classes.guildNoticeAmbient;
  const cardAccentClass = isSignInAccess
    ? ENGAGEMENT_BRANDING.access.classes.signInNoticeCardAccent
    : ENGAGEMENT_BRANDING.access.classes.guildNoticeCardAccent;
  const countdownPanelClass = isSignInAccess
    ? ENGAGEMENT_BRANDING.access.classes.signInCountdownPanel
    : ENGAGEMENT_BRANDING.access.classes.guildCountdownPanel;
  const countdownLabelClass = isSignInAccess
    ? ENGAGEMENT_BRANDING.access.classes.signInCountdownLabel
    : ENGAGEMENT_BRANDING.access.classes.guildCountdownLabel;
  const countdownValueClass = isSignInAccess
    ? ENGAGEMENT_BRANDING.access.classes.signInCountdownValue
    : ENGAGEMENT_BRANDING.access.classes.guildCountdownValue;
  const loaderGradientClass = isSignInAccess
    ? ENGAGEMENT_BRANDING.access.classes.signInLoaderGradient
    : ENGAGEMENT_BRANDING.access.classes.guildLoaderGradient;

  return (
    <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-neutral-200 sm:aspect-video dark:bg-neutral-950">
      <Image
        src={thumbnail}
        alt={title}
        fill
        sizes="(max-width: 1280px) 100vw, 900px"
        className="scale-[1.04] object-cover opacity-35 blur-[1.5px]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/62 to-white/76 dark:from-black/45 dark:via-black/65 dark:to-black/78" />
      <div className={`absolute inset-0 ${ambientAccentClass}`} />
      <div className="relative mx-auto w-full max-w-[18rem] px-2 sm:max-w-[22rem] sm:px-3 lg:max-w-[24rem]">
        <div className="relative mx-auto w-full overflow-hidden rounded-xl border border-black/10 bg-white/85 px-2.5 py-2.5 shadow-[0_28px_80px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:px-3 sm:py-3 lg:px-3.5 lg:py-3.5 dark:border-white/20 dark:bg-black/40 dark:shadow-[0_28px_80px_rgba(0,0,0,0.45)]">
          <div className={`pointer-events-none absolute inset-0 ${cardAccentClass}`} />
          <div className="relative flex flex-col items-center gap-2.5 text-center lg:gap-3">
            <div className="flex flex-col items-center gap-1.5">
              {requiredMembershipTier === 0 ? (
                <span
                  className={`inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-[0.12em] uppercase ${getAccessPillClasses(true)}`}
                >
                  <LogInIcon className="h-3 w-3" />
                  {isEarlyAccess ? t("earlyAccess") : t("signInShort")}
                </span>
              ) : (
                <span
                  className={`inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-[0.12em] uppercase ${getAccessPillClasses(false)}`}
                >
                  <GuildIcon className="h-3 w-3 text-neutral-900" />
                  {requiredAccessShortLabel}
                </span>
              )}

              <h3 className="max-w-full text-[13px] leading-tight font-semibold text-neutral-900 sm:text-sm dark:text-white">
                {accessLockedTitle}
              </h3>
            </div>

            {accessLockedSubtitle ? (
              <p className="text-[11px] leading-relaxed break-words text-neutral-700 sm:text-xs dark:text-neutral-200">
                {accessLockedSubtitle}
              </p>
            ) : requiredMembershipTier === 0 && requiredAccessLabel ? (
              <p className="text-[11px] leading-relaxed break-words text-neutral-700 sm:text-xs dark:text-neutral-200">
                {requiredAccessLabel}
              </p>
            ) : null}

            {isEarlyAccess && countdownText && (
              <div
                className={`${ENGAGEMENT_BRANDING.access.classes.countdownPanel} ${countdownPanelClass}`}
              >
                <p
                  className={`${ENGAGEMENT_BRANDING.access.classes.countdownLabel} ${countdownLabelClass}`}
                >
                  {t("earlyAccessCountdownLabel")}
                </p>
                <p className={countdownValueClass}>
                  {t("earlyAccessCountdownValue", { time: countdownText })}
                </p>
              </div>
            )}

            {isAccessCheckPending ? (
              <div className="w-full border-t border-black/10 pt-2 dark:border-white/12">
                <p className="text-[10px] font-medium text-neutral-600 sm:text-[11px] dark:text-neutral-300">
                  {t("loadingAccess")}
                </p>
                <div className="relative mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-black/10 sm:h-1 dark:bg-white/18">
                  <span
                    className={`early-access-loader absolute inset-y-0 -left-1/3 w-1/3 rounded-full ${loaderGradientClass}`}
                  />
                </div>
              </div>
            ) : !isAuthenticated ? (
              <div className="w-full border-t border-black/10 pt-2 dark:border-white/12">
                <Link
                  href={loginHref}
                  className="group inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-white/90"
                >
                  <LogInIcon className="h-3.5 w-3.5" />
                  {requiredMembershipTier === 0 && isEarlyAccess
                    ? t("signInToWatchEarly")
                    : t("signInToWatch")}
                </Link>
              </div>
            ) : (
              <div className="flex w-full flex-col gap-2 border-t border-black/10 pt-2 dark:border-white/12">
                {!accessLockedSubtitle && (
                  <p className="text-[10px] font-medium text-neutral-600 sm:text-[11px] dark:text-neutral-300">
                    {isEarlyAccess ? t("earlyAccessUpgradeHint") : t("membersOnlyUpgradeHint")}
                  </p>
                )}
                <Link
                  href={isGuildLocked ? PAGE_ROUTES.GUILD : PAGE_ROUTES.LIBRARY}
                  className="group inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-black/20 bg-white/60 px-2.5 py-1.5 text-[10px] font-semibold text-neutral-900 transition hover:border-black/30 hover:bg-white/80 sm:text-[11px] dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:border-white/30 dark:hover:bg-white/10"
                >
                  {isGuildLocked ? t("goToGuild") : t("backToLibrary")}
                  <ArrowRightIcon className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
