"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useGlobalPlayer } from "@/components/shared/GlobalPlayerProvider";
import { CinemaIcon } from "@/components/shared/Icons";
import { BackLink } from "@/components/ui/BackLink";
import { type BoostedByData } from "@/lib/api/video-engagement";
import { WEBSITE_URLS } from "@/lib/config/constants";
import { MEMBERSHIP_TIER_LABELS } from "@/lib/config/membership";
import { canAccessRecording, getRecordingAccessState } from "@/lib/recordings/early-access";
import type { Recording } from "@/lib/recordings/recordings";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectAuthMembershipTier } from "@/lib/redux/selectors/authSelectors";
import { LOGIN_REASON, PAGE_ROUTES } from "@/lib/routes/pages";
import { formatDate } from "@/lib/utils/locale";

import { AccessStatusPill, type AccessStatusKind } from "./AccessStatusPill";
import { BoostedBy } from "./BoostedBy";
import { LikeBoostButtons } from "./LikeBoostButtons";
import { RecordingAccessNotice } from "./RecordingAccessNotice";
import { RelatedVideosSection } from "./RelatedVideosSection";
import { ShareMenu } from "./ShareMenu";
import { VideoDetails, VideoMetadata } from "./VideoMetadata";
import { WatchLaterButton } from "./WatchLaterButton";

