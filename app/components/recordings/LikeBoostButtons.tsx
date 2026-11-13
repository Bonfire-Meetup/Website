"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";

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
import { useHaptics } from "@/lib/utils/haptics";

import { BoltIcon, FireIcon, FrownIcon } from "../shared/Icons";

type EngagementKind = "like" | "boost";

interface EngagementFx {
  adding: boolean;
  id: number;
}

interface Spark {
  delayMs: number;
  rotationDeg: number;
  x: number;
  y: number;
}

const FX_DURATION_MS = 1000;

const LIKE_SPARKS: Spark[] = [
  { delayMs: 0, rotationDeg: 0, x: -52, y: -18 },
  { delayMs: 30, rotationDeg: 0, x: -38, y: -44 },
  { delayMs: 70, rotationDeg: 0, x: -18, y: -58 },
  { delayMs: 10, rotationDeg: 0, x: 0, y: -66 },
  { delayMs: 50, rotationDeg: 0, x: 20, y: -56 },
  { delayMs: 20, rotationDeg: 0, x: 40, y: -40 },
  { delayMs: 80, rotationDeg: 0, x: 54, y: -14 },
  { delayMs: 110, rotationDeg: 0, x: -28, y: -24 },
  { delayMs: 130, rotationDeg: 0, x: 26, y: -26 },
  { delayMs: 160, rotationDeg: 0, x: -8, y: -38 },
];

const BOOST_SPARKS: Spark[] = Array.from({ length: 10 }, (_, index) => {
  const angleDeg = index * 36 - 90;
  const distance = index % 2 === 0 ? 62 : 46;
  const angleRad = (angleDeg * Math.PI) / 180;

  return {
    delayMs: (index % 3) * 30,
    rotationDeg: angleDeg,
    x: Math.round(Math.cos(angleRad) * distance),
    y: Math.round(Math.sin(angleRad) * distance),
  };
});

const ENGAGEMENT_THEME = {
  boost: {
    activeGradient: ENGAGEMENT_BRANDING.boost.classes.activeGradient,
    activeShadow: ENGAGEMENT_BRANDING.boost.classes.activeShadow,
    bloom:
      "bg-[radial-gradient(closest-side,rgba(52,211,153,0.8),rgba(20,184,166,0.4)_55%,transparent)]",
    hoverShadow: ENGAGEMENT_BRANDING.boost.classes.hoverShadow,
    idle: "bg-gradient-to-b from-emerald-50 to-teal-100/80 text-emerald-700 shadow-[0_10px_20px_-14px_rgba(16,185,129,0.6)] ring-1 ring-emerald-500/45 ring-inset hover:from-emerald-100 hover:to-teal-100 dark:from-emerald-500/16 dark:to-emerald-500/8 dark:text-emerald-300 dark:ring-emerald-400/35 dark:hover:from-emerald-500/24 dark:hover:to-emerald-500/12",
    ring: "border-emerald-400/80",
    rounded: "rounded-r-full",
    side: "border-l-0",
    sparkColors: ["bg-emerald-400", "bg-teal-300", "bg-lime-300"],
    sparkShape: "h-[3px] w-3 rounded-full shadow-[0_0_8px_1px_rgba(52,211,153,0.8)]",
    sparks: BOOST_SPARKS,
  },
  like: {
    activeGradient: ENGAGEMENT_BRANDING.like.classes.activeGradient,
    activeShadow: ENGAGEMENT_BRANDING.like.classes.activeShadow,
    bloom:
      "bg-[radial-gradient(closest-side,rgba(251,146,60,0.8),rgba(244,63,94,0.4)_55%,transparent)]",
    hoverShadow: ENGAGEMENT_BRANDING.like.classes.hoverShadow,
    idle: "bg-gradient-to-b from-orange-50 to-rose-100/80 text-rose-600 shadow-[0_10px_20px_-14px_rgba(244,63,94,0.6)] ring-1 ring-rose-400/45 ring-inset hover:from-orange-100 hover:to-rose-100 dark:from-rose-500/16 dark:to-rose-500/8 dark:text-rose-300 dark:ring-rose-400/35 dark:hover:from-rose-500/24 dark:hover:to-rose-500/12",
    ring: "border-orange-400/80",
    rounded: "rounded-l-full",
    side: "border-r-0",
    sparkColors: ["bg-orange-400", "bg-amber-300", "bg-rose-500"],
    sparkShape: "h-1.5 w-1.5 rounded-full shadow-[0_0_8px_2px_rgba(251,146,60,0.8)]",
    sparks: LIKE_SPARKS,
  },
} as const;

