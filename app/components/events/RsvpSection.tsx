"use client";

import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

import { RsvpAvatarList } from "@/components/events/RsvpAvatarList";
import { useRouter } from "@/i18n/navigation";
import { useCreateRsvpMutation, useDeleteRsvpMutation, useUserRsvps } from "@/lib/api/events";
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
  const { data: userRsvps } = useUserRsvps(isAuthenticated);
  const { data: userProfile } = useUserProfile(isAuthenticated);
  const createMutation = useCreateRsvpMutation(eventId);
  const deleteMutation = useDeleteRsvpMutation(eventId);
  const [error, setError] = useState<string | null>(null);

  const isRsvped = useMemo(() => {
    if (!userRsvps) {
      return false;
    }
    return userRsvps.eventIds.includes(eventId);
  }, [userRsvps, eventId]);

  const isLoading = createMutation.isPending || deleteMutation.isPending;

  const handleClick = useCallback(() => {
    setError(null);

    if (!isAuthenticated) {
      const returnPath = `/event/${eventId}`;
      router.push(PAGE_ROUTES.LOGIN_WITH_REASON_AND_RETURN(LOGIN_REASON.EVENT_RSVP, returnPath));
      return;
    }

    const userId = userProfile?.profile.id;
    const userName = userProfile?.profile.name;

    if (!userId) {
      setError("Unable to RSVP. Please refresh the page.");
      return;
    }

    const userInfo = { userId, name: userName ?? null };

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
              <CheckFilledIcon className="h-5 w-5" />
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

      <div className="flex items-center justify-start">
        <RsvpAvatarList eventId={eventId} />
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 10L9 15L16 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}

function CheckFilledIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      height="20"
      viewBox="0 0 20 20"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clipRule="evenodd"
        d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20ZM15.8839 8.38388C16.372 7.89573 16.372 7.10427 15.8839 6.61612C15.3957 6.12796 14.6043 6.12796 14.1161 6.61612L9 11.7322L6.88388 9.61612C6.39573 9.12796 5.60427 9.12796 5.11612 9.61612C4.62796 10.1043 4.62796 10.8957 5.11612 11.3839L8.11612 14.3839C8.60427 14.872 9.39573 14.872 9.88388 14.3839L15.8839 8.38388Z"
        fillRule="evenodd"
      />
    </svg>
  );
}
