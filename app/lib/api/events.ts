import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import { shouldRetryMutation } from "@/lib/api/query-utils";
import { API_ROUTES } from "@/lib/api/routes";
import { isAccessTokenValid, readAccessToken } from "@/lib/auth/client";
import { createAuthHeaders } from "@/lib/utils/http";
import { logError } from "@/lib/utils/log-client";

interface EventRsvpUser {
  publicId: string;
  name: string | null;
}

interface EventRsvpsData {
  totalCount: number;
  publicUsers: EventRsvpUser[];
  privateCount: number;
  hasMore: boolean;
}

interface UserRsvpsData {
  eventIds: string[];
}

interface OptimisticUserInfo {
  userId: string;
  name: string | null;
}

async function fetchEventRsvps(eventId: string): Promise<EventRsvpsData> {
  const response = await fetch(API_ROUTES.EVENTS.RSVPS(eventId));

  if (!response.ok) {
    throw new ApiError("Event RSVPs fetch failed", response.status);
  }

  return response.json() as Promise<EventRsvpsData>;
}

async function fetchUserRsvps(accessToken: string | null): Promise<UserRsvpsData> {
  const response = await fetch(API_ROUTES.ME.RSVPS, {
    headers: createAuthHeaders(accessToken),
  });

  if (!response.ok) {
    throw new ApiError("User RSVPs fetch failed", response.status);
  }

  return response.json() as Promise<UserRsvpsData>;
}

export function useEventRsvps(eventId: string) {
  const canFetch = Boolean(eventId);

  return useQuery({
    enabled: canFetch,
    queryFn: () => fetchEventRsvps(eventId),
    queryKey: ["event-rsvps", eventId],
    staleTime: 60000,
  });
}

export function useUserRsvps(enabled = true) {
  const hasToken = Boolean(readAccessToken());

  return useQuery({
    enabled: enabled && hasToken,
    queryFn: () => {
      const token = readAccessToken();
      const isValid = token ? isAccessTokenValid(token) : false;
      return fetchUserRsvps(isValid ? token : null);
    },
    queryKey: ["user-rsvps", hasToken ? "auth" : "anon"],
    staleTime: 300000,
  });
}

export function useCreateRsvpMutation(eventId: string) {
  const queryClient = useQueryClient();
  const hasToken = Boolean(readAccessToken());

  return useMutation<
    { success: boolean },
    ApiError,
    OptimisticUserInfo,
    { previousEventData?: EventRsvpsData; previousUserData?: UserRsvpsData }
  >({
    mutationFn: async () => {
      if (!eventId) {
        throw new ApiError("Missing eventId", 400);
      }

      const token = readAccessToken();
      const isValid = token ? isAccessTokenValid(token) : false;

      if (!isValid) {
        throw new ApiError("Authentication required", 401);
      }

      const response = await fetch(API_ROUTES.EVENTS.RSVPS(eventId), {
        headers: createAuthHeaders(token),
        method: "POST",
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string };
        throw new ApiError("RSVP create failed", response.status, errorData);
      }

      return response.json() as Promise<{ success: boolean }>;
    },
    onError: (error, _vars, context) => {
      logError("events.rsvp.create_mutation_failed", error, { eventId });

      if (context?.previousEventData) {
        queryClient.setQueryData<EventRsvpsData>(
          ["event-rsvps", eventId],
          context.previousEventData,
        );
      }
      if (context?.previousUserData) {
        queryClient.setQueryData<UserRsvpsData>(["user-rsvps", "auth"], context.previousUserData);
      }
    },
    onMutate: async (userInfo) => {
      await queryClient.cancelQueries({ queryKey: ["event-rsvps", eventId] });
      await queryClient.cancelQueries({ queryKey: ["user-rsvps", "auth"] });

      const previousEventData = queryClient.getQueryData<EventRsvpsData>(["event-rsvps", eventId]);
      const previousUserData = queryClient.getQueryData<UserRsvpsData>(["user-rsvps", "auth"]);

      if (previousUserData && !previousUserData.eventIds.includes(eventId)) {
        queryClient.setQueryData<UserRsvpsData>(["user-rsvps", "auth"], {
          eventIds: [eventId, ...previousUserData.eventIds],
        });
      }

      if (previousEventData) {
        const optimisticUser: EventRsvpUser = {
          publicId: userInfo.userId,
          name: userInfo.name,
        };

        const alreadyInList = previousEventData.publicUsers.some(
          (u) => u.publicId === userInfo.userId,
        );

        if (!alreadyInList) {
          queryClient.setQueryData<EventRsvpsData>(["event-rsvps", eventId], {
            ...previousEventData,
            totalCount: previousEventData.totalCount + 1,
            publicUsers: [optimisticUser, ...previousEventData.publicUsers],
          });
        } else {
          queryClient.setQueryData<EventRsvpsData>(["event-rsvps", eventId], {
            ...previousEventData,
            totalCount: previousEventData.totalCount + 1,
          });
        }
      }

      return { previousEventData, previousUserData };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["event-rsvps", eventId] });
      queryClient.invalidateQueries({ queryKey: ["user-rsvps", hasToken ? "auth" : "anon"] });
    },
    retry: shouldRetryMutation,
  });
}

