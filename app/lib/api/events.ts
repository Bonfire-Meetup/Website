"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import { ensureFreshToken, shouldRetryMutation } from "@/lib/api/query-utils";
import { API_ROUTES } from "@/lib/api/routes";
import { useAuthScopedQuery } from "@/lib/api/useAuthScopedQuery";
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

interface EventQuestionItem {
  authorName: string | null;
  authorPublicId: string | null;
  authorIsPublic: boolean;
  authorMembershipTier: number | null;
  id: string;
  text: string;
  talkIndex: number | null;
  createdAt: string;
  boostCount: number;
  hasBoosted: boolean;
  isOwn: boolean;
}

interface EventQuestionsData {
  items: EventQuestionItem[];
  isWindowOpen: boolean;
  closesAt: string | null;
  isAuthenticated: boolean;
  canParticipate: boolean;
  availableBoosts: number | null;
}

interface OptimisticUserInfo {
  userId: string;
  name: string | null;
  isPublic: boolean;
}

interface EventQuestionCreateInput {
  text: string;
  talkIndex: number | null;
  locale: "en" | "cs";
}

interface OptimisticQuestionAuthor {
  userId: string;
  name: string | null;
  isPublic: boolean;
}

function buildOptimisticQuestion(
  payload: EventQuestionCreateInput,
  optimisticAuthor?: OptimisticQuestionAuthor,
): EventQuestionItem {
  return {
    authorIsPublic: optimisticAuthor?.isPublic ?? false,
    authorMembershipTier: null,
    authorName: optimisticAuthor?.isPublic ? optimisticAuthor.name : null,
    authorPublicId:
      optimisticAuthor?.isPublic && optimisticAuthor.userId
        ? compressUuid(optimisticAuthor.userId)
        : null,
    boostCount: 0,
    createdAt: new Date().toISOString(),
    hasBoosted: false,
    id: `optimistic-${crypto.randomUUID()}`,
    isOwn: true,
    talkIndex: payload.talkIndex,
    text: payload.text,
  };
}

