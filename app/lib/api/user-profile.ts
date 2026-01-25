import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import {
  getValidAccessToken,
  getValidAccessTokenAsync,
  shouldRetryMutation,
} from "@/lib/api/query-utils";
import { API_ROUTES } from "@/lib/api/routes";
import { clearAccessToken } from "@/lib/auth/client";
import { createAuthHeaders, createJsonAuthHeaders } from "@/lib/utils/http";
import { logError } from "@/lib/utils/log-client";

interface Profile {
  id: string;
  email: string;
  createdAt: string;
  lastLoginAt: string | null;
  allowCommunityEmails: boolean;
  publicProfile: boolean;
  name: string | null;
}

interface BoostedRecording {
  boostedAt: string;
  shortId: string;
  title: string;
  speaker: string[];
  date: string;
  slug: string;
}

interface LoginAttempt {
  id: string;
  outcome: string;
  createdAt: string;
}

interface BoostAllocation {
  availableBoosts: number;
  nextAllocationDate: string;
}

interface UserProfileData {
  profile: Profile;
  boosts: { items: BoostedRecording[] };
  attempts: { items: LoginAttempt[] };
  boostAllocation?: BoostAllocation;
}

const USER_PROFILE_QUERY_KEY = ["user-profile"] as const;
const VIDEO_BOOSTS_QUERY_KEY = (shortId?: string) =>
  shortId ? (["video-boosts", shortId] as const) : (["video-boosts"] as const);
const WATCHLIST_QUERY_KEY = ["watchlist"] as const;
const VIDEO_WATCHLIST_QUERY_KEY = (shortId: string) => ["video-watchlist", shortId] as const;

async function fetchJsonOrNull<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function fetchUserProfile(accessToken: string): Promise<UserProfileData> {
  const response = await fetch(API_ROUTES.ME.BASE, {
    headers: createAuthHeaders(accessToken),
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAccessToken();
    }
    throw new ApiError("User profile fetch failed", response.status);
  }

  return (await response.json()) as UserProfileData;
}

export function useUserProfile() {
  return useQuery<UserProfileData, ApiError>({
    queryFn: async () => {
      const accessToken = await getValidAccessTokenAsync();
      if (!accessToken) {
        throw new ApiError("Access token required", 401);
      }
      return fetchUserProfile(accessToken);
    },
    queryKey: USER_PROFILE_QUERY_KEY,
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 401) && failureCount < 2,
    staleTime: 30_000,
  });
}

export function useUpdatePreferenceMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    ApiError,
    { allowCommunityEmails?: boolean; publicProfile?: boolean; name?: string | null }
  >({
    mutationFn: async ({ allowCommunityEmails, publicProfile, name }) => {
      const accessToken = getValidAccessToken();
      if (!accessToken) {
        throw new ApiError("Access token required", 401);
      }

      const response = await fetch(API_ROUTES.ME.PREFERENCES, {
        body: JSON.stringify({ allowCommunityEmails, name, publicProfile }),
        headers: createJsonAuthHeaders(accessToken),
        method: "PATCH",
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearAccessToken();
        }
        const data = await fetchJsonOrNull<{ error?: string }>(response);
        throw new ApiError("User preferences update failed", response.status, data?.error);
      }
    },
    onError: (error, variables) => {
      logError("user.preferences.update_failed", error, {
        allowCommunityEmails: variables.allowCommunityEmails,
        hasName: variables.name !== undefined,
        publicProfile: variables.publicProfile,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
    },
    retry: shouldRetryMutation,
  });
}

export function useRemoveBoostMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ availableBoosts?: number }, ApiError, string>({
    mutationFn: async (shortId) => {
      const accessToken = getValidAccessToken();
      if (!accessToken) {
        throw new ApiError("Access token required", 401);
      }
      if (!shortId) {
        throw new ApiError("shortId required", 400);
      }

      const response = await fetch(API_ROUTES.VIDEO.BOOSTS(shortId), {
        headers: createAuthHeaders(accessToken),
        method: "DELETE",
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearAccessToken();
        }
        throw new ApiError("Failed to remove boost", response.status);
      }

      return ((await response.json()) as { availableBoosts?: number }) ?? {};
    },
    onError: (error, shortId) => {
      logError("user.boost.remove_failed", error, { shortId });
    },
    onSuccess: async (_data, shortId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: VIDEO_BOOSTS_QUERY_KEY(shortId) }),
      ]);
    },
    retry: shouldRetryMutation,
  });
}

export function useDeleteAccountChallengeMutation() {
  return useMutation<{ challenge_token: string }, ApiError, void>({
    mutationFn: async () => {
      const accessToken = getValidAccessToken();
      if (!accessToken) {
        throw new ApiError("Access token required", 401);
      }

      const response = await fetch(API_ROUTES.ME.DELETE_CHALLENGE, {
        headers: createAuthHeaders(accessToken),
        method: "POST",
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearAccessToken();
        }
        throw new ApiError("Failed to request delete challenge", response.status);
      }

      return (await response.json()) as { challenge_token: string };
    },
    onError: (error) => {
      logError("user.delete.challenge_failed", error);
    },
    retry: shouldRetryMutation,
  });
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { challengeToken: string; code: string }>({
    mutationFn: async ({ challengeToken, code }) => {
      const accessToken = getValidAccessToken();
      if (!accessToken) {
        throw new ApiError("Access token required", 401);
      }

      const response = await fetch(API_ROUTES.ME.DELETE, {
        body: JSON.stringify({ challenge_token: challengeToken, code }),
        headers: createJsonAuthHeaders(accessToken),
        method: "POST",
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearAccessToken();
        }
        const data = await fetchJsonOrNull<{ error?: string }>(response);
        throw new ApiError("Failed to delete account", response.status, data?.error);
      }
    },
    onError: (error) => {
      logError("user.delete.account_failed", error);
    },
    onSuccess: () => {
      clearAccessToken();
      queryClient.clear();
    },
    retry: shouldRetryMutation,
  });
}

