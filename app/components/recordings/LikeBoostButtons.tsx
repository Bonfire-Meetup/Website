"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { ApiError } from "@/lib/api/errors";
import {
  type BoostedByData,
  useVideoBoostMutation,
  useVideoBoosts,
  useVideoLikeMutation,
  useVideoLikes,
} from "@/lib/api/video-engagement";
import { isAccessTokenValid, readAccessToken } from "@/lib/auth/client";
import { useVideoEngagementRedux } from "@/lib/redux/hooks";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { BoltIcon, FireIcon, FrownIcon } from "../shared/icons";

interface LikeBoostButtonsProps {
  onBoostedByLoad?: (boostedBy: BoostedByData | null) => void;
  shortId: string;
}

function getHasValidToken(): boolean {
  const token = readAccessToken();
  return token ? isAccessTokenValid(token) : false;
}

export function LikeBoostButtons({ onBoostedByLoad, shortId }: LikeBoostButtonsProps) {
  const t = useTranslations("recordings");
  const router = useRouter();
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
  const availableBoosts = engagement?.boosts.availableBoosts ?? boostsQuery.data?.availableBoosts ?? null;
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
        if (likeErrorTimeoutRef.current) {
          window.clearTimeout(likeErrorTimeoutRef.current);
        }
        setLikeRateLimitError(true);
        likeErrorTimeoutRef.current = window.setTimeout(() => {
          setLikeRateLimitError(false);
          likeErrorTimeoutRef.current = null;
        }, 5000);
      }
    }
  };

  const handleBoost = async () => {
    if (!getHasValidToken()) {
      router.push(PAGE_ROUTES.LOGIN_WITH_REASON("video-boost"));
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
        router.push(PAGE_ROUTES.LOGIN_WITH_REASON("video-boost"));
        return;
      }

      if (err instanceof ApiError && err.status === 403) {
        boostsQuery.refetch();
      }

      if (err instanceof ApiError && err.status === 429) {
        if (boostErrorTimeoutRef.current) {
          window.clearTimeout(boostErrorTimeoutRef.current);
        }
        setBoostRateLimitError(true);
        boostErrorTimeoutRef.current = window.setTimeout(() => {
          setBoostRateLimitError(false);
          boostErrorTimeoutRef.current = null;
        }, 5000);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="group relative inline-flex">
        <div
          className={`relative z-0 transition-transform ${likeCount === null ? "" : "hover:-translate-y-0.5"
            }`}
        >
          <button
            type="button"
            onClick={handleLike}
            aria-pressed={hasLiked}
            disabled={isLiking || likeCount === null}
            className={`relative inline-flex h-11 min-w-[8.5rem] items-center justify-center gap-3 rounded-l-full border border-r-0 border-neutral-200/60 px-5 py-2.5 text-sm leading-none font-semibold transition-all dark:border-white/10 ${hasLiked
              ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/50"
              : "bg-white text-rose-400 dark:bg-white/5 dark:text-rose-300"
              } ${isLiking || likeCount === null ? "opacity-80" : ""} ${likeCount === null ? "cursor-not-allowed" : "cursor-pointer hover:shadow-rose-500/30"
              } ${likePulse ? "like-glow" : ""}`}
          >
            <span className="pointer-events-none absolute top-2 right-0 bottom-2 w-px bg-white/80 opacity-70 transition-opacity group-hover:opacity-0 dark:bg-white/25" />
            <FireIcon
              className={`h-5 w-5 shrink-0 ${hasLiked ? "fill-white stroke-white" : ""} ${likePulse ? "like-pop" : ""
                }`}
            />
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
              <span className="text-[11px]">{t("lightItUp")}</span>
            )}
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
            className={`relative inline-flex h-11 min-w-[8.5rem] items-center justify-center gap-3 rounded-r-full border border-l-0 border-neutral-200/60 px-5 py-2.5 text-sm leading-none font-semibold transition-all dark:border-white/10 ${hasBoosted
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/60"
              : "bg-white text-emerald-600 dark:bg-white/5 dark:text-emerald-400"
              } ${isBoosting || boostCount === null ? "opacity-80" : ""} ${boostCount === null ||
                (availableBoosts !== null && availableBoosts === 0 && !hasBoosted)
                ? "cursor-not-allowed"
                : "cursor-pointer hover:shadow-emerald-500/40"
              } ${boostPulse ? "boost-glow" : ""}`}
            title={
              availableBoosts !== null && availableBoosts === 0 && !hasBoosted
                ? t("boostNoBoostsAvailable")
                : undefined
            }
          >
            <BoltIcon
              className={`h-5 w-5 shrink-0 ${hasBoosted ? "stroke-white" : ""} ${boostPulse ? "boost-pop" : ""
                }`}
            />
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
              <span className="text-[11px]">{t("boostItUp")}</span>
            )}
          </button>
        </div>
      </div>

      {(likeRateLimitError || boostRateLimitError) && (
        <div className="animate-in fade-in slide-in-from-top-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          {t("rateLimitError")}
        </div>
      )}
    </div>
  );
}
