import type { BoostedByData } from "@/lib/api/video-engagement";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type VideoEngagementState = Record<
    string,
    {
        likes: {
            count: number;
            hasLiked: boolean;
            loading: boolean;
            error: string | null;
        };
        boosts: {
            count: number;
            hasBoosted: boolean;
            availableBoosts: number | null;
            boostedBy: BoostedByData | null;
            loading: boolean;
            error: string | null;
        };
    }
>;

const initialState: VideoEngagementState = {};

const videoEngagementSlice = createSlice({
    name: "videoEngagement",
    initialState,
    reducers: {
        setVideoLikes: (
            state,
            action: PayloadAction<{
                shortId: string;
                count: number;
                hasLiked: boolean;
            }>,
        ) => {
            const { shortId, count, hasLiked } = action.payload;
            if (!state[shortId]) {
                state[shortId] = {
                    likes: { count: 0, hasLiked: false, loading: false, error: null },
                    boosts: {
                        count: 0,
                        hasBoosted: false,
                        availableBoosts: null,
                        boostedBy: null,
                        loading: false,
                        error: null,
                    },
                };
            }
            state[shortId].likes = { count, hasLiked, loading: false, error: null };
        },
        toggleLike: (state, action: PayloadAction<{ shortId: string; adding: boolean }>) => {
            const { shortId, adding } = action.payload;
            if (state[shortId]?.likes) {
                state[shortId].likes.hasLiked = adding;
                state[shortId].likes.count = Math.max(0, state[shortId].likes.count + (adding ? 1 : -1));
            }
        },
        setVideoBoosts: (
            state,
            action: PayloadAction<{
                shortId: string;
                count: number;
                hasBoosted: boolean;
                availableBoosts?: number;
                boostedBy?: BoostedByData | null;
            }>,
        ) => {
            const { shortId, count, hasBoosted, availableBoosts, boostedBy } = action.payload;
            if (!state[shortId]) {
                state[shortId] = {
                    likes: { count: 0, hasLiked: false, loading: false, error: null },
                    boosts: {
                        count: 0,
                        hasBoosted: false,
                        availableBoosts: null,
                        boostedBy: null,
                        loading: false,
                        error: null,
                    },
                };
            }
            state[shortId].boosts = {
                count,
                hasBoosted,
                availableBoosts: availableBoosts ?? null,
                boostedBy: boostedBy ?? null,
                loading: false,
                error: null,
            };
        },
        toggleBoost: (state, action: PayloadAction<{ shortId: string; adding: boolean }>) => {
            const { shortId, adding } = action.payload;
            if (state[shortId]?.boosts) {
                state[shortId].boosts.hasBoosted = adding;
                state[shortId].boosts.count = Math.max(0, state[shortId].boosts.count + (adding ? 1 : -1));
            }
        },
        setVideoLikesLoading: (state, action: PayloadAction<{ shortId: string; loading: boolean }>) => {
            const { shortId, loading } = action.payload;
            if (!state[shortId]) {
                state[shortId] = {
                    likes: { count: 0, hasLiked: false, loading: false, error: null },
                    boosts: {
                        count: 0,
                        hasBoosted: false,
                        availableBoosts: null,
                        boostedBy: null,
                        loading: false,
                        error: null,
                    },
                };
            }
            state[shortId].likes.loading = loading;
        },
        setVideoBoostsLoading: (
            state,
            action: PayloadAction<{ shortId: string; loading: boolean }>,
        ) => {
            const { shortId, loading } = action.payload;
            if (!state[shortId]) {
                state[shortId] = {
                    likes: { count: 0, hasLiked: false, loading: false, error: null },
                    boosts: {
                        count: 0,
                        hasBoosted: false,
                        availableBoosts: null,
                        boostedBy: null,
                        loading: false,
                        error: null,
                    },
                };
            }
            state[shortId].boosts.loading = loading;
        },
        setVideoLikesError: (
            state,
            action: PayloadAction<{ shortId: string; error: string | null }>,
        ) => {
            const { shortId, error } = action.payload;
            if (state[shortId]?.likes) {
                state[shortId].likes.error = error;
            }
        },
        setVideoBoostsError: (
            state,
            action: PayloadAction<{ shortId: string; error: string | null }>,
        ) => {
            const { shortId, error } = action.payload;
            if (state[shortId]?.boosts) {
                state[shortId].boosts.error = error;
            }
        },
        clearVideoEngagement: (state, action: PayloadAction<string>) => {
            delete state[action.payload];
        },
    },
});

export const {
    setVideoLikes,
    toggleLike,
    setVideoBoosts,
    toggleBoost,
    setVideoLikesLoading,
    setVideoBoostsLoading,
    setVideoLikesError,
    setVideoBoostsError,
    clearVideoEngagement,
} = videoEngagementSlice.actions;

export default videoEngagementSlice.reducer;