function EngagementButton({
  kind,
  active,
  bothActive,
  count,
  disabled,
  fx,
  hasLoadError,
  instantFill,
  isUnavailable,
  label,
  onClick,
  title,
}: {
  kind: EngagementKind;
  active: boolean;
  bothActive: boolean;
  count: number | null;
  disabled: boolean;
  fx: EngagementFx | null;
  hasLoadError: boolean;
  instantFill: boolean;
  isUnavailable: boolean;
  label: string;
  onClick: () => void;
  title?: string;
}) {
  const theme = ENGAGEMENT_THEME[kind];
  const Icon = kind === "like" ? FireIcon : BoltIcon;
  const isBurst = fx?.adding === true;

  let surfaceClass: string = theme.idle;
  if (bothActive) {
    surfaceClass = "!border-transparent bg-transparent text-white shadow-none";
  } else if (active) {
    surfaceClass = `${theme.idle} !text-white ${theme.activeShadow}`;
  }

  let pressClass = "";
  if (fx) {
    pressClass = fx.id % 2 === 0 ? "engage-press-a" : "engage-press-b";
  }

  let iconFxClass = "";
  if (fx) {
    iconFxClass = fx.adding ? "engage-icon-ignite" : "engage-icon-release";
  }

  let iconActiveClass = "";
  if (active) {
    iconActiveClass = kind === "like" ? "fill-white stroke-white" : "stroke-white";
  }

  return (
    <div className={`relative z-10 ${pressClass}`}>
      {isBurst && (
        <span
          key={`burst-${fx.id}`}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <span
            className={`engage-bloom absolute -inset-4 -z-10 rounded-full blur-md ${theme.bloom}`}
          />
          <span
            className={`engage-ring absolute inset-0 border-2 ${theme.rounded} ${theme.ring}`}
          />
          <span
            className={`engage-ring engage-ring-late absolute inset-0 border ${theme.rounded} ${theme.ring}`}
          />
        </span>
      )}

      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        disabled={disabled}
        title={title}
        className={`relative inline-flex h-11 min-w-[6.5rem] items-center justify-center gap-2 border border-neutral-200/60 px-3 py-2.5 text-sm leading-none font-semibold transition-[color,box-shadow,border-color] duration-300 sm:min-w-[8.5rem] sm:gap-3 sm:px-5 dark:border-white/10 ${theme.rounded} ${theme.side} ${surfaceClass} ${
          count === null ? "opacity-80" : ""
        } ${isUnavailable ? "cursor-not-allowed" : `cursor-pointer ${bothActive ? "" : theme.hoverShadow}`}`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 transition-opacity ${theme.rounded} ${theme.activeGradient} ${
            instantFill ? "duration-0" : "duration-300"
          } ${active && !bothActive ? "opacity-100" : "opacity-0"}`}
        />

        {isBurst && (
          <span
            key={`sheen-${fx.id}`}
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 overflow-hidden ${theme.rounded}`}
          >
            <span className="engage-sheen absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          </span>
        )}

        <span className="relative z-10 inline-flex">
          <span key={fx?.id ?? "idle"} className={`inline-flex ${iconFxClass}`}>
            <Icon className={`h-5 w-5 shrink-0 ${iconActiveClass}`} />
          </span>

          {isBurst && (
            <span
              key={`sparks-${fx.id}`}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2"
            >
              {theme.sparks.map((spark, index) => (
                <span
                  key={`${spark.x}:${spark.y}`}
                  className={`engage-spark absolute -top-0.5 -left-0.5 ${theme.sparkShape} ${theme.sparkColors[index % theme.sparkColors.length]}`}
                  style={
                    {
                      "--spark-r": `${spark.rotationDeg}deg`,
                      "--spark-x": `${spark.x}px`,
                      "--spark-y": `${spark.y}px`,
                      animationDelay: `${spark.delayMs}ms`,
                    } as CSSProperties
                  }
                />
              ))}
            </span>
          )}
        </span>

        <span className="relative z-10 flex min-w-[3.75rem] justify-center sm:min-w-[4.75rem]">
          {count === null ? (
            hasLoadError ? (
              <FrownIcon className="h-4 w-4" />
            ) : (
              <span className="text-2xs flex items-center gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:240ms]" />
              </span>
            )
          ) : (
            <span key={count} className={`inline-flex ${fx ? "engage-count" : ""}`}>
              {count > 0 ? (
                <span className="text-base font-bold tabular-nums">{count}</span>
              ) : (
                <span className="text-xs whitespace-nowrap sm:text-sm">{label}</span>
              )}
            </span>
          )}
        </span>
      </button>
    </div>
  );
}

interface LikeBoostButtonsProps {
  gatedBoostActionHref?: string;
  gatedLikeActionHref?: string;
  hasInteractionAccess?: boolean;
  onBoostedByLoad?: (boostedBy: BoostedByData | null) => void;
  shortId: string;
}

