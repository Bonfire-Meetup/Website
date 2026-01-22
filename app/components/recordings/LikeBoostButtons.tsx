"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { API_ROUTES } from "@/lib/api/routes";
import { isAccessTokenValid, readAccessToken } from "@/lib/auth/client";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { createAuthHeaders } from "@/lib/utils/http";

import { BoltIcon, FireIcon, FrownIcon } from "../shared/icons";

interface LikeBoostButtonsProps {
  shortId: string;
}

export function LikeBoostButtons({ shortId }: LikeBoostButtonsProps) {
  const t = useTranslations("recordings");
  const router = useRouter();
  const [likeCount, setLikeCount] = useState<number | null>(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [likePulse, setLikePulse] = useState(false);
  const [likeLoadError, setLikeLoadError] = useState(false);
  const [boostCount, setBoostCount] = useState<number | null>(null);
  const [hasBoosted, setHasBoosted] = useState(false);
  const [isBoosting, setIsBoosting] = useState(false);
  const [boostPulse, setBoostPulse] = useState(false);
  const [boostLoadError, setBoostLoadError] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const token = readAccessToken();

    if (token && isAccessTokenValid(token)) {
      setAccessToken(token);
    } else {
      setAccessToken(null);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadLikes = async () => {
      try {
        setLikeLoadError(false);
        const response = await fetch(API_ROUTES.VIDEO.LIKES(shortId));

        if (!response.ok) {
          if (isActive) {
            setLikeLoadError(true);
          }

          return;
        }

        const data = (await response.json()) as { count: number; hasLiked: boolean };

        if (isActive) {
          setLikeCount(data.count ?? 0);
          setHasLiked(Boolean(data.hasLiked));
        }
      } catch {
        if (isActive) {
          setLikeLoadError(true);
        }
      }
    };

    loadLikes();

    return () => {
      isActive = false;
    };
  }, [shortId]);

  useEffect(() => {
    let isActive = true;

    const loadBoosts = async () => {
      try {
        setBoostLoadError(false);
        const response = await fetch(API_ROUTES.VIDEO.BOOSTS(shortId), {
          headers: createAuthHeaders(accessToken),
        });

        if (!response.ok) {
          if (isActive) {
            setBoostLoadError(true);
          }

          return;
        }

        const data = (await response.json()) as { count: number; hasBoosted: boolean };

        if (isActive) {
          setBoostCount(data.count ?? 0);
          setHasBoosted(Boolean(data.hasBoosted));
        }
      } catch {
        if (isActive) {
          setBoostLoadError(true);
        }
      }
    };

    loadBoosts();

    return () => {
      isActive = false;
    };
  }, [shortId, accessToken]);

  const handleLike = async () => {
    if (isLiking) {
      return;
    }

    setIsLiking(true);
    setLikePulse(true);
    setTimeout(() => setLikePulse(false), 550);

    const prevLiked = hasLiked;
    const prevCount = likeCount;
    const adding = !hasLiked;

    setHasLiked(adding);
    setLikeCount((c) => (c ?? 0) + (adding ? 1 : -1));

    try {
      const res = await fetch(API_ROUTES.VIDEO.LIKES(shortId), {
        method: adding ? "POST" : "DELETE",
      });

      if (!res.ok) {
        setHasLiked(prevLiked);
        setLikeCount(prevCount);

        return;
      }

      const { count } = (await res.json()) as { count: number };
      setLikeCount(count);
    } catch {
      setHasLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleBoost = async () => {
    if (!accessToken) {
      router.push(PAGE_ROUTES.LOGIN_WITH_REASON("video-boost"));

      return;
    }

    if (isBoosting) {
      return;
    }

    setIsBoosting(true);
    setBoostPulse(true);
    setTimeout(() => setBoostPulse(false), 550);

    const prevBoosted = hasBoosted;
    const prevCount = boostCount;
    const adding = !hasBoosted;

    setHasBoosted(adding);
    setBoostCount((c) => (c ?? 0) + (adding ? 1 : -1));

    try {
      const res = await fetch(API_ROUTES.VIDEO.BOOSTS(shortId), {
        headers: createAuthHeaders(accessToken),
        method: adding ? "POST" : "DELETE",
      });

      if (!res.ok) {
        setHasBoosted(prevBoosted);
        setBoostCount(prevCount);

        return;
      }

      const { count } = (await res.json()) as { count: number };
      setBoostCount(count);
    } catch {
      setHasBoosted(prevBoosted);
      setBoostCount(prevCount);
    } finally {
      setIsBoosting(false);
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
          disabled={boostCount === null || isBoosting}
          className={`relative inline-flex h-11 min-w-[8.5rem] items-center justify-center gap-3 rounded-r-full border border-l-0 border-neutral-200/60 px-5 py-2.5 text-sm leading-none font-semibold transition-shadow dark:border-white/10 ${
            hasBoosted
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/30"
              : "bg-white text-emerald-600 dark:bg-white/5 dark:text-emerald-400"
          } ${isBoosting || boostCount === null ? "opacity-80" : ""} ${
            boostCount === null
              ? "cursor-not-allowed"
              : "cursor-pointer hover:shadow-emerald-500/20"
          }`}
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
