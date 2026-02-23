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
    <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-neutral-950 sm:aspect-video">
      <Image
        src={thumbnail}
        alt={title}
        fill
        sizes="(max-width: 1280px) 100vw, 900px"
        className="scale-[1.04] object-cover opacity-35 blur-[1.5px]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/65 to-black/78" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.18),transparent_45%)]" />
      <div className="relative mx-auto w-full max-w-lg px-3 sm:max-w-2xl sm:px-6">
        <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-white/20 bg-black/35 px-4 py-4 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:max-w-none sm:rounded-3xl sm:px-6 sm:py-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(251,191,36,0.18),transparent_38%)]" />
          <div className="relative flex flex-col gap-4 sm:gap-5">
            <div className="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              {requiredMembershipTier === 0 ? (
                <span
                  className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] uppercase ${getAccessPillClasses(true)}`}
                >
                  <LogInIcon className="h-3.5 w-3.5" />
                  {isEarlyAccess ? t("earlyAccess") : t("membersOnly")}
                </span>
              ) : (
                <span
                  className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] uppercase ${getAccessPillClasses(false)}`}
                >
                  <GuildIcon className="h-3.5 w-3.5 text-neutral-900" />
                  {requiredAccessShortLabel}
                </span>
              )}
              <span className="max-w-full text-[9px] font-semibold tracking-[0.1em] text-white/70 uppercase sm:text-[10px] sm:tracking-[0.12em]">
                {accessLockedTitle}
              </span>
            </div>

            <p className="text-sm leading-relaxed break-words text-neutral-100 sm:text-[15px]">
              {requiredAccessLabel}
            </p>

            {isEarlyAccess && countdownText && (
              <div
                className={`${ENGAGEMENT_BRANDING.access.classes.countdownPanel} px-3 py-2.5 sm:px-4`}
              >
                <p className={ENGAGEMENT_BRANDING.access.classes.countdownLabel}>
                  {t("earlyAccessCountdownLabel")}
                </p>
                <p className="mt-0.5 text-sm font-bold tracking-tight break-words tabular-nums sm:text-base">
                  {t("earlyAccessCountdownValue", { time: countdownText })}
                </p>
              </div>
            )}

            {isAccessCheckPending ? (
              <div className="border-t border-white/12 pt-3 sm:pt-4">
                <p className="text-[11px] font-medium text-neutral-300 sm:text-xs">
                  {t("loadingAccess")}
                </p>
                <div className="relative mt-2 h-[3px] w-full overflow-hidden rounded-full bg-white/18 sm:h-1">
                  <span className="early-access-loader absolute inset-y-0 -left-1/3 w-1/3 rounded-full" />
                </div>
              </div>
            ) : !isAuthenticated ? (
              <div className="border-t border-white/12 pt-3 sm:pt-4">
                <Link
                  href={loginHref}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-neutral-900 transition hover:bg-white/90 sm:w-auto sm:text-sm"
                >
                  <LogInIcon className="h-4 w-4" />
                  {t("signInToWatch")}
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3 border-t border-white/12 pt-3 sm:flex-row sm:items-center sm:justify-between sm:pt-4">
                <p className="text-[11px] font-medium text-neutral-300 sm:text-xs">
                  {isEarlyAccess ? t("earlyAccessUpgradeHint") : t("membersOnlyUpgradeHint")}
                </p>
                <Link
                  href={PAGE_ROUTES.LIBRARY}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3.5 py-2 text-[11px] font-semibold text-white transition hover:border-white/30 hover:bg-white/10 sm:text-xs"
                >
                  {t("backToLibrary")}
                  <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
