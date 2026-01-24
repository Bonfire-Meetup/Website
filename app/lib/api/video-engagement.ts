import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import { API_ROUTES } from "@/lib/api/routes";
import { isAccessTokenValid, readAccessToken } from "@/lib/auth/client";
import { createAuthHeaders } from "@/lib/utils/http";
import { logError } from "@/lib/utils/log-client";

interface BoostedByData {
  publicUsers: {
    userId: string;
    name: string | null;
    emailHash: string;
  }[];
  privateCount: number;
}

interface VideoLikesData {
  count: number;
  hasLiked: boolean;
}

interface VideoBoostsData {
  boostedBy?: BoostedByData;
  count: number;
  hasBoosted: boolean;
  availableBoosts?: number;
}

async function fetchVideoLikes(shortId: string): Promise<VideoLikesData> {
  const response = await fetch(API_ROUTES.VIDEO.LIKES(shortId));

  if (!response.ok) {
    throw new ApiError("Video likes fetch failed", response.status);
  }

  return response.json() as Promise<VideoLikesData>;
}

async function fetchVideoBoosts(
  shortId: string,
  accessToken: string | null,
): Promise<VideoBoostsData> {
  const response = await fetch(API_ROUTES.VIDEO.BOOSTS(shortId), {
    headers: createAuthHeaders(accessToken),
  });

  if (!response.ok) {
    throw new ApiError("Video boosts fetch failed", response.status);
  }

  return response.json() as Promise<VideoBoostsData>;
}

export function useVideoLikes(shortId: string) {
  const canFetch = Boolean(shortId);

  return useQuery({
    enabled: canFetch,
    queryFn: () => fetchVideoLikes(shortId),
    queryKey: ["video-likes", shortId],
    staleTime: 5000,
  });
}

export function useVideoBoosts(shortId: string, enabled = true) {
  const canFetch = Boolean(shortId) && enabled;

  const accessToken = readAccessToken();
  const isValid = accessToken ? isAccessTokenValid(accessToken) : false;
  const tokenForRequest = isValid ? accessToken : null;

  return useQuery({
    enabled: canFetch,
    queryFn: () => fetchVideoBoosts(shortId, tokenForRequest),
    queryKey: ["video-boosts", shortId, tokenForRequest ? "auth" : "anon"],
    staleTime: 5000,
  });
}

export function useVideoLikeMutation(shortId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ count: number }, ApiError, boolean>({
    mutationFn: async (adding) => {
      if (!shortId) {
        throw new ApiError("Missing shortId", 400);
      }

      const response = await fetch(API_ROUTES.VIDEO.LIKES(shortId), {
        method: adding ? "POST" : "DELETE",
      });

      if (!response.ok) {
        throw new ApiError("Video like update failed", response.status);
      }

      return (await response.json()) as { count: number };
    },
    onError: (error, adding) => {
      logError("video.likes.mutation_failed", error, {
        operation: adding ? "add" : "remove",
        shortId,
      });
    },
    onSettled: () => {
      if (shortId) {
        queryClient.invalidateQueries({ queryKey: ["video-likes", shortId] });
      }
    },
    onSuccess: (data, adding) => {
      queryClient.setQueryData<VideoLikesData>(["video-likes", shortId], {
        count: data.count,
        hasLiked: adding,
      });
    },
  });
}

export function useVideoBoostMutation(shortId: string) {
  const queryClient = useQueryClient();

  const accessToken = readAccessToken();
  const isValid = accessToken ? isAccessTokenValid(accessToken) : false;
  const tokenForRequest = isValid ? accessToken : null;

  return useMutation<
    { boostedBy?: BoostedByData; count: number; availableBoosts?: number },
    ApiError,
    boolean
  >({
    mutationFn: async (adding) => {
      if (!shortId) {
        throw new ApiError("Missing shortId", 400);
      }

      const response = await fetch(API_ROUTES.VIDEO.BOOSTS(shortId), {
        headers: createAuthHeaders(tokenForRequest),
        method: adding ? "POST" : "DELETE",
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          error?: string;
          availableBoosts?: number;
        };
        throw new ApiError("Video boost update failed", response.status, errorData);
      }

      return (await response.json()) as {
        boostedBy?: BoostedByData;
        count: number;
        availableBoosts?: number;
      };
    },
    onError: (error, adding) => {
      logError("video.boosts.mutation_failed", error, {
        operation: adding ? "add" : "remove",
        shortId,
      });
    },
    onSettled: () => {
      if (shortId) {
        queryClient.invalidateQueries({
          queryKey: ["video-boosts", shortId, tokenForRequest ? "auth" : "anon"],
        });
      }
    },
    onSuccess: (data, adding) => {
      const queryKey = ["video-boosts", shortId, tokenForRequest ? "auth" : "anon"] as const;

      queryClient.setQueryData<VideoBoostsData>(queryKey, (old) => ({
        availableBoosts: data.availableBoosts ?? old?.availableBoosts,
        boostedBy: data.boostedBy ?? old?.boostedBy,
        count: data.count,
        hasBoosted: adding,
      }));
    },
  });
}

export type { BoostedByData, VideoBoostsData, VideoLikesData };
