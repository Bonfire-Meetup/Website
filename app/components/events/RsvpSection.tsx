"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { RsvpAvatarList } from "@/components/events/RsvpAvatarList";
import { CheckCircleIcon, CheckIcon } from "@/components/shared/Icons";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useCreateRsvpMutation, useDeleteRsvpMutation, useEventRsvps } from "@/lib/api/events";
import { useUserProfile } from "@/lib/api/user-profile";
import { useAuthStatus } from "@/lib/redux/hooks";
import { LOGIN_REASON, PAGE_ROUTES } from "@/lib/routes/pages";
import { useHaptics } from "@/lib/utils/haptics";

interface RsvpSectionProps {
  eventId: string;
}

export function RsvpSection({ eventId }: RsvpSectionProps) {
  const t = useTranslations("events");
  const router = useRouter();
  const haptics = useHaptics();
  const { isMounted, isPending: isAuthPending, queryScope } = useAuthStatus();
  const isAuthenticated = queryScope === "auth";
  const { data: rsvps, isAuthTransitioning, isLoading: rsvpsLoading } = useEventRsvps(eventId);
  const { data: userProfile, isLoading: userProfileLoading } = useUserProfile(isAuthenticated);
  const createMutation = useCreateRsvpMutation(eventId);
  const deleteMutation = useDeleteRsvpMutation(eventId);
  const [error, setError] = useState<string | null>(null);

  const isRsvped = useMemo(() => rsvps?.hasRsvped ?? false, [rsvps]);
  const totalCount = rsvps?.totalCount ?? 0;
  const isAuthenticatedDataLoading =
    isMounted &&
    (isAuthTransitioning || (isAuthenticated && (!rsvps || !userProfile) && rsvpsLoading));

  const isLoading =
    createMutation.isPending ||
    deleteMutation.isPending ||
    isAuthPending ||
    isAuthenticatedDataLoading ||
    userProfileLoading;

  const handleClick = useCallback(() => {
    setError(null);

    if (isAuthPending) {
      return;
    }

    if (!isAuthenticated) {
      haptics.neutral();
      const returnPath = PAGE_ROUTES.EVENT(eventId);
      router.push(PAGE_ROUTES.LOGIN_WITH_REASON_AND_RETURN(LOGIN_REASON.EVENT_RSVP, returnPath));
      return;
    }

    const userId = userProfile?.profile.id;
    const userName = userProfile?.profile.name;
    const isPublic = userProfile?.profile.publicProfile ?? false;

    if (!userId) {
      haptics.error();
      setError(t("rsvpErrors.unableToRsvp"));
      return;
    }

    const userInfo = { userId, name: userName ?? null, isPublic };

    if (isRsvped) {
      deleteMutation.mutate(userInfo, {
        onSuccess: () => {
          haptics.neutral();
        },
        onError: (err) => {
          haptics.error();
          setError(err.message || t("rsvpErrors.cancelFailed"));
        },
      });
    } else {
      createMutation.mutate(userInfo, {
        onSuccess: () => {
          haptics.success();
        },
        onError: (err) => {
          haptics.error();
          if (err.status === 429) {
            setError(t("rsvpErrors.tooManyAttempts"));
          } else if (err.status === 409) {
            setError(t("rsvpErrors.alreadyRsvped"));
          } else {
            setError(err.message || t("rsvpErrors.createFailed"));
          }
        },
      });
    }
  }, [
    isAuthenticated,
    isAuthPending,
    isRsvped,
    eventId,
    router,
    userProfile,
    createMutation,
    deleteMutation,
    haptics,
    t,
  ]);

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
        {t("rsvpOnBonfire")}
      </p>

      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`group relative w-full cursor-pointer overflow-hidden rounded-xl px-6 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 ${
          isRsvped
            ? "bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 shadow-emerald-500/30"
            : "bg-gradient-to-r from-rose-600 via-orange-500 to-red-600 shadow-orange-500/30"
        }`}
      >
        <div className="relative z-10 flex items-center justify-center gap-3">
          {isAuthenticatedDataLoading ? (
            <LoadingSpinner size="sm" ariaLabel={t("rsvpOnBonfire")} />
          ) : isRsvped ? (
            <>
              <CheckCircleIcon className="h-5 w-5" />
              <span>{t("youreGoing")}</span>
            </>
          ) : (
            <>
              <CheckIcon className="h-5 w-5" />
              <span>{t("illBeThere")}</span>
            </>
          )}
        </div>

        {!isRsvped && (
          <div className="absolute inset-0 bg-gradient-to-r from-rose-700 via-orange-600 to-red-700 opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </button>

      {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400">
        {rsvpsLoading && !rsvps ? (
          <span className="h-4 w-28 animate-pulse rounded-full bg-neutral-200 dark:bg-white/10" />
        ) : (
          <span className="font-semibold text-neutral-700 dark:text-neutral-200">
            {totalCount > 0 ? t("attendingCount", { count: totalCount }) : t("beFirst")}
          </span>
        )}
        {(rsvpsLoading || totalCount > 0) && <RsvpAvatarList eventId={eventId} />}
      </div>
    </div>
  );
}
