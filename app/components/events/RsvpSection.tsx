"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { RsvpAvatarList } from "@/components/events/RsvpAvatarList";
import { CheckCircleIcon, CheckIcon } from "@/components/shared/Icons";
import { useCreateRsvpMutation, useDeleteRsvpMutation, useEventRsvps } from "@/lib/api/events";
import { useUserProfile } from "@/lib/api/user-profile";
import { useAppSelector } from "@/lib/redux/hooks";
import { LOGIN_REASON, PAGE_ROUTES } from "@/lib/routes/pages";

interface RsvpSectionProps {
  eventId: string;
}

export function RsvpSection({ eventId }: RsvpSectionProps) {
  const t = useTranslations("events");
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { data: rsvps, isLoading: rsvpsLoading } = useEventRsvps(eventId);
  const { data: userProfile } = useUserProfile(isAuthenticated);
  const createMutation = useCreateRsvpMutation(eventId);
  const deleteMutation = useDeleteRsvpMutation(eventId);
  const [error, setError] = useState<string | null>(null);

  const isRsvped = useMemo(() => rsvps?.hasRsvped ?? false, [rsvps]);
  const totalCount = rsvps?.totalCount ?? 0;

  const isLoading = createMutation.isPending || deleteMutation.isPending;

  const handleClick = useCallback(() => {
    setError(null);

    if (!isAuthenticated) {
      const returnPath = PAGE_ROUTES.EVENT(eventId);
      router.push(PAGE_ROUTES.LOGIN_WITH_REASON_AND_RETURN(LOGIN_REASON.EVENT_RSVP, returnPath));
      return;
    }

    const userId = userProfile?.profile.id;
    const userName = userProfile?.profile.name;
    const isPublic = userProfile?.profile.publicProfile ?? false;

    if (!userId) {
      setError("Unable to RSVP. Please refresh the page.");
      return;
    }

    const userInfo = { userId, name: userName ?? null, isPublic };

    if (isRsvped) {
      deleteMutation.mutate(userInfo, {
        onError: (err) => {
          setError(err.message || "Failed to cancel RSVP. Please try again.");
        },
      });
    } else {
      createMutation.mutate(userInfo, {
        onError: (err) => {
          if (err.status === 429) {
            setError("Too many attempts. Please wait a moment.");
          } else if (err.status === 409) {
            setError("You've already RSVPed for this event.");
          } else {
            setError(err.message || "Failed to RSVP. Please try again.");
          }
        },
      });
    }
  }, [isAuthenticated, isRsvped, eventId, router, userProfile, createMutation, deleteMutation]);

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
            : "bg-gradient-to-r from-fuchsia-600 via-orange-500 to-red-600 shadow-orange-500/30"
        }`}
      >
        <div className="relative z-10 flex items-center justify-center gap-3">
          {isRsvped ? (
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
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-700 via-orange-600 to-red-700 opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </button>

      {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}

      {(rsvpsLoading || totalCount > 0) && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="font-semibold text-neutral-700 dark:text-neutral-200">
            {t("attendingLabel")}
          </span>
          <RsvpAvatarList eventId={eventId} />
        </div>
      )}
    </div>
  );
}
