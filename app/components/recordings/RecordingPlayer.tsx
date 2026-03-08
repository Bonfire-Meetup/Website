"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useGlobalPlayer } from "@/components/shared/GlobalPlayerProvider";
import { CinemaIcon } from "@/components/shared/Icons";
import { BackLink } from "@/components/ui/BackLink";
import { type BoostedByData } from "@/lib/api/video-engagement";
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
import { VideoMetadata } from "./VideoMetadata";
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
  const requiredAccessLabel =
    requiredMembershipTier === 0
      ? ""
      : requiredGuildLevelName
        ? t("earlyAccessRequiredGuildByName", { level: requiredGuildLevelName })
        : "";
  const requiredAccessShortLabel =
    requiredMembershipTier === 0
      ? t("signInShort")
      : requiredMembershipTier
        ? MEMBERSHIP_TIER_LABELS[requiredMembershipTier]
        : "";
  const accessLockedTitle = isGuildTierLockedForMember
    ? isEarlyAccess
      ? t("earlyAccessLockedTitleGuildLevel", { level: requiredGuildLevelName })
      : t("membersOnlyLockedTitleGuildLevel", { level: requiredGuildLevelName })
    : isEarlyAccess
      ? requiredMembershipTier === 0
        ? t("earlyAccessLockedTitleLogin")
        : t("earlyAccessLockedTitle")
      : requiredMembershipTier === 0
        ? t("membersOnlyLockedTitleLogin")
        : t("membersOnlyLockedTitle");
  const accessLockedSubtitle =
    isGuildTierLockedForMember && currentGuildLevelName
      ? t("guildLevelUpgradeHint", {
          currentLevel: currentGuildLevelName,
          requiredLevel: requiredGuildLevelName,
        })
      : "";
  const accessStatus: AccessStatusKind = isRestricted
    ? isEarlyAccess
      ? "earlyAccess"
      : "membersOnly"
    : "public";
  const loginHref = `${PAGE_ROUTES.LOGIN}?returnPath=${encodeURIComponent(
    PAGE_ROUTES.WATCH(recording.slug, recording.shortId),
  )}`;
  const likeInteractionGateHref = isAccessCheckPending
    ? undefined
    : !hasPlaybackAccess
      ? !auth.isAuthenticated
        ? PAGE_ROUTES.LOGIN_WITH_REASON_AND_RETURN(
            LOGIN_REASON.VIDEO_LOCKED_LIKE,
            PAGE_ROUTES.WATCH(recording.slug, recording.shortId),
          )
        : requiredMembershipTier && requiredMembershipTier > 0
          ? PAGE_ROUTES.GUILD
          : undefined
      : undefined;
  const boostInteractionGateHref = isAccessCheckPending
    ? undefined
    : !hasPlaybackAccess
      ? !auth.isAuthenticated
        ? PAGE_ROUTES.LOGIN_WITH_REASON_AND_RETURN(
            LOGIN_REASON.VIDEO_BOOST,
            PAGE_ROUTES.WATCH(recording.slug, recording.shortId),
          )
        : requiredMembershipTier && requiredMembershipTier > 0
          ? PAGE_ROUTES.GUILD
          : undefined
      : undefined;

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
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-8rem] right-[-10rem] h-[26rem] w-[26rem] rounded-full bg-orange-500/16 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-[-8rem] h-[24rem] w-[24rem] rounded-full bg-orange-400/12 blur-3xl" />
      </div>
      <div className="relative mx-auto px-4 py-6 sm:px-6 lg:px-8" style={{ maxWidth: "85rem" }}>
        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
          <div className="min-w-0 space-y-8">
            <div className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-white/80 shadow-[0_28px_70px_-34px_rgba(17,24,39,0.45)] ring-1 ring-white/50 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-950/85 dark:shadow-[0_34px_84px_-34px_rgba(0,0,0,0.8)] dark:ring-white/10">
              <div className="hidden items-center justify-between border-b border-neutral-200/40 px-5 py-4 lg:flex dark:border-neutral-700/30">
                <BackLink
                  href={PAGE_ROUTES.LIBRARY}
                  className="hover:bg-brand-100/60 hover:text-brand-700 dark:hover:bg-brand-500/10 dark:hover:text-brand-400"
                  prefetch={false}
                >
                  {t("backToLibrary")}
                </BackLink>
                {hasPlaybackAccess && <AccessStatusPill status={accessStatus} />}
              </div>

              <div className="relative z-10 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.2),transparent_62%)] p-2 transition-all duration-300 sm:p-3">
                <div className="overflow-hidden rounded-[1.35rem] bg-black shadow-[0_30px_62px_-30px_rgba(15,23,42,0.48)] ring-1 ring-black/40 dark:shadow-[0_24px_54px_-28px_rgba(0,0,0,0.85)]">
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

              <div className="relative z-0 border-b border-neutral-200/50 bg-white/60 dark:border-neutral-700/40 dark:bg-white/[0.02]">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-4 sm:gap-3 sm:px-6">
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

                <div className="px-5 pb-4 sm:px-6">
                  <div className="h-10">
                    <BoostedBy boostedBy={boostedBy} shortId={recording.shortId} />
                  </div>
                  <p className="mt-3 text-[10px] leading-tight text-neutral-500 dark:text-neutral-500">
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