export function useDeleteRsvpMutation(eventId: string) {
  const queryClient = useQueryClient();
  const hasToken = Boolean(readAccessToken());

  return useMutation<
    { success: boolean },
    ApiError,
    OptimisticUserInfo,
    { previousEventData?: EventRsvpsData; previousUserData?: UserRsvpsData }
  >({
    mutationFn: async () => {
      if (!eventId) {
        throw new ApiError("Missing eventId", 400);
      }

      const token = readAccessToken();
      const isValid = token ? isAccessTokenValid(token) : false;

      if (!isValid) {
        throw new ApiError("Authentication required", 401);
      }

      const response = await fetch(API_ROUTES.EVENTS.RSVPS(eventId), {
        headers: createAuthHeaders(token),
        method: "DELETE",
      });

      if (!response.ok) {
        throw new ApiError("RSVP delete failed", response.status);
      }

      return response.json() as Promise<{ success: boolean }>;
    },
    onError: (error, _vars, context) => {
      logError("events.rsvp.delete_mutation_failed", error, { eventId });

      if (context?.previousEventData) {
        queryClient.setQueryData<EventRsvpsData>(
          ["event-rsvps", eventId],
          context.previousEventData,
        );
      }
      if (context?.previousUserData) {
        queryClient.setQueryData<UserRsvpsData>(["user-rsvps", "auth"], context.previousUserData);
      }
    },
    onMutate: async (userInfo) => {
      await queryClient.cancelQueries({ queryKey: ["event-rsvps", eventId] });
      await queryClient.cancelQueries({ queryKey: ["user-rsvps", "auth"] });

      const previousEventData = queryClient.getQueryData<EventRsvpsData>(["event-rsvps", eventId]);
      const previousUserData = queryClient.getQueryData<UserRsvpsData>(["user-rsvps", "auth"]);

      if (previousUserData) {
        queryClient.setQueryData<UserRsvpsData>(["user-rsvps", "auth"], {
          eventIds: previousUserData.eventIds.filter((id) => id !== eventId),
        });
      }

      if (previousEventData) {
        const filteredUsers = previousEventData.publicUsers.filter(
          (u) => u.publicId !== userInfo.userId,
        );

        queryClient.setQueryData<EventRsvpsData>(["event-rsvps", eventId], {
          ...previousEventData,
          totalCount: Math.max(0, previousEventData.totalCount - 1),
          publicUsers: filteredUsers,
        });
      }

      return { previousEventData, previousUserData };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["event-rsvps", eventId] });
      queryClient.invalidateQueries({ queryKey: ["user-rsvps", hasToken ? "auth" : "anon"] });
    },
    retry: shouldRetryMutation,
  });
}

export type { EventRsvpsData, EventRsvpUser, UserRsvpsData, OptimisticUserInfo };
