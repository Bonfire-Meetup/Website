"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { ApiError } from "@/lib/api/errors";
import {
  type BoostedByData,
  useVideoBoostMutation,
  useVideoBoosts,
  useVideoLikeMutation,
  useVideoLikes,
} from "@/lib/api/video-engagement";
import { getHasValidToken } from "@/lib/auth/client";
import { ENGAGEMENT_BRANDING } from "@/lib/config/engagement-branding";
import { useVideoEngagementRedux } from "@/lib/redux/hooks";
import { LOGIN_REASON, PAGE_ROUTES } from "@/lib/routes/pages";

import { BoltIcon, FireIcon, FrownIcon } from "../shared/Icons";

interface LikeBoostButtonsProps {
  onBoostedByLoad?: (boostedBy: BoostedByData | null) => void;
  shortId: string;
}

export function LikeBoostButtons({ onBoostedByLoad, shortId }: LikeBoostButtonsProps) {
  const t = useTranslations("recordings");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { engagement, setLikes, setBoosts } = useVideoEngagementRedux(shortId);

  const [likePulse, setLikePulse] = useState(false);
  const [boostPulse, setBoostPulse] = useState(false);
  const [likeRateLimitError, setLikeRateLimitError] = useState(false);
  const [boostRateLimitError, setBoostRateLimitError] = useState(false);

  const timeoutsRef = useRef<number[]>([]);
  const likeErrorTimeoutRef = useRef<number | null>(null);
  const boostErrorTimeoutRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      for (const id of timeoutsRef.current) {
        window.clearTimeout(id);
      }
      timeoutsRef.current = [];
      if (likeErrorTimeoutRef.current) {
        window.clearTimeout(likeErrorTimeoutRef.current);
      }
      if (boostErrorTimeoutRef.current) {
        window.clearTimeout(boostErrorTimeoutRef.current);
      }
    },
    [],
  );

  const handleRateLimitError = (
    setError: (value: boolean) => void,
    timeoutRef: React.MutableRefObject<number | null>,
  ) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    setError(true);
    timeoutRef.current = window.setTimeout(() => {
      setError(false);
      timeoutRef.current = null;
    }, 5000);
  };

  const likesQuery = useVideoLikes(shortId);

  const boostsQuery = useVideoBoosts(shortId);

  const likeMutation = useVideoLikeMutation(shortId);
  const boostMutation = useVideoBoostMutation(shortId);

  const likeCount = engagement?.likes.count ?? likesQuery.data?.count ?? null;
  const hasLiked = engagement?.likes.hasLiked ?? likesQuery.data?.hasLiked ?? false;
  const likeLoadError = likesQuery.isError;
  const isLiking = likeMutation.isPending;

  const boostCount = engagement?.boosts.count ?? boostsQuery.data?.count ?? null;
  const hasBoosted = engagement?.boosts.hasBoosted ?? boostsQuery.data?.hasBoosted ?? false;
  const availableBoosts =
    engagement?.boosts.availableBoosts ?? boostsQuery.data?.availableBoosts ?? null;
  const boostLoadError = boostsQuery.isError;
  const isBoosting = boostMutation.isPending;

  useEffect(() => {
    if (!likesQuery.data) {
      return;
    }
    setLikes(likesQuery.data.count, likesQuery.data.hasLiked);
  }, [likesQuery.data, setLikes]);

  useEffect(() => {
    if (!boostsQuery.data) {
      return;
    }
    setBoosts(
      boostsQuery.data.count,
      boostsQuery.data.hasBoosted,
      boostsQuery.data.availableBoosts,
      boostsQuery.data.boostedBy ?? null,
    );
  }, [boostsQuery.data, setBoosts]);

  const boostedByOrNull = useMemo(() => {
    const reduxBoostedBy = engagement?.boosts.boostedBy;
    if (reduxBoostedBy !== undefined) {
      return reduxBoostedBy;
    }
    if (!boostsQuery.data) {
      return undefined;
    }
    return boostsQuery.data.boostedBy ?? null;
  }, [engagement?.boosts.boostedBy, boostsQuery.data]);

  useEffect(() => {
    if (!onBoostedByLoad) {
      return;
    }
    if (boostedByOrNull === undefined) {
      return;
    }
    onBoostedByLoad(boostedByOrNull);
  }, [boostedByOrNull, onBoostedByLoad]);

  const pulse = (kind: "like" | "boost") => {
    if (kind === "like") {
      setLikePulse(true);
      timeoutsRef.current.push(window.setTimeout(() => setLikePulse(false), 450));
    } else {
      setBoostPulse(true);
      timeoutsRef.current.push(window.setTimeout(() => setBoostPulse(false), 500));
    }
  };

  const handleLike = async () => {
    if (!shortId || isLiking || likeCount === null) {
      return;
    }

    pulse("like");
    const adding = !hasLiked;

    try {
      await likeMutation.mutateAsync(adding);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 429) {
        handleRateLimitError(setLikeRateLimitError, likeErrorTimeoutRef);
      }
    }
  };

  const handleBoost = async () => {
    const query = searchParams.toString();
    const returnPath = `${pathname}${query ? `?${query}` : ""}`;

    if (!getHasValidToken()) {
      router.push(PAGE_ROUTES.LOGIN_WITH_REASON_AND_RETURN(LOGIN_REASON.VIDEO_BOOST, returnPath));
      return;
    }

    if (!shortId || isBoosting || boostCount === null) {
      return;
    }

    if (availableBoosts !== null && availableBoosts === 0 && !hasBoosted) {
      return;
    }

    pulse("boost");
    const adding = !hasBoosted;

    try {
      await boostMutation.mutateAsync(adding);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(PAGE_ROUTES.LOGIN_WITH_REASON_AND_RETURN(LOGIN_REASON.VIDEO_BOOST, returnPath));
        return;
      }

      if (err instanceof ApiError && err.status === 403) {
        boostsQuery.refetch();
      }

      if (err instanceof ApiError && err.status === 429) {
        handleRateLimitError(setBoostRateLimitError, boostErrorTimeoutRef);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="group relative inline-flex">
        <div
          className={`relative z-0 transition-transform ${
            likeCount === null ? "" : "hover:-translate-y-0.5"
          }`}
        >
          <button
            type="button"
            onClick={handleLike}
            aria-pressed={hasLiked}
            disabled={isLiking || likeCount === null}
            className={`relative inline-flex h-11 min-w-[6.5rem] items-center justify-center gap-2 rounded-l-full border border-r-0 border-neutral-200/60 px-3 py-2.5 text-sm leading-none font-semibold transition-all sm:min-w-[8.5rem] sm:gap-3 sm:px-5 dark:border-white/10 ${
              hasLiked
                ? `${ENGAGEMENT_BRANDING.like.classes.activeGradient} ${ENGAGEMENT_BRANDING.like.classes.activeText} ${ENGAGEMENT_BRANDING.like.classes.activeShadow}`
                : `bg-white ring-1 ring-rose-400/15 ring-inset ${ENGAGEMENT_BRANDING.like.classes.inactiveText} dark:bg-white/5 dark:ring-rose-400/12`
            } ${isLiking || likeCount === null ? "opacity-80" : ""} ${
              likeCount === null
                ? "cursor-not-allowed"
                : `cursor-pointer ${ENGAGEMENT_BRANDING.like.classes.hoverShadow}`
            } ${likePulse ? ENGAGEMENT_BRANDING.like.animations.glow : ""}`}
          >
            <span className="pointer-events-none absolute top-2 right-0 bottom-2 w-px bg-white/80 opacity-70 transition-opacity group-hover:opacity-0 dark:bg-white/25" />
            <FireIcon
              className={`h-5 w-5 shrink-0 ${hasLiked ? "fill-white stroke-white" : ""} ${
                likePulse ? ENGAGEMENT_BRANDING.like.animations.pop : ""
              }`}
            />
            <span className="flex min-w-[2.5rem] justify-center sm:min-w-[2.75rem]">
              {likeCount === null ? (
                likeLoadError ? (
                  <FrownIcon className="h-4 w-4" />
                ) : (
                  <span className="flex items-center gap-1 text-[11px]">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:120ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:240ms]" />
                  </span>
                )
              ) : likeCount > 0 ? (
                <span className="text-base tabular-nums">{likeCount}</span>
              ) : (
                <span className="text-[11px]">{t(ENGAGEMENT_BRANDING.like.i18nKeys.action)}</span>
              )}
            </span>
          </button>
        </div>

        <div
          className={`relative z-0 transition-transform ${boostCount === null ? "" : "hover:-translate-y-0.5"}`}
        >
          <button
            type="button"
            onClick={handleBoost}
            aria-pressed={hasBoosted}
            disabled={
              boostCount === null ||
              isBoosting ||
              (availableBoosts !== null && availableBoosts === 0 && !hasBoosted)
            }
            className={`relative inline-flex h-11 min-w-[6.5rem] items-center justify-center gap-2 rounded-r-full border border-l-0 border-neutral-200/60 px-3 py-2.5 text-sm leading-none font-semibold transition-all sm:min-w-[8.5rem] sm:gap-3 sm:px-5 dark:border-white/10 ${
              hasBoosted
                ? `${ENGAGEMENT_BRANDING.boost.classes.activeGradient} ${ENGAGEMENT_BRANDING.boost.classes.activeText} ${ENGAGEMENT_BRANDING.boost.classes.activeShadow}`
                : `bg-white ring-1 ring-emerald-500/15 ring-inset ${ENGAGEMENT_BRANDING.boost.classes.inactiveText} dark:bg-white/5 dark:ring-emerald-400/12`
            } ${isBoosting || boostCount === null ? "opacity-80" : ""} ${
              boostCount === null ||
              (availableBoosts !== null && availableBoosts === 0 && !hasBoosted)
                ? "cursor-not-allowed"
                : `cursor-pointer ${ENGAGEMENT_BRANDING.boost.classes.hoverShadow}`
            } ${boostPulse ? ENGAGEMENT_BRANDING.boost.animations.glow : ""}`}
            title={
              availableBoosts !== null && availableBoosts === 0 && !hasBoosted
                ? t(ENGAGEMENT_BRANDING.boost.i18nKeys.noBoostsAvailable)
                : undefined
            }
          >
            <BoltIcon
              className={`h-5 w-5 shrink-0 ${hasBoosted ? "stroke-white" : ""} ${
                boostPulse ? ENGAGEMENT_BRANDING.boost.animations.pop : ""
              }`}
            />
            <span className="flex min-w-[2.5rem] justify-center sm:min-w-[2.75rem]">
              {boostCount === null ? (
                boostLoadError ? (
                  <FrownIcon className="h-4 w-4" />
                ) : (
                  <span className="flex items-center gap-1 text-[11px]">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:120ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:240ms]" />
                  </span>
                )
              ) : boostCount > 0 ? (
                <span className="text-base tabular-nums">{boostCount}</span>
              ) : (
                <span className="text-[11px]">{t(ENGAGEMENT_BRANDING.boost.i18nKeys.action)}</span>
              )}
            </span>
          </button>
        </div>
      </div>

      {(likeRateLimitError || boostRateLimitError) && (
        <div className={ENGAGEMENT_BRANDING.rateLimitError.classes.container}>
          {t("rateLimitError")}
        </div>
      )}
    </div>
  );
}
