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
      <div className="relative mx-auto w-full max-w-[18rem] px-2 sm:max-w-xs sm:px-3">
        <div className="relative mx-auto w-full overflow-hidden rounded-xl border border-white/20 bg-black/40 px-2.5 py-2.5 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-3 sm:py-3">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(251,191,36,0.18),transparent_38%)]" />
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

              <h3 className="max-w-full text-[13px] leading-tight font-semibold text-white sm:text-sm">
                {accessLockedTitle}
              </h3>
            </div>

            {requiredMembershipTier === 0 && (
              <p className="text-[11px] leading-relaxed break-words text-neutral-200 sm:text-xs">
                {requiredAccessLabel}
              </p>
            )}

            {isEarlyAccess && countdownText && (
              <div
                className={`${ENGAGEMENT_BRANDING.access.classes.countdownPanel} w-full px-2.5 py-1.5 sm:px-3`}
              >
                <p className={ENGAGEMENT_BRANDING.access.classes.countdownLabel}>
                  {t("earlyAccessCountdownLabel")}
                </p>
                <p className="mt-0.5 text-xs font-bold tracking-tight break-words tabular-nums">
                  {t("earlyAccessCountdownValue", { time: countdownText })}
                </p>
              </div>
            )}

            {isAccessCheckPending ? (
              <div className="w-full border-t border-white/12 pt-2">
                <p className="text-[10px] font-medium text-neutral-300 sm:text-[11px]">
                  {t("loadingAccess")}
                </p>
                <div className="relative mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-white/18 sm:h-1">
                  <span className="early-access-loader absolute inset-y-0 -left-1/3 w-1/3 rounded-full" />
                </div>
              </div>
            ) : !isAuthenticated ? (
              <div className="w-full border-t border-white/12 pt-2">
                <Link
                  href={loginHref}
                  className="group inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-900 transition hover:bg-white/90"
                >
                  <LogInIcon className="h-3.5 w-3.5" />
                  {t("signInToWatch")}
                </Link>
              </div>
            ) : (
              <div className="flex w-full flex-col gap-2 border-t border-white/12 pt-2">
                <p className="text-[10px] font-medium text-neutral-300 sm:text-[11px]">
                  {isEarlyAccess ? t("earlyAccessUpgradeHint") : t("membersOnlyUpgradeHint")}
                </p>
                <Link
                  href={PAGE_ROUTES.LIBRARY}
                  className="group inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-2.5 py-1.5 text-[10px] font-semibold text-white transition hover:border-white/30 hover:bg-white/10 sm:text-[11px]"
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
