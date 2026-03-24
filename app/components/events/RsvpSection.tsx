"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { RsvpAvatarList } from "@/components/events/RsvpAvatarList";
import { CheckCircleIcon, CheckIcon } from "@/components/shared/Icons";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useCreateRsvpMutation, useDeleteRsvpMutation, useEventRsvps } from "@/lib/api/events";
import { useAppSelector, useAuthStatus } from "@/lib/redux/hooks";
import { selectAuthViewer } from "@/lib/redux/selectors/authSelectors";
import { LOGIN_REASON, PAGE_ROUTES } from "@/lib/routes/pages";
import { useHaptics } from "@/lib/utils/haptics";

interface RsvpSectionProps {
  eventId: string;
}

const CANCEL_CONFIRM_TIMEOUT_MS = 3000;
const SPLIT_BUTTON_CLASS =
  "group relative cursor-pointer overflow-hidden rounded-xl px-4 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60";

interface ResponsiveLabelProps {
  desktop: string;
  mobile: string;
}

function ResponsiveLabel({ desktop, mobile }: ResponsiveLabelProps) {
  return (
    <>
      <span className="whitespace-nowrap sm:hidden">{mobile}</span>
      <span className="hidden whitespace-nowrap sm:inline">{desktop}</span>
    </>
  );
}

export function RsvpSection({ eventId }: RsvpSectionProps) {
  const t = useTranslations("events");
  const router = useRouter();
  const haptics = useHaptics();
  const { isMounted, isPending: isAuthPending, queryScope } = useAuthStatus();
  const isAuthenticated = queryScope === "auth";
  const authViewer = useAppSelector(selectAuthViewer);
  const { data: rsvps, isAuthTransitioning, isLoading: rsvpsLoading } = useEventRsvps(eventId);
  const createMutation = useCreateRsvpMutation(eventId);
  const deleteMutation = useDeleteRsvpMutation(eventId);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRsvped = rsvps?.hasRsvped ?? false;
  const totalCount = rsvps?.totalCount ?? 0;
  const isAuthenticatedDataLoading =
    isMounted && (isAuthTransitioning || (isAuthenticated && !rsvps && rsvpsLoading));

  const isLoading =
    createMutation.isPending ||
    deleteMutation.isPending ||
    isAuthPending ||
    isAuthenticatedDataLoading;

  useEffect(() => {
    if (!isRsvped) {
      setConfirmCancel(false);
    }
  }, [isRsvped]);

  useEffect(() => {
    if (!confirmCancel) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setConfirmCancel(false);
    }, CANCEL_CONFIRM_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [confirmCancel]);

  const getUserInfo = () => {
    const userId = authViewer.id;

    if (!userId) {
      haptics.error();
      setError(t("rsvpErrors.unableToRsvp"));
      return null;
    }

    return {
      userId,
      name: authViewer.name ?? null,
      isPublic: authViewer.publicProfile,
    };
  };

  const handleUnauthenticatedClick = () => {
    haptics.neutral();
    const returnPath = PAGE_ROUTES.EVENT(eventId);
    router.push(PAGE_ROUTES.LOGIN_WITH_REASON_AND_RETURN(LOGIN_REASON.EVENT_RSVP, returnPath));
  };

  const cancelRsvp = () => {
    const userInfo = getUserInfo();

    if (!userInfo) {
      return;
    }

    deleteMutation.mutate(userInfo, {
      onSuccess: () => {
        setConfirmCancel(false);
        haptics.neutral();
      },
      onError: (err) => {
        haptics.error();
        setError(err.message || t("rsvpErrors.cancelFailed"));
      },
    });
  };

  const createRsvp = () => {
    const userInfo = getUserInfo();

    if (!userInfo) {
      return;
    }

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
  };

  const resetConfirmCancel = () => {
    setConfirmCancel(false);
    setError(null);
  };

  const handleClick = () => {
    setError(null);

    if (isAuthPending) {
      return;
    }

    if (!isAuthenticated) {
      handleUnauthenticatedClick();
      return;
    }

    if (isRsvped) {
      if (!confirmCancel) {
        setConfirmCancel(true);
        haptics.neutral();
        return;
      }

      cancelRsvp();
    } else {
      resetConfirmCancel();
      createRsvp();
    }
  };

  const handleConfirmCancel = () => {
    setError(null);

    if (isAuthPending || !isAuthenticated) {
      return;
    }

    cancelRsvp();
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
        {t("rsvpOnBonfire")}
      </p>

      {isRsvped && confirmCancel ? (
        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleConfirmCancel} disabled={isLoading} className={SPLIT_BUTTON_CLASS}>
            <div className="absolute inset-0 bg-gradient-to-r from-red-700 via-rose-600 to-red-500 shadow-red-900/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-red-800 via-rose-700 to-red-600 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative z-10 flex items-center justify-center gap-2">
              {deleteMutation.isPending ? (
                <LoadingSpinner size="sm" ariaLabel={t("withdrawRsvp")} />
              ) : (
                <>
                  <CheckIcon className="h-5 w-5" />
                  <ResponsiveLabel mobile={t("withdrawRsvpShort")} desktop={t("withdrawRsvp")} />
                </>
              )}
            </div>
          </button>

          <button onClick={resetConfirmCancel} disabled={isLoading} className={SPLIT_BUTTON_CLASS}>
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-500 via-neutral-600 to-neutral-700" />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-600 via-neutral-700 to-neutral-800 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative z-10 flex items-center justify-center gap-2">
              <CheckCircleIcon className="h-5 w-5" />
              <ResponsiveLabel mobile={t("keepRsvpShort")} desktop={t("keepRsvp")} />
            </div>
          </button>
        </div>
      ) : (
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
      )}

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
