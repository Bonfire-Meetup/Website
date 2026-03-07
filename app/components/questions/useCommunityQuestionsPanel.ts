"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  type EventQuestionsData,
  useBoostEventQuestionMutation,
  useCreateEventQuestionMutation,
  useDeleteEventQuestionMutation,
  useEventQuestions,
  useUnboostEventQuestionMutation,
} from "@/lib/api/events";
import { useAppSelector } from "@/lib/redux/hooks";
import { LOGIN_REASON, PAGE_ROUTES } from "@/lib/routes/pages";

export type QuestionItem = EventQuestionsData["items"][number];
export type SortMode = "boosts" | "date";
export type TalkFilter = "all" | "general" | `${number}`;

function getMutationErrorCode(error: unknown): string | undefined {
  return (error as { data?: { error?: string } } | undefined)?.data?.error;
}

function getCreateErrorMessage(
  t: ReturnType<typeof useTranslations>,
  errorCode: string | undefined,
): string {
  if (errorCode === "profanity_not_allowed") {
    return t("questions.errors.profanity");
  }

  if (errorCode === "question_window_closed") {
    return t("questions.errors.windowClosed");
  }

  return t("questions.errors.createFailed");
}

function getBoostErrorMessage(
  t: ReturnType<typeof useTranslations>,
  errorCode: string | undefined,
): string {
  if (errorCode === "no_boosts_available") {
    return t("questions.errors.noBoosts");
  }

  if (errorCode === "question_window_closed") {
    return t("questions.errors.windowClosed");
  }

  return t("questions.errors.boostFailed");
}

function getDeleteErrorMessage(
  t: ReturnType<typeof useTranslations>,
  errorCode: string | undefined,
): string {
  if (errorCode === "question_window_closed") {
    return t("questions.errors.windowClosed");
  }

  if (errorCode === "forbidden") {
    return t("questions.errors.deleteForbidden");
  }

  return t("questions.errors.deleteFailed");
}

function isReplayWindow(isWindowOpen: boolean, closesAt: string | null | undefined): boolean {
  const closesAtTimestamp = closesAt ? new Date(closesAt).getTime() : Number.NaN;
  return !isWindowOpen && Number.isFinite(closesAtTimestamp) && closesAtTimestamp <= Date.now();
}

function filterAndSortQuestions(
  items: QuestionItem[],
  activeTalkFilter: TalkFilter,
  sortMode: SortMode,
) {
  const filtered = items.filter((question) => {
    if (activeTalkFilter === "all") {
      return true;
    }

    if (activeTalkFilter === "general") {
      return question.talkIndex === null;
    }

    return String(question.talkIndex) === activeTalkFilter;
  });

  return [...filtered].sort((a, b) => {
    if (sortMode === "date") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    if (b.boostCount !== a.boostCount) {
      return b.boostCount - a.boostCount;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function useCommunityQuestionsPanel(eventId: string) {
  const t = useTranslations("events");
  const locale = useLocale();
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isAuthHydrated = useAppSelector((state) => state.auth.hydrated);
  const userProfile = useAppSelector((state) => state.profile.profile);
  const { data, dataUpdatedAt, isFetching, isLoading, refetch } = useEventQuestions(eventId);
  const createQuestion = useCreateEventQuestionMutation(eventId);
  const boostQuestion = useBoostEventQuestionMutation(eventId);
  const unboostQuestion = useUnboostEventQuestionMutation(eventId);
  const deleteQuestion = useDeleteEventQuestionMutation(eventId);
  const [text, setText] = useState("");
  const [selectedTalkIndex, setSelectedTalkIndex] = useState<string>("none");
  const [activeTalkFilter, setActiveTalkFilter] = useState<TalkFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("boosts");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submissionCount, setSubmissionCount] = useState(0);

  const isWindowOpen = data?.isWindowOpen ?? false;
  const canParticipate = data?.canParticipate ?? false;
  const isReplayMode = isReplayWindow(isWindowOpen, data?.closesAt);
  const availableBoosts = data?.availableBoosts ?? null;

  const visibleQuestions = useMemo(
    () => filterAndSortQuestions(data?.items ?? [], activeTalkFilter, sortMode),
    [activeTalkFilter, data?.items, sortMode],
  );

  const handleAuthRedirect = () => {
    const returnPath = PAGE_ROUTES.EVENT(eventId);
    router.push(PAGE_ROUTES.LOGIN_WITH_REASON_AND_RETURN(LOGIN_REASON.EVENT_RSVP, returnPath));
  };

  const requireParticipation = () => {
    setError(null);

    if (!isAuthenticated) {
      handleAuthRedirect();
      return false;
    }

    if (!canParticipate) {
      setError(t("questions.errors.windowClosed"));
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!requireParticipation()) {
      return;
    }

    const trimmedText = text.trim();
    if (trimmedText.length < 3) {
      setError(t("questions.errors.tooShort"));
      return;
    }

    createQuestion.mutate(
      {
        locale: locale === "cs" ? "cs" : "en",
        optimisticAuthor: userProfile
          ? {
              isPublic: userProfile.publicProfile ?? false,
              name: userProfile.name,
              userId: userProfile.id,
            }
          : undefined,
        talkIndex: selectedTalkIndex === "none" ? null : Number(selectedTalkIndex),
        text: trimmedText,
      },
      {
        onError: (mutationError) => {
          setError(getCreateErrorMessage(t, getMutationErrorCode(mutationError)));
        },
        onSuccess: () => {
          setText("");
          setSelectedTalkIndex("none");
          setSubmissionCount((count) => count + 1);
        },
      },
    );
  };

  const handleToggleBoost = (questionId: string, hasBoosted: boolean) => {
    if (!requireParticipation()) {
      return;
    }

    if (!hasBoosted && (availableBoosts ?? 0) <= 0) {
      setError(t("questions.errors.noBoosts"));
      return;
    }

    const mutation = hasBoosted ? unboostQuestion : boostQuestion;
    mutation.mutate(
      { questionId },
      {
        onError: (mutationError) => {
          setError(getBoostErrorMessage(t, getMutationErrorCode(mutationError)));
        },
      },
    );
  };

  const handleConfirmDelete = (questionId: string) => {
    setError(null);

    deleteQuestion.mutate(
      { questionId },
      {
        onError: (mutationError) => {
          setError(getDeleteErrorMessage(t, getMutationErrorCode(mutationError)));
        },
        onSuccess: () => {
          setConfirmDeleteId(null);
        },
      },
    );
  };

  return {
    activeTalkFilter,
    availableBoosts,
    canParticipate,
    confirmDeleteId,
    createQuestion,
    data,
    dataUpdatedAt,
    deleteQuestion,
    error,
    handleAuthRedirect,
    handleConfirmDelete,
    handleRefresh: refetch,
    handleSubmit,
    handleToggleBoost,
    isAuthenticated,
    isAuthHydrated,
    isFetching,
    isLoading,
    isReplayMode,
    isWindowOpen,
    locale,
    selectedTalkIndex,
    setActiveTalkFilter,
    setConfirmDeleteId,
    setSelectedTalkIndex,
    setSortMode,
    setText,
    sortMode,
    submissionCount,
    t,
    text,
    toggleBoostPending: boostQuestion.isPending || unboostQuestion.isPending,
    visibleQuestions,
  };
}