export function LikeBoostButtons({
  gatedBoostActionHref,
  gatedLikeActionHref,
  hasInteractionAccess = true,
  onBoostedByLoad,
  shortId,
}: LikeBoostButtonsProps) {
  const t = useTranslations("recordings");
  const router = useRouter();
  const pathname = usePathname();
  const haptics = useHaptics();
  const { engagement, setLikes, setBoosts } = useVideoEngagementRedux(shortId);

  const [likeFx, setLikeFx] = useState<EngagementFx | null>(null);
  const [boostFx, setBoostFx] = useState<EngagementFx | null>(null);
  const fxCounterRef = useRef(0);
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
  const bothActive = hasLiked && hasBoosted;

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

  const pulse = (kind: EngagementKind, adding: boolean) => {
    fxCounterRef.current += 1;
    const fx = { adding, id: fxCounterRef.current };
    const setFx = kind === "like" ? setLikeFx : setBoostFx;

    setFx(fx);
    timeoutsRef.current.push(
      window.setTimeout(
        () => setFx((current) => (current?.id === fx.id ? null : current)),
        FX_DURATION_MS,
      ),
    );
  };

  const handleLike = async () => {
    if (!hasInteractionAccess) {
      haptics.neutral();
      if (gatedLikeActionHref) {
        router.push(gatedLikeActionHref);
      }
      return;
    }

    if (!shortId || isLiking || likeCount === null) {
      haptics.neutral();
      return;
    }

    const adding = !hasLiked;
    pulse("like", adding);
    if (adding) {
      haptics.success();
    } else {
      haptics.neutral();
    }

    try {
      await likeMutation.mutateAsync(adding);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 429) {
        haptics.error();
        handleRateLimitError(setLikeRateLimitError, likeErrorTimeoutRef);
      } else {
        haptics.error();
      }
    }
  };

  const handleBoost = async () => {
    const query = typeof window === "undefined" ? "" : window.location.search.slice(1);
    const returnPath = `${pathname}${query ? `?${query}` : ""}`;

    if (!hasInteractionAccess) {
      haptics.neutral();
      if (gatedBoostActionHref) {
        router.push(gatedBoostActionHref);
      }
      return;
    }

    if (!getHasValidToken()) {
      haptics.neutral();
      router.push(PAGE_ROUTES.LOGIN_WITH_REASON_AND_RETURN(LOGIN_REASON.VIDEO_BOOST, returnPath));
      return;
    }

    if (!shortId || isBoosting || boostCount === null) {
      haptics.neutral();
      return;
    }

    if (availableBoosts !== null && availableBoosts === 0 && !hasBoosted) {
      haptics.error();
      return;
    }

    const adding = !hasBoosted;
    pulse("boost", adding);
    if (adding) {
      haptics.success();
    } else {
      haptics.neutral();
    }

    try {
      await boostMutation.mutateAsync(adding);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        haptics.neutral();
        router.push(PAGE_ROUTES.LOGIN_WITH_REASON_AND_RETURN(LOGIN_REASON.VIDEO_BOOST, returnPath));
        return;
      }

      if (err instanceof ApiError && err.status === 403) {
        boostsQuery.refetch();
      }

      if (err instanceof ApiError && err.status === 429) {
        haptics.error();
        handleRateLimitError(setBoostRateLimitError, boostErrorTimeoutRef);
      } else {
        haptics.error();
      }
    }
  };

  const isBoostUnavailable = availableBoosts !== null && availableBoosts === 0 && !hasBoosted;

  return (
    <div className="space-y-3">
      <div
        className={`group relative isolate inline-flex ${bothActive ? "rounded-full shadow-[0_14px_30px_-14px_rgba(245,158,11,0.72),0_16px_34px_-16px_rgba(16,185,129,0.72),0_0_0_1px_rgba(255,255,255,0.22)]" : ""}`}
      >
        {bothActive ? (
          <>
            <span
              aria-hidden="true"
              className="engage-fade-in pointer-events-none absolute inset-0 z-0 rounded-full bg-[linear-gradient(90deg,#f97316_0%,#facc15_42%,#4ade80_62%,#10b981_100%)]"
            />
            <span
              aria-hidden="true"
              className="both-active-aura engage-fade-in pointer-events-none absolute -inset-1 z-[1] rounded-full"
            />
            <span
              aria-hidden="true"
              className="both-active-sheen engage-fade-in pointer-events-none absolute inset-0 z-[2] rounded-full"
            />
          </>
        ) : null}

        <EngagementButton
          kind="like"
          active={hasLiked}
          bothActive={bothActive}
          count={likeCount}
          disabled={isLiking || likeCount === null}
          fx={likeFx}
          hasLoadError={likeLoadError}
          instantFill={boostFx?.adding === false}
          isUnavailable={likeCount === null}
          label={t(ENGAGEMENT_BRANDING.like.i18nKeys.action)}
          onClick={handleLike}
        />

        <EngagementButton
          kind="boost"
          active={hasBoosted}
          bothActive={bothActive}
          count={boostCount}
          disabled={boostCount === null || isBoosting || isBoostUnavailable}
          fx={boostFx}
          hasLoadError={boostLoadError}
          instantFill={likeFx?.adding === false}
          isUnavailable={boostCount === null || isBoostUnavailable}
          label={t(ENGAGEMENT_BRANDING.boost.i18nKeys.action)}
          onClick={handleBoost}
          title={
            isBoostUnavailable ? t(ENGAGEMENT_BRANDING.boost.i18nKeys.noBoostsAvailable) : undefined
          }
        />
      </div>

      {(likeRateLimitError || boostRateLimitError) && (
        <div className={ENGAGEMENT_BRANDING.rateLimitError.classes.container}>
          {t("rateLimitError")}
        </div>
      )}
    </div>
  );
}
