"use client";

import type { Recording } from "@/lib/recordings/recordings";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useGlobalPlayer } from "@/components/shared/GlobalPlayerProvider";
import { ArrowLeftIcon, CinemaIcon } from "@/components/shared/Icons";
import { type BoostedByData } from "@/lib/api/video-engagement";
import { MEMBERSHIP_TIER_LABELS } from "@/lib/config/membership";
import { canAccessRecording, getRecordingAccessState } from "@/lib/recordings/early-access";
import { useAppSelector } from "@/lib/redux/hooks";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { formatDate } from "@/lib/utils/locale";

import { BoostedBy } from "./BoostedBy";
import { LikeBoostButtons } from "./LikeBoostButtons";
import { RecordingAccessNotice } from "./RecordingAccessNotice";
import { RelatedVideosSection } from "./RelatedVideosSection";
import { ShareMenu } from "./ShareMenu";
import { VideoMetadata } from "./VideoMetadata";
import { WatchLaterButton } from "./WatchLaterButton";

export type RelatedRecording = Pick<
  Recording,
  | "shortId"
  | "slug"
  | "title"
  | "thumbnail"
  | "speaker"
  | "episode"
  | "episodeNumber"
  | "location"
  | "access"
>;

export function RecordingPlayer({
  recording,
  relatedRecordings,
}: {
  recording: Recording;
  relatedRecordings: RelatedRecording[];
}) {
  const t = useTranslations("recordings");
  const locale = useLocale();
  const router = useRouter();
  const auth = useAppSelector((state) => state.auth);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const refreshTriggeredRef = useRef(false);

  const inlinePlayerRef = useRef<HTMLDivElement | null>(null);
  const { setVideo, setInlineContainer, clearVideo, cinemaMode, setCinemaMode } = useGlobalPlayer();

  const formattedDate = formatDate(recording.date, locale);
  const [boostedBy, setBoostedBy] = useState<BoostedByData | null | undefined>(undefined);
  const { earlyAccessEndsAtMs, isEarlyAccess, isRestricted, requiredMembershipTier } =
    getRecordingAccessState(recording.access, new Date(nowMs));
  const hasResolvedAuth = auth.hydrated;
  const hasPlaybackAccess =
    !isRestricted ||
    (hasResolvedAuth &&
      canAccessRecording({
        isAuthenticated: auth.isAuthenticated,
        membershipTier: auth.user?.decodedToken?.mbt,
        now: new Date(nowMs),
        policy: recording.access,
      }));
  const isAccessCheckPending = isRestricted && !hasResolvedAuth;
  const countdownMs =
    isEarlyAccess && earlyAccessEndsAtMs ? Math.max(earlyAccessEndsAtMs - nowMs, 0) : 0;
  const requiredGuildLevelName = requiredMembershipTier
    ? MEMBERSHIP_TIER_LABELS[requiredMembershipTier]
    : "";
  const requiredAccessLabel =
    requiredMembershipTier === 0
      ? t("earlyAccessRequiredLogin")
      : requiredGuildLevelName
        ? t("earlyAccessRequiredGuildByName", { level: requiredGuildLevelName })
        : "";
  const requiredAccessShortLabel =
    requiredMembershipTier === 0
      ? t("signInShort")
      : requiredMembershipTier
        ? MEMBERSHIP_TIER_LABELS[requiredMembershipTier]
        : "";
  const accessLockedTitle = isEarlyAccess
    ? requiredMembershipTier === 0
      ? t("earlyAccessLockedTitleLogin")
      : t("earlyAccessLockedTitle")
    : t("membersOnlyLockedTitle");
  const loginHref = `${PAGE_ROUTES.LOGIN}?returnPath=${encodeURIComponent(
    PAGE_ROUTES.WATCH(recording.slug, recording.shortId),
  )}`;

  const [shareUrl, setShareUrl] = useState("");
  const shareText = `${recording.title} - ${recording.speaker.join(", ")}`;

  useEffect(() => {
    window.scrollTo({ behavior: "auto", left: 0, top: 0 });
  }, [recording.youtubeId]);

  useEffect(() => {
    setNowMs(Date.now());
    refreshTriggeredRef.current = false;
  }, [recording.youtubeId]);

  useEffect(() => {
    if (!isEarlyAccess || hasPlaybackAccess || !earlyAccessEndsAtMs) {
      return;
    }

    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [earlyAccessEndsAtMs, hasPlaybackAccess, isEarlyAccess]);

  useEffect(() => {
    if (
      !isEarlyAccess ||
      !earlyAccessEndsAtMs ||
      hasPlaybackAccess ||
      refreshTriggeredRef.current
    ) {
      return;
    }

    if (Date.now() >= earlyAccessEndsAtMs) {
      refreshTriggeredRef.current = true;
      router.refresh();
    }
  }, [earlyAccessEndsAtMs, hasPlaybackAccess, isEarlyAccess, router, nowMs]);

  useEffect(() => {
    setShareUrl(window.location.href);
  }, [recording.slug, recording.shortId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCinemaMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setCinemaMode]);

  useEffect(() => {
    if (!hasPlaybackAccess) {
      clearVideo();
      return;
    }

    setVideo({
      title: recording.title,
      watchUrl: PAGE_ROUTES.WATCH(recording.slug, recording.shortId),
      youtubeId: recording.youtubeId,
    });
  }, [
    clearVideo,
    hasPlaybackAccess,
    recording.title,
    recording.slug,
    recording.shortId,
    recording.youtubeId,
    setVideo,
  ]);

  useEffect(() => {
    const el = inlinePlayerRef.current;
    setInlineContainer(el);

    return () => setInlineContainer(null);
  }, [setInlineContainer]);

  return (
    <div className="gradient-bg min-h-screen">
      <div className="relative mx-auto px-4 py-6 sm:px-6 lg:px-8" style={{ maxWidth: "85rem" }}>
        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
          <div className="min-w-0 space-y-8">
            <div className="glass-card no-hover-pop overflow-hidden">
              <div className="hidden items-center justify-between border-b border-neutral-200/30 px-4 py-3 lg:flex dark:border-neutral-700/30">
                <div className="hidden lg:block">
                  <Link
                    href={PAGE_ROUTES.LIBRARY}
                    className="group hover:bg-brand-100/60 hover:text-brand-700 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-neutral-600 transition dark:text-neutral-400"
                    prefetch={false}
                  >
                    <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    <span>{t("backToLibrary")}</span>
                  </Link>
                </div>
              </div>

              {hasPlaybackAccess ? (
                <div ref={inlinePlayerRef} className="relative aspect-video w-full bg-black" />
              ) : (
                <RecordingAccessNotice
                  thumbnail={recording.thumbnail}
                  title={recording.title}
                  isEarlyAccess={isEarlyAccess}
                  requiredMembershipTier={requiredMembershipTier}
                  requiredAccessLabel={requiredAccessLabel}
                  requiredAccessShortLabel={requiredAccessShortLabel}
                  accessLockedTitle={accessLockedTitle}
                  countdownMs={countdownMs}
                  isAccessCheckPending={isAccessCheckPending}
                  isAuthenticated={auth.isAuthenticated}
                  loginHref={loginHref}
                />
              )}

              <div className="border-b border-neutral-200/40 dark:border-neutral-700/40">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-4 sm:gap-3 sm:px-6">
                  {hasPlaybackAccess ? (
                    <LikeBoostButtons onBoostedByLoad={setBoostedBy} shortId={recording.shortId} />
                  ) : null}

                  <div className="flex items-center gap-2 sm:gap-3">
                    <WatchLaterButton shortId={recording.shortId} variant="icon" size="sm" />
                    <ShareMenu shareUrl={shareUrl} shareText={shareText} />
                    <button
                      type="button"
                      onClick={() => setCinemaMode(!cinemaMode)}
                      className="hidden cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs leading-none font-medium text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-900 sm:inline-flex sm:leading-tight dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <CinemaIcon className="h-3.5 w-3.5" />
                      <span className="sm:translate-y-[1px]">
                        {cinemaMode ? t("exitCinema") : t("cinema")}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="px-5 pb-4 sm:px-6">
                  {hasPlaybackAccess ? (
                    <div className="h-10">
                      <BoostedBy boostedBy={boostedBy} shortId={recording.shortId} />
                    </div>
                  ) : null}
                  <p className="mt-3 text-[10px] leading-tight text-neutral-500/90 dark:text-neutral-500">
                    {t("youtubeNotice")}
                  </p>
                </div>
              </div>

              <VideoMetadata
                recording={recording}
                formattedDate={formattedDate}
                hideEarlyAccessBadge={!hasPlaybackAccess}
              />
            </div>
          </div>

          <RelatedVideosSection relatedRecordings={relatedRecordings} />
        </div>
      </div>
    </div>
  );
}
