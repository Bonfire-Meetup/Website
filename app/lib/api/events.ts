import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import { shouldRetryMutation } from "@/lib/api/query-utils";
import { API_ROUTES } from "@/lib/api/routes";
import { isAccessTokenValid, readAccessToken } from "@/lib/auth/client";
import { createAuthHeaders } from "@/lib/utils/http";
import { logError } from "@/lib/utils/log-client";
import { compressUuid } from "@/lib/utils/uuid-compress";

interface EventRsvpUser {
  publicId: string;
  name: string | null;
}

interface EventRsvpsData {
  totalCount: number;
  publicUsers: EventRsvpUser[];
  privateCount: number;
  hasMore: boolean;
  hasRsvped: boolean;
}

interface OptimisticUserInfo {
  userId: string;
  name: string | null;
  isPublic: boolean;
}

async function fetchEventRsvps(
  eventId: string,
  accessToken: string | null,
): Promise<EventRsvpsData> {
  const response = await fetch(API_ROUTES.EVENTS.RSVPS(eventId), {
    headers: createAuthHeaders(accessToken),
  });

  if (!response.ok) {
    throw new ApiError("Event RSVPs fetch failed", response.status);
  }

  return response.json() as Promise<EventRsvpsData>;
}

export function useEventRsvps(eventId: string) {
  const canFetch = Boolean(eventId);
  const hasToken = Boolean(readAccessToken());

  return useQuery({
    enabled: canFetch,
    queryFn: () => {
      const token = readAccessToken();
      const isValid = token ? isAccessTokenValid(token) : false;
      return fetchEventRsvps(eventId, isValid ? token : null);
    },
    queryKey: ["event-rsvps", eventId, hasToken ? "auth" : "anon"],
    staleTime: 60000,
  });
}

export function useCreateRsvpMutation(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean },
    ApiError,
    OptimisticUserInfo,
    { previousEventData?: EventRsvpsData }
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
          ["event-rsvps", eventId, "auth"],
          context.previousEventData,
        );
        queryClient.setQueryData<EventRsvpsData>(
          ["event-rsvps", eventId, "anon"],
          context.previousEventData,
        );
      }
    },
    onMutate: async (userInfo) => {
      await queryClient.cancelQueries({ queryKey: ["event-rsvps", eventId] });

      const authKey = ["event-rsvps", eventId, "auth"] as const;
      const anonKey = ["event-rsvps", eventId, "anon"] as const;
      const previousEventData =
        queryClient.getQueryData<EventRsvpsData>(authKey) ??
        queryClient.getQueryData<EventRsvpsData>(anonKey);

      const userPublicId = compressUuid(userInfo.userId);
      const optimisticUser: EventRsvpUser = {
        publicId: userPublicId,
        name: userInfo.name,
      };

      const baseData: EventRsvpsData = previousEventData ?? {
        totalCount: 0,
        publicUsers: [],
        privateCount: 0,
        hasMore: false,
        hasRsvped: false,
      };

      const alreadyInList = baseData.publicUsers.some((u) => u.publicId === userPublicId);
      const nextData: EventRsvpsData = {
        ...baseData,
        totalCount: baseData.totalCount + 1,
        hasRsvped: true,
        publicUsers: alreadyInList
          ? baseData.publicUsers
          : [optimisticUser, ...baseData.publicUsers],
        privateCount: userInfo.isPublic ? baseData.privateCount : baseData.privateCount + 1,
      };

      queryClient.setQueryData<EventRsvpsData>(authKey, nextData);
      queryClient.setQueryData<EventRsvpsData>(anonKey, nextData);

      return { previousEventData };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["event-rsvps", eventId] });
    },
    retry: shouldRetryMutation,
  });
}

export function useDeleteRsvpMutation(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean },
    ApiError,
    OptimisticUserInfo,
    { previousEventData?: EventRsvpsData }
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
          ["event-rsvps", eventId, "auth"],
          context.previousEventData,
        );
        queryClient.setQueryData<EventRsvpsData>(
          ["event-rsvps", eventId, "anon"],
          context.previousEventData,
        );
      }
    },
    onMutate: async (userInfo) => {
      await queryClient.cancelQueries({ queryKey: ["event-rsvps", eventId] });

      const authKey = ["event-rsvps", eventId, "auth"] as const;
      const anonKey = ["event-rsvps", eventId, "anon"] as const;
      const previousEventData =
        queryClient.getQueryData<EventRsvpsData>(authKey) ??
        queryClient.getQueryData<EventRsvpsData>(anonKey);

      if (previousEventData) {
        const userPublicId = compressUuid(userInfo.userId);
        const filteredPublicUsers = previousEventData.publicUsers.filter(
          (u) => u.publicId !== userPublicId,
        );
        const nextData: EventRsvpsData = {
          ...previousEventData,
          totalCount: Math.max(0, previousEventData.totalCount - 1),
          hasRsvped: false,
          publicUsers: filteredPublicUsers,
          privateCount: userInfo.isPublic
            ? previousEventData.privateCount
            : Math.max(0, previousEventData.privateCount - 1),
        };

        queryClient.setQueryData<EventRsvpsData>(authKey, nextData);
        queryClient.setQueryData<EventRsvpsData>(anonKey, nextData);
      }

      return { previousEventData };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["event-rsvps", eventId] });
    },
    retry: shouldRetryMutation,
  });
}

export type { EventRsvpsData, EventRsvpUser, OptimisticUserInfo };
