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
  countdownMs,
  isAccessCheckPending,
  isAuthenticated,
  loginHref,
}: RecordingAccessNoticeProps) {
  const t = useTranslations("recordings");
  const countdownText = formatCountdown(countdownMs, t);

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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.12),transparent_45%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.18),transparent_45%)]" />
      <div className="relative mx-auto w-full max-w-[18rem] px-2 sm:max-w-xs sm:px-3">
        <div className="relative mx-auto w-full overflow-hidden rounded-xl border border-black/10 bg-white/85 px-2.5 py-2.5 shadow-[0_28px_80px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:px-3 sm:py-3 dark:border-white/20 dark:bg-black/40 dark:shadow-[0_28px_80px_rgba(0,0,0,0.45)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(251,191,36,0.12),transparent_38%)] dark:bg-[radial-gradient(circle_at_0%_0%,rgba(251,191,36,0.18),transparent_38%)]" />
          <div className="relative flex flex-col items-center gap-2.5 text-center">
            <div className="flex flex-col items-center gap-1.5">
              {requiredMembershipTier === 0 ? (
                <span
                  className={`inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-[0.12em] uppercase ${getAccessPillClasses(true)}`}
                >
                  <LogInIcon className="h-3 w-3" />
                  {isEarlyAccess ? t("earlyAccess") : t("membersOnly")}
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

            {requiredMembershipTier === 0 && (
              <p className="text-[11px] leading-relaxed break-words text-neutral-700 sm:text-xs dark:text-neutral-200">
                {requiredAccessLabel}
              </p>
            )}

            {isEarlyAccess && countdownText && (
              <div
                className={`${ENGAGEMENT_BRANDING.access.classes.countdownPanel} w-full border-amber-300/55 bg-gradient-to-r from-amber-200/55 via-orange-200/45 to-rose-200/45 px-2.5 py-1.5 text-amber-950 shadow-[0_0_20px_rgba(251,146,60,0.12)] sm:px-3 dark:border-amber-200/40 dark:bg-gradient-to-r dark:from-amber-400/20 dark:via-orange-400/16 dark:to-rose-400/16 dark:text-amber-50 dark:shadow-[0_0_20px_rgba(251,146,60,0.18)]`}
              >
                <p
                  className={`${ENGAGEMENT_BRANDING.access.classes.countdownLabel} text-amber-800 dark:text-amber-100/90`}
                >
                  {t("earlyAccessCountdownLabel")}
                </p>
                <p className="mt-0.5 text-xs font-bold tracking-tight break-words text-amber-950 tabular-nums dark:text-amber-50">
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
                  <span className="early-access-loader absolute inset-y-0 -left-1/3 w-1/3 rounded-full" />
                </div>
              </div>
            ) : !isAuthenticated ? (
              <div className="w-full border-t border-black/10 pt-2 dark:border-white/12">
                <Link
                  href={loginHref}
                  className="group inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-white/90"
                >
                  <LogInIcon className="h-3.5 w-3.5" />
                  {t("signInToWatch")}
                </Link>
              </div>
            ) : (
              <div className="flex w-full flex-col gap-2 border-t border-black/10 pt-2 dark:border-white/12">
                <p className="text-[10px] font-medium text-neutral-600 sm:text-[11px] dark:text-neutral-300">
                  {isEarlyAccess ? t("earlyAccessUpgradeHint") : t("membersOnlyUpgradeHint")}
                </p>
                <Link
                  href={PAGE_ROUTES.LIBRARY}
                  className="group inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-black/20 bg-white/60 px-2.5 py-1.5 text-[10px] font-semibold text-neutral-900 transition hover:border-black/30 hover:bg-white/80 sm:text-[11px] dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:border-white/30 dark:hover:bg-white/10"
                >
                  {t("backToLibrary")}
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
