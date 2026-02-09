"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { AvatarList } from "@/components/user/AvatarList";
import { useEventRsvps } from "@/lib/api/events";

const MAX_VISIBLE_AVATARS = 6;
const AVATAR_SIZE = 20;
const AVATAR_OVERLAP = -8;

interface RsvpAvatarListProps {
  eventId: string;
}

export function RsvpAvatarList({ eventId }: RsvpAvatarListProps) {
  const t = useTranslations("events");
  const { data: rsvps, isLoading } = useEventRsvps(eventId);

  const { publicUsers, remainingCount, totalCount, privateCount } = useMemo(() => {
    if (!rsvps) {
      return { publicUsers: [], remainingCount: 0, totalCount: 0, privateCount: 0 };
    }

    const remaining = Math.max(0, rsvps.publicUsers.length - MAX_VISIBLE_AVATARS);

    return {
      publicUsers: rsvps.publicUsers,
      remainingCount: remaining,
      totalCount: rsvps.totalCount,
      privateCount: rsvps.privateCount,
    };
  }, [rsvps]);

  const loadingState = (
    <div className="flex items-center" aria-hidden="true">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-5 w-5 animate-pulse rounded-full bg-neutral-200 dark:bg-white/10"
          style={{ marginLeft: i === 1 ? 0 : `${AVATAR_OVERLAP}px` }}
        />
      ))}
    </div>
  );

  const emptyState = (
    <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
      {t("beFirst")}
    </span>
  );

  return (
    <AvatarList
      users={publicUsers}
      maxVisible={MAX_VISIBLE_AVATARS}
      avatarSize={AVATAR_SIZE}
      remainingCount={remainingCount}
      privateCount={privateCount}
      onRenderRemainingCount={(count) => `+${count}`}
      onRenderPrivateCount={(count) =>
        count === 1 ? t("onePrivateRsvp") : t("multiplePrivateRsvps", { count })
      }
      emptyState={totalCount === 0 ? emptyState : undefined}
      loadingState={isLoading ? loadingState : undefined}
      mobileSize="h-8 w-8"
      desktopSize="sm:h-5 sm:w-5"
    />
  );
}
