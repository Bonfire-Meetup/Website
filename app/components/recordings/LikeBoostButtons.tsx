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

  const [likePulse, setLikePulse] = useState(false);
  const [boostPulse, setBoostPulse] = useState(false);

  const timeoutsRef = useRef<number[]>([]);
  useEffect(
    () => () => {
      for (const id of timeoutsRef.current) {
        window.clearTimeout(id);
      }
      timeoutsRef.current = [];
    },
    [],
  );

  // Likes are public
  const likesQuery = useVideoLikes(shortId);

  // Boosts are auth-gated server-side; query can still run and return public-ish data if your API supports it.
  // If your boosts endpoint requires auth always, make the hook use enabled based on auth state instead.
  const boostsQuery = useVideoBoosts(shortId);

  const likeMutation = useVideoLikeMutation(shortId);
  const boostMutation = useVideoBoostMutation(shortId);

  const likeCount = likesQuery.data?.count ?? null;
  const hasLiked = likesQuery.data?.hasLiked ?? false;
  const likeLoadError = likesQuery.isError;
  const isLiking = likeMutation.isPending;

  const boostCount = boostsQuery.data?.count ?? null;
  const hasBoosted = boostsQuery.data?.hasBoosted ?? false;
  const availableBoosts = boostsQuery.data?.availableBoosts ?? null;
  const boostLoadError = boostsQuery.isError;
  const isBoosting = boostMutation.isPending;

  const boostedByOrNull = useMemo(() => {
    if (!boostsQuery.data) {
      return undefined;
    }
    return boostsQuery.data.boostedBy ?? null;
  }, [boostsQuery.data]);

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
      timeoutsRef.current.push(window.setTimeout(() => setLikePulse(false), 550));
    } else {
      setBoostPulse(true);
      timeoutsRef.current.push(window.setTimeout(() => setBoostPulse(false), 550));
    }
  };

  const handleLike = async () => {
    // Likes are public; no token checks
    if (!shortId || isLiking || likeCount === null) {
      return;
    }

    pulse("like");
    const adding = !hasLiked;

    try {
      await likeMutation.mutateAsync(adding);
    } catch {
      // Handled by mutation onError
    }
  };

  const handleBoost = async () => {
    // Boosts are gated by login
    if (!getHasValidToken()) {
      router.push(PAGE_ROUTES.LOGIN_WITH_REASON("video-boost"));
      return;
    }

    if (!shortId || isBoosting || boostCount === null) {
      return;
    }

    // Keep your UI rule: don't allow adding if no boosts left (but allow removing)
    if (availableBoosts !== null && availableBoosts === 0 && !hasBoosted) {
      return;
    }

    pulse("boost");
    const adding = !hasBoosted;

    try {
      await boostMutation.mutateAsync(adding);
    } catch (err: unknown) {
      // If token expired between check and request
      if (err instanceof ApiError && err.status === 401) {
        router.push(PAGE_ROUTES.LOGIN_WITH_REASON("video-boost"));
        return;
      }

      // If backend says "forbidden" (often "no boosts left" or similar),
      // Refetch to sync availableBoosts + counts.
      if (err instanceof ApiError && err.status === 403) {
        // If your backend returns { availableBoosts } in ApiError.data, this is where it is.
        // We don't need branching; just sync.
        boostsQuery.refetch();
      }
    }
  };

  return (
    <div className="group relative inline-flex">
      <div
        className={`relative z-0 transition-transform ${likeCount === null ? "" : "hover:-translate-y-0.5"}`}
      >
        <button
          type="button"
          onClick={handleLike}
          aria-pressed={hasLiked}
          disabled={isLiking || likeCount === null}
          className={`relative inline-flex h-11 min-w-[8.5rem] items-center justify-center gap-3 rounded-l-full border border-r-0 border-neutral-200/60 px-5 py-2.5 text-sm leading-none font-semibold transition-shadow dark:border-white/10 ${
            hasLiked
              ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-orange-500/30"
              : "bg-white text-rose-400 dark:bg-white/5 dark:text-rose-300"
          } ${isLiking || likeCount === null ? "opacity-80" : ""} ${
            likeCount === null ? "cursor-not-allowed" : "cursor-pointer hover:shadow-rose-500/20"
          }`}
        >
          <span className="pointer-events-none absolute top-2 right-0 bottom-2 w-px bg-white/80 opacity-70 transition-opacity group-hover:opacity-0 dark:bg-white/25" />
          <FireIcon
            className={`h-5 w-5 shrink-0 ${hasLiked ? "fill-white stroke-white" : ""} ${
              likePulse ? "like-pop" : ""
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
          className={`relative inline-flex h-11 min-w-[8.5rem] items-center justify-center gap-3 rounded-r-full border border-l-0 border-neutral-200/60 px-5 py-2.5 text-sm leading-none font-semibold transition-shadow dark:border-white/10 ${
            hasBoosted
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/30"
              : "bg-white text-emerald-600 dark:bg-white/5 dark:text-emerald-400"
          } ${isBoosting || boostCount === null ? "opacity-80" : ""} ${
            boostCount === null ||
            (availableBoosts !== null && availableBoosts === 0 && !hasBoosted)
              ? "cursor-not-allowed"
              : "cursor-pointer hover:shadow-emerald-500/20"
          }`}
          title={
            availableBoosts !== null && availableBoosts === 0 && !hasBoosted
              ? t("boostNoBoostsAvailable")
              : undefined
          }
        >
          <BoltIcon
            className={`h-5 w-5 shrink-0 ${hasBoosted ? "stroke-white" : ""} ${
              boostPulse ? "like-pop" : ""
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
  );
}
