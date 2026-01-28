import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import { shouldRetryMutation } from "@/lib/api/query-utils";
import { API_ROUTES } from "@/lib/api/routes";
import { isAccessTokenValid, readAccessToken } from "@/lib/auth/client";
import { createAuthHeaders } from "@/lib/utils/http";
import { logError } from "@/lib/utils/log-client";

interface BoostedByData {
  publicUsers: {
    userId: string;
    name: string | null;
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
  const hasToken = Boolean(readAccessToken());

  return useQuery({
    enabled: canFetch,
    queryFn: () => {
      const token = readAccessToken();
      const isValid = token ? isAccessTokenValid(token) : false;
      return fetchVideoBoosts(shortId, isValid ? token : null);
    },
    queryKey: ["video-boosts", shortId, hasToken ? "auth" : "anon"],
    staleTime: 5000,
  });
}

export function useVideoLikeMutation(shortId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ count: number }, ApiError, boolean, { previousData?: VideoLikesData }>({
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
    onError: (error, adding, context) => {
      logError("video.likes.mutation_failed", error, {
        operation: adding ? "add" : "remove",
        shortId,
      });

      if (context?.previousData) {
        queryClient.setQueryData<VideoLikesData>(["video-likes", shortId], context.previousData);
      }
    },
    onMutate: async (adding) => {
      await queryClient.cancelQueries({ queryKey: ["video-likes", shortId] });

      const previousData = queryClient.getQueryData<VideoLikesData>(["video-likes", shortId]);

      if (previousData) {
        queryClient.setQueryData<VideoLikesData>(["video-likes", shortId], {
          count: Math.max(0, previousData.count + (adding ? 1 : -1)),
          hasLiked: adding,
        });
      }

      return { previousData };
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
    retry: shouldRetryMutation,
  });
}

export function useVideoBoostMutation(shortId: string) {
  const queryClient = useQueryClient();
  const hasToken = Boolean(readAccessToken());

  return useMutation<
    { boostedBy?: BoostedByData; count: number; availableBoosts?: number },
    ApiError,
    boolean,
    { previousData?: VideoBoostsData }
  >({
    mutationFn: async (adding) => {
      if (!shortId) {
        throw new ApiError("Missing shortId", 400);
      }

      const token = readAccessToken();
      const isValid = token ? isAccessTokenValid(token) : false;
      const tokenForRequest = isValid ? token : null;

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
    onError: (error, adding, context) => {
      logError("video.boosts.mutation_failed", error, {
        operation: adding ? "add" : "remove",
        shortId,
      });

      if (context?.previousData) {
        const queryKey = ["video-boosts", shortId, hasToken ? "auth" : "anon"] as const;
        queryClient.setQueryData<VideoBoostsData>(queryKey, context.previousData);
      }
    },
    onMutate: async (adding) => {
      const queryKey = ["video-boosts", shortId, hasToken ? "auth" : "anon"] as const;

      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<VideoBoostsData>(queryKey);

      if (previousData) {
        queryClient.setQueryData<VideoBoostsData>(queryKey, (old) => {
          if (!old) {
            return previousData;
          }
          return {
            ...old,
            count: Math.max(0, old.count + (adding ? 1 : -1)),
            hasBoosted: adding,
            availableBoosts:
              old.availableBoosts !== null && old.availableBoosts !== undefined
                ? Math.max(0, old.availableBoosts - (adding ? 1 : 0))
                : old.availableBoosts,
          };
        });
      }

      return { previousData };
    },
    onSettled: () => {
      if (shortId) {
        queryClient.invalidateQueries({
          queryKey: ["video-boosts", shortId, hasToken ? "auth" : "anon"],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onSuccess: (data, adding) => {
      const queryKey = ["video-boosts", shortId, hasToken ? "auth" : "anon"] as const;

      queryClient.setQueryData<VideoBoostsData>(queryKey, (old) => ({
        ...old,
        count: data.count,
        hasBoosted: adding,
        availableBoosts: data.availableBoosts ?? old?.availableBoosts,
        boostedBy: data.boostedBy ?? old?.boostedBy,
      }));
    },
    retry: shouldRetryMutation,
  });
}

export type { BoostedByData, VideoBoostsData, VideoLikesData };