const getGuildLevelName = (tier?: number | null) => {
  if (tier === 1 || tier === 2 || tier === 3) {
    return MEMBERSHIP_TIER_LABELS[tier];
  }

  return undefined;
};

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
  const viewerMembershipTier = useAppSelector(selectAuthMembershipTier);
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
        membershipTier: viewerMembershipTier,
        now: new Date(nowMs),
        policy: recording.access,
      }));
  const isAccessCheckPending = isRestricted && !hasResolvedAuth;
  const countdownMs =
    isEarlyAccess && earlyAccessEndsAtMs ? Math.max(earlyAccessEndsAtMs - nowMs, 0) : 0;
  const requiredGuildLevelName = getGuildLevelName(requiredMembershipTier) ?? "";
  const currentGuildLevelName = getGuildLevelName(viewerMembershipTier);
  const isGuildTierLockedForMember = Boolean(
    auth.isAuthenticated &&
    !hasPlaybackAccess &&
    requiredMembershipTier &&
    requiredMembershipTier > 0 &&
    viewerMembershipTier > 0 &&
    viewerMembershipTier < requiredMembershipTier,
  );
  let requiredAccessLabel = "";
  if (requiredMembershipTier !== 0 && requiredGuildLevelName) {
    requiredAccessLabel = t("earlyAccessRequiredGuildByName", { level: requiredGuildLevelName });
  }

  let requiredAccessShortLabel = "";
  if (requiredMembershipTier === 0) {
    requiredAccessShortLabel = t("signInShort");
  } else if (requiredMembershipTier) {
    requiredAccessShortLabel = MEMBERSHIP_TIER_LABELS[requiredMembershipTier];
  }

  let accessLockedTitle = t("membersOnlyLockedTitle");
  if (isGuildTierLockedForMember) {
    accessLockedTitle = isEarlyAccess
      ? t("earlyAccessLockedTitleGuildLevel", { level: requiredGuildLevelName })
      : t("membersOnlyLockedTitleGuildLevel", { level: requiredGuildLevelName });
  } else if (isEarlyAccess) {
    accessLockedTitle =
      requiredMembershipTier === 0 ? t("earlyAccessLockedTitleLogin") : t("earlyAccessLockedTitle");
  } else if (requiredMembershipTier === 0) {
    accessLockedTitle = t("membersOnlyLockedTitleLogin");
  }
  const accessLockedSubtitle =
    isGuildTierLockedForMember && currentGuildLevelName
      ? t("guildLevelUpgradeHint", {
          currentLevel: currentGuildLevelName,
          requiredLevel: requiredGuildLevelName,
        })
      : "";
  let accessStatus: AccessStatusKind = "public";
  if (isRestricted) {
    accessStatus = isEarlyAccess ? "earlyAccess" : "membersOnly";
  }
  const loginHref = `${PAGE_ROUTES.LOGIN}?returnPath=${encodeURIComponent(
    PAGE_ROUTES.WATCH(recording.slug, recording.shortId),
  )}`;
  const recordingPath = PAGE_ROUTES.WATCH(recording.slug, recording.shortId);
  const shareUrl = `${WEBSITE_URLS.BASE}${recordingPath}`;

  let likeInteractionGateHref: string | undefined;
  if (!isAccessCheckPending && !hasPlaybackAccess) {
    if (!auth.isAuthenticated) {
      likeInteractionGateHref = PAGE_ROUTES.LOGIN_WITH_REASON_AND_RETURN(
        LOGIN_REASON.VIDEO_LOCKED_LIKE,
        recordingPath,
      );
    } else if (requiredMembershipTier && requiredMembershipTier > 0) {
      likeInteractionGateHref = PAGE_ROUTES.GUILD;
    }
  }

  let boostInteractionGateHref: string | undefined;
  if (!isAccessCheckPending && !hasPlaybackAccess) {
    if (!auth.isAuthenticated) {
      boostInteractionGateHref = PAGE_ROUTES.LOGIN_WITH_REASON_AND_RETURN(
        LOGIN_REASON.VIDEO_BOOST,
        recordingPath,
      );
    } else if (requiredMembershipTier && requiredMembershipTier > 0) {
      boostInteractionGateHref = PAGE_ROUTES.GUILD;
    }
  }

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
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-8rem] right-[-10rem] h-[26rem] w-[26rem] rounded-full bg-orange-500/16 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-[-8rem] h-[24rem] w-[24rem] rounded-full bg-orange-400/12 blur-3xl" />
      </div>
      <div className="relative mx-auto px-4 py-6 sm:px-6 lg:px-8" style={{ maxWidth: "85rem" }}>
        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
          <div className="min-w-0 space-y-4">
            <div className="hidden items-center justify-between gap-3 lg:flex">
              <BackLink
                href={PAGE_ROUTES.LIBRARY}
                className="hover:bg-brand-100/60 hover:text-brand-700 dark:hover:bg-brand-500/10 dark:hover:text-brand-400"
                prefetch={false}
              >
                {t("backToLibrary")}
              </BackLink>
              {hasPlaybackAccess && <AccessStatusPill status={accessStatus} />}
            </div>

            <div className="surface shadow-floating dark:shadow-floating relative overflow-hidden">
              <div className="relative z-10 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.2),transparent_62%)] p-2 transition-all duration-300 sm:p-3">
                <div className="shadow-floating dark:shadow-floating overflow-hidden rounded-xl bg-black ring-1 ring-black/40">
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
                      accessLockedSubtitle={accessLockedSubtitle}
                      countdownMs={countdownMs}
                      isAccessCheckPending={isAccessCheckPending}
                      isAuthenticated={auth.isAuthenticated}
                      loginHref={loginHref}
                    />
                  )}
                </div>
              </div>

              <VideoMetadata
                recording={recording}
                formattedDate={formattedDate}
                hideEarlyAccessBadge={!hasPlaybackAccess}
              />

              <div className="relative z-0 border-y border-neutral-200/50 bg-white/60 dark:border-neutral-700/40 dark:bg-white/[0.02]">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4 sm:gap-3 sm:px-6">
                  <LikeBoostButtons
                    gatedBoostActionHref={boostInteractionGateHref}
                    gatedLikeActionHref={likeInteractionGateHref}
                    hasInteractionAccess={hasPlaybackAccess}
                    onBoostedByLoad={setBoostedBy}
                    shortId={recording.shortId}
                  />

                  <div className="flex items-center gap-2 sm:gap-3">
                    <WatchLaterButton shortId={recording.shortId} variant="icon" size="sm" />
                    <ShareMenu shareUrl={shareUrl} shareText={shareText} />
                    <button
                      type="button"
                      disabled={!hasPlaybackAccess}
                      onClick={() => setCinemaMode(!cinemaMode)}
                      className={`hidden items-center gap-1.5 rounded-full bg-black/5 px-3 py-1.5 text-xs leading-none font-medium text-neutral-600 transition-all sm:inline-flex sm:leading-tight dark:bg-white/10 dark:text-neutral-300 ${
                        hasPlaybackAccess
                          ? "cursor-pointer hover:bg-black/10 hover:text-neutral-900 dark:hover:bg-white/20 dark:hover:text-white"
                          : "cursor-not-allowed opacity-50"
                      }`}
                    >
                      <CinemaIcon className="h-3.5 w-3.5" />
                      <span className="sm:translate-y-[1px]">
                        {cinemaMode ? t("exitCinema") : t("cinema")}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="h-10 px-5 pt-1 pb-2 sm:px-6">
                  <BoostedBy boostedBy={boostedBy} shortId={recording.shortId} />
                </div>
              </div>

              <VideoDetails recording={recording} footnote={t("youtubeNotice")} />
            </div>
          </div>

          <RelatedVideosSection relatedRecordings={relatedRecordings} />
        </div>
      </div>
    </div>
  );
}