export function useWatchlist() {
  const token = getValidAccessToken();

  return useQuery<{ items: { videoId: string; addedAt: string }[] }, ApiError>({
    enabled: Boolean(token),
    queryFn: async () => {
      const accessToken = getValidAccessToken();
      if (!accessToken) {
        throw new ApiError("Access token required", 401);
      }

      const response = await fetch(API_ROUTES.USERS.ME.WATCHLIST, {
        headers: createAuthHeaders(accessToken),
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearAccessToken();
        }
        throw new ApiError("Failed to fetch watchlist", response.status);
      }

      return (await response.json()) as { items: { videoId: string; addedAt: string }[] };
    },
    queryKey: WATCHLIST_QUERY_KEY,
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 401) && failureCount < 2,
    staleTime: 30_000,
  });
}

export function useVideoWatchlistStatus(shortId: string) {
  const token = getValidAccessToken();

  return useQuery<{ inWatchlist: boolean }, ApiError>({
    enabled: Boolean(token) && Boolean(shortId),
    queryFn: async () => {
      const accessToken = getValidAccessToken();
      if (!accessToken) {
        return { inWatchlist: false };
      }

      const response = await fetch(API_ROUTES.USERS.ME.WATCHLIST_VIDEO(shortId), {
        headers: createAuthHeaders(accessToken),
      });

      if (!response.ok) {
        return { inWatchlist: false };
      }

      return (await response.json()) as { inWatchlist: boolean };
    },
    queryKey: VIDEO_WATCHLIST_QUERY_KEY(shortId),
    staleTime: 30_000,
  });
}

export function useAddToWatchlistMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ added: boolean; inWatchlist: boolean }, ApiError, string>({
    mutationFn: async (shortId) => {
      const accessToken = getValidAccessToken();
      if (!accessToken) {
        throw new ApiError("Access token required", 401);
      }

      const response = await fetch(API_ROUTES.USERS.ME.WATCHLIST_VIDEO(shortId), {
        headers: createAuthHeaders(accessToken),
        method: "PUT",
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearAccessToken();
        }
        throw new ApiError("Failed to add to watchlist", response.status);
      }

      return (await response.json()) as { added: boolean; inWatchlist: boolean };
    },
    onError: (error, shortId) => {
      logError("user.watchlist.add_failed", error, { shortId });
    },
    onSuccess: (_data, shortId) => {
      queryClient.setQueryData(VIDEO_WATCHLIST_QUERY_KEY(shortId), { inWatchlist: true });

      queryClient.setQueryData(
        WATCHLIST_QUERY_KEY,
        (old: { items: { videoId: string; addedAt: string }[] } | undefined) => {
          if (!old) {
            return old;
          }
          if (old.items.some((item) => item.videoId === shortId)) {
            return old;
          }
          return {
            items: [{ videoId: shortId, addedAt: new Date().toISOString() }, ...old.items],
          };
        },
      );
    },
    retry: shouldRetryMutation,
  });
}

export function useRemoveFromWatchlistMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ removed: boolean; inWatchlist: boolean }, ApiError, string>({
    mutationFn: async (shortId) => {
      const accessToken = getValidAccessToken();
      if (!accessToken) {
        throw new ApiError("Access token required", 401);
      }

      const response = await fetch(API_ROUTES.USERS.ME.WATCHLIST_VIDEO(shortId), {
        headers: createAuthHeaders(accessToken),
        method: "DELETE",
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearAccessToken();
        }
        throw new ApiError("Failed to remove from watchlist", response.status);
      }

      return (await response.json()) as { removed: boolean; inWatchlist: boolean };
    },
    onError: (error, shortId) => {
      logError("user.watchlist.remove_failed", error, { shortId });
    },
    onSuccess: (_data, shortId) => {
      queryClient.setQueryData(VIDEO_WATCHLIST_QUERY_KEY(shortId), { inWatchlist: false });

      queryClient.setQueryData(
        WATCHLIST_QUERY_KEY,
        (old: { items: { videoId: string; addedAt: string }[] } | undefined) => {
          if (!old) {
            return old;
          }
          return {
            items: old.items.filter((item) => item.videoId !== shortId),
          };
        },
      );
    },
    retry: shouldRetryMutation,
  });
}
export function useCheckInToken() {
  const token = getValidAccessToken();

  return useQuery<{ token: string; expiresAt: string }, ApiError>({
    enabled: Boolean(token),
    queryFn: async () => {
      const accessToken = getValidAccessToken();
      if (!accessToken) {
        throw new ApiError("Access token required", 401);
      }

      const response = await fetch(API_ROUTES.USERS.ME.CHECK_IN, {
        headers: createAuthHeaders(accessToken),
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearAccessToken();
        }
        const data = await fetchJsonOrNull<{ error?: string }>(response);
        throw new ApiError("Failed to fetch check-in token", response.status, data?.error);
      }

      return (await response.json()) as { token: string; expiresAt: string };
    },
    queryKey: ["check-in-token"],
    staleTime: 30_000,
  });
}

export type { BoostAllocation, BoostedRecording, LoginAttempt, Profile, UserProfileData };
