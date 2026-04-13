import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import { authFetch, getValidAccessTokenAsync, shouldRetryMutation } from "@/lib/api/query-utils";
import { API_ROUTES } from "@/lib/api/routes";
import { handleUnauthorizedClientState } from "@/lib/auth/client-session";
import { createJsonAuthHeaders } from "@/lib/utils/http";
import { logError } from "@/lib/utils/log-client";

export interface GuildSubscriptionCharge {
  amount: number;
  currency: string;
  paidAt?: string | null;
  dueAt?: string | null;
  status?: string | null;
}

export interface GuildSubscriptionSummary {
  tier: 1 | 2 | 3 | null;
  status: string | null;
  isActive: boolean;
  cancelAtPeriodEnd: boolean;
  scheduledChange: {
    tier: 1 | 2 | 3;
    effectiveAt: string;
  } | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  lastCharge: GuildSubscriptionCharge | null;
  upcomingCharge: GuildSubscriptionCharge | null;
}

export const GUILD_SUBSCRIPTION_QUERY_KEY = ["guild-subscription"] as const;

async function readJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function useGuildSubscription(enabled = true) {
  return useQuery<GuildSubscriptionSummary, ApiError>({
    enabled,
    queryFn: async () => {
      const response = await authFetch(API_ROUTES.ME.SUBSCRIPTION);

      if (!response.ok) {
        throw new ApiError("Failed to fetch Guild subscription", response.status);
      }

      return (await response.json()) as GuildSubscriptionSummary;
    },
    queryKey: GUILD_SUBSCRIPTION_QUERY_KEY,
    staleTime: 15_000,
  });
}

export function useCreateGuildCheckoutMutation() {
  return useMutation<{ url: string }, ApiError, { tier: 1 | 2 | 3 }>({
    mutationFn: async ({ tier }) => {
      const accessToken = await getValidAccessTokenAsync();

      if (!accessToken) {
        throw new ApiError("Access token required", 401);
      }

      const response = await fetch(API_ROUTES.ME.SUBSCRIPTION_CHECKOUT, {
        method: "POST",
        headers: createJsonAuthHeaders(accessToken),
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorizedClientState();
        }

        const data = await readJson<{ error?: string }>(response);
        throw new ApiError("Guild checkout failed", response.status, data?.error);
      }

      return (await response.json()) as { url: string };
    },
    onError: (error, variables) => {
      logError("guild.checkout.failed", error, { tier: variables.tier });
    },
    retry: shouldRetryMutation,
  });
}

export function useCreateGuildPortalMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ url: string }, ApiError, void>({
    mutationFn: async () => {
      const accessToken = await getValidAccessTokenAsync();

      if (!accessToken) {
        throw new ApiError("Access token required", 401);
      }

      const response = await fetch(API_ROUTES.ME.SUBSCRIPTION_PORTAL, {
        method: "POST",
        headers: createJsonAuthHeaders(accessToken),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorizedClientState();
        }

        const data = await readJson<{ error?: string }>(response);
        throw new ApiError("Guild portal failed", response.status, data?.error);
      }

      return (await response.json()) as { url: string };
    },
    onError: (error) => {
      logError("guild.portal.failed", error);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: GUILD_SUBSCRIPTION_QUERY_KEY });
    },
    retry: shouldRetryMutation,
  });
}

export function syncGuildSubscriptionCheckout(checkoutSessionId: string): Promise<void> {
  return syncGuildSubscription({ checkoutSessionId });
}

export async function syncGuildSubscription(options?: {
  checkoutSessionId?: string;
}): Promise<void> {
  const accessToken = await getValidAccessTokenAsync();

  if (!accessToken) {
    throw new ApiError("Access token required", 401);
  }

  const response = await fetch(API_ROUTES.ME.SUBSCRIPTION_SYNC, {
    method: "POST",
    headers: createJsonAuthHeaders(accessToken),
    body: JSON.stringify(options ?? {}),
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorizedClientState();
    }

    const data = await readJson<{ error?: string }>(response);
    throw new ApiError("Guild sync failed", response.status, data?.error);
  }
}

export function useSyncGuildSubscriptionMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { checkoutSessionId?: string } | void>({
    mutationFn: async (variables) => {
      await syncGuildSubscription(variables ?? {});
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: GUILD_SUBSCRIPTION_QUERY_KEY });
    },
    onError: (error) => {
      logError("guild.sync.failed", error);
    },
    retry: shouldRetryMutation,
  });
}
