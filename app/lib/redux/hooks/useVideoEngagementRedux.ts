"use client";

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

  return {
    engagement,
    setLikes: (count: number, hasLiked: boolean) => {
      dispatch(setVideoLikes({ shortId, count, hasLiked }));
    },
    setBoosts: (
      count: number,
      hasBoosted: boolean,
      availableBoosts?: number,
      boostedBy?: BoostedByData | null,
    ) => {
      dispatch(setVideoBoosts({ shortId, count, hasBoosted, availableBoosts, boostedBy }));
    },
    toggleLike: (adding: boolean) => {
      dispatch(toggleLike({ shortId, adding }));
    },
    toggleBoost: (adding: boolean) => {
      dispatch(toggleBoost({ shortId, adding }));
    },
  };
}
