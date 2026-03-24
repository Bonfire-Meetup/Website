"use client";

import { useCallback } from "react";

import type { BoostedByData } from "@/lib/api/video-engagement";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  setVideoLikes,
  setVideoBoosts,
  toggleLike,
  toggleBoost,
} from "@/lib/redux/slices/videoEngagementSlice";

export function useVideoEngagementRedux(shortId: string) {
  const dispatch = useAppDispatch();
  const engagement = useAppSelector((state) => state.videoEngagement[shortId] || null);
  const setLikes = useCallback(
    (count: number, hasLiked: boolean) => {
      dispatch(setVideoLikes({ shortId, count, hasLiked }));
    },
    [dispatch, shortId],
  );
  const setBoosts = useCallback(
    (
      count: number,
      hasBoosted: boolean,
      availableBoosts?: number,
      boostedBy?: BoostedByData | null,
    ) => {
      dispatch(setVideoBoosts({ shortId, count, hasBoosted, availableBoosts, boostedBy }));
    },
    [dispatch, shortId],
  );
  const toggleLikeState = useCallback(
    (adding: boolean) => {
      dispatch(toggleLike({ shortId, adding }));
    },
    [dispatch, shortId],
  );
  const toggleBoostState = useCallback(
    (adding: boolean) => {
      dispatch(toggleBoost({ shortId, adding }));
    },
    [dispatch, shortId],
  );

  return {
    engagement,
    setLikes,
    setBoosts,
    toggleLike: toggleLikeState,
    toggleBoost: toggleBoostState,
  };
}