function prependOptimisticQuestion(
  currentData: EventQuestionsData | undefined,
  payload: EventQuestionCreateInput,
  optimisticAuthor?: OptimisticQuestionAuthor,
) {
  if (!currentData) {
    return currentData;
  }

  return {
    ...currentData,
    items: [buildOptimisticQuestion(payload, optimisticAuthor), ...currentData.items],
  } satisfies EventQuestionsData;
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

async function fetchEventQuestions(
  eventId: string,
  accessToken: string | null,
): Promise<EventQuestionsData> {
  const response = await fetch(API_ROUTES.EVENTS.QUESTIONS(eventId), {
    headers: createAuthHeaders(accessToken),
  });

  if (!response.ok) {
    throw new ApiError("Event questions fetch failed", response.status);
  }

  return response.json() as Promise<EventQuestionsData>;
}

export function useEventRsvps(eventId: string) {
  return useAuthScopedQuery<EventRsvpsData>({
    baseQueryKey: ["event-rsvps", eventId],
    enabled: Boolean(eventId),
    keepAnonymousPlaceholderOnAuth: true,
    queryFn: ({ accessToken }) => fetchEventRsvps(eventId, accessToken),
    staleTime: 60000,
  });
}

export function useEventQuestions(eventId: string) {
  return useAuthScopedQuery<EventQuestionsData>({
    baseQueryKey: ["event-questions", eventId],
    enabled: Boolean(eventId),
    keepAnonymousPlaceholderOnAuth: true,
    queryFn: ({ accessToken }) => fetchEventQuestions(eventId, accessToken),
    staleTime: 15000,
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

      const token = await ensureFreshToken();

      if (!token) {
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

      const token = await ensureFreshToken();

      if (!token) {
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

export function useCreateEventQuestionMutation(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean },
    ApiError,
    EventQuestionCreateInput & { optimisticAuthor?: OptimisticQuestionAuthor },
    { previousAuthData?: EventQuestionsData; previousAnonData?: EventQuestionsData }
  >({
    mutationFn: async ({ optimisticAuthor: _optimisticAuthor, ...payload }) => {
      if (!eventId) {
        throw new ApiError("Missing eventId", 400);
      }

      const token = await ensureFreshToken();

      if (!token) {
        throw new ApiError("Authentication required", 401);
      }

      const response = await fetch(API_ROUTES.EVENTS.QUESTIONS(eventId), {
        body: JSON.stringify(payload),
        headers: {
          ...createAuthHeaders(token),
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string };
        throw new ApiError("Event question create failed", response.status, errorData);
      }

      return response.json() as Promise<{ success: boolean }>;
    },
    onMutate: async ({ optimisticAuthor, ...payload }) => {
      await queryClient.cancelQueries({ queryKey: ["event-questions", eventId] });

      const authKey = ["event-questions", eventId, "auth"] as const;
      const anonKey = ["event-questions", eventId, "anon"] as const;
      const previousAuthData = queryClient.getQueryData<EventQuestionsData>(authKey);
      const previousAnonData = queryClient.getQueryData<EventQuestionsData>(anonKey);

      queryClient.setQueryData<EventQuestionsData>(
        authKey,
        prependOptimisticQuestion(previousAuthData, payload, optimisticAuthor),
      );
      queryClient.setQueryData<EventQuestionsData>(
        anonKey,
        prependOptimisticQuestion(previousAnonData, payload, optimisticAuthor),
      );

      return { previousAuthData, previousAnonData };
    },
    onError: (error, _vars, context) => {
      logError("events.questions.create_mutation_failed", error, { eventId });

      if (context?.previousAuthData) {
        queryClient.setQueryData<EventQuestionsData>(
          ["event-questions", eventId, "auth"],
          context.previousAuthData,
        );
      }

      if (context?.previousAnonData) {
        queryClient.setQueryData<EventQuestionsData>(
          ["event-questions", eventId, "anon"],
          context.previousAnonData,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["event-questions", eventId] });
    },
    retry: shouldRetryMutation,
  });
}

export function useBoostEventQuestionMutation(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { count: number; added?: boolean; availableBoosts?: number },
    ApiError,
    { questionId: string }
  >({
    mutationFn: async ({ questionId }) => {
      const token = await ensureFreshToken();

      if (!token) {
        throw new ApiError("Authentication required", 401);
      }

      const response = await fetch(API_ROUTES.EVENTS.QUESTION_BOOSTS(eventId, questionId), {
        headers: createAuthHeaders(token),
        method: "POST",
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string };
        throw new ApiError("Question boost failed", response.status, errorData);
      }

      return response.json() as Promise<{
        count: number;
        added?: boolean;
        availableBoosts?: number;
      }>;
    },
    onError: (error) => {
      logError("events.questions.boost_mutation_failed", error, { eventId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-questions", eventId] });
    },
    retry: shouldRetryMutation,
  });
}

export function useUnboostEventQuestionMutation(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { count: number; removed?: boolean; availableBoosts?: number },
    ApiError,
    { questionId: string }
  >({
    mutationFn: async ({ questionId }) => {
      const token = await ensureFreshToken();

      if (!token) {
        throw new ApiError("Authentication required", 401);
      }

      const response = await fetch(API_ROUTES.EVENTS.QUESTION_BOOSTS(eventId, questionId), {
        headers: createAuthHeaders(token),
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string };
        throw new ApiError("Question unboost failed", response.status, errorData);
      }

      return response.json() as Promise<{
        count: number;
        removed?: boolean;
        availableBoosts?: number;
      }>;
    },
    onError: (error) => {
      logError("events.questions.unboost_mutation_failed", error, { eventId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-questions", eventId] });
    },
    retry: shouldRetryMutation,
  });
}

export function useDeleteEventQuestionMutation(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, ApiError, { questionId: string }>({
    mutationFn: async ({ questionId }) => {
      const token = await ensureFreshToken();

      if (!token) {
        throw new ApiError("Authentication required", 401);
      }

      const response = await fetch(API_ROUTES.EVENTS.QUESTION(eventId, questionId), {
        headers: createAuthHeaders(token),
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string };
        throw new ApiError("Question delete failed", response.status, errorData);
      }

      return response.json() as Promise<{ success: boolean }>;
    },
    onError: (error) => {
      logError("events.questions.delete_mutation_failed", error, { eventId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-questions", eventId] });
    },
    retry: shouldRetryMutation,
  });
}

export type {
  EventQuestionCreateInput,
  EventQuestionItem,
  EventQuestionsData,
  EventRsvpsData,
  EventRsvpUser,
  OptimisticUserInfo,
};
