"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { UserAvatar } from "@/components/user/UserAvatar";
import { Link } from "@/i18n/navigation";
import { useEventRsvps } from "@/lib/api/events";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { makeAvatarSeedFromPublicId } from "@/lib/utils/hash-rng";

const MAX_VISIBLE_AVATARS = 6;
const AVATAR_SIZE = 20;
const AVATAR_OVERLAP = -8;

interface RsvpAvatarListProps {
  eventId: string;
}

export function RsvpAvatarList({ eventId }: RsvpAvatarListProps) {
  const t = useTranslations("events");
  const { data: rsvps, isLoading } = useEventRsvps(eventId);
  const [activeAvatarPublicId, setActiveAvatarPublicId] = useState<string | null>(null);

  const { visibleUsers, remainingCount, totalCount, privateCount } = useMemo(() => {
    if (!rsvps) {
      return { visibleUsers: [], remainingCount: 0, totalCount: 0, privateCount: 0 };
    }

    const visible = rsvps.publicUsers.slice(0, MAX_VISIBLE_AVATARS);
    const remaining = Math.max(0, rsvps.totalCount - visible.length - rsvps.privateCount);

    return {
      visibleUsers: visible,
      remainingCount: remaining,
      totalCount: rsvps.totalCount,
      privateCount: rsvps.privateCount,
    };
  }, [rsvps]);

  if (isLoading) {
    return (
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
  }

  if (totalCount === 0) {
    return (
      <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
        {t("beFirst")}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {visibleUsers.map((user, index) => (
          <Link
            key={user.publicId}
            href={PAGE_ROUTES.USER(user.publicId)}
            prefetch={false}
            className="group relative transition-all hover:scale-110"
            style={{
              marginLeft: index === 0 ? 0 : `${AVATAR_OVERLAP}px`,
              zIndex:
                activeAvatarPublicId === user.publicId
                  ? visibleUsers.length + 1
                  : visibleUsers.length - index,
            }}
            onMouseEnter={() => setActiveAvatarPublicId(user.publicId)}
            onMouseLeave={() =>
              setActiveAvatarPublicId((prev) => (prev === user.publicId ? null : prev))
            }
            onFocus={() => setActiveAvatarPublicId(user.publicId)}
            onBlur={() => setActiveAvatarPublicId((prev) => (prev === user.publicId ? null : prev))}
            title={user.name || undefined}
          >
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-full bg-emerald-200/30 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-emerald-500/20" />
              <UserAvatar
                avatarSeed={makeAvatarSeedFromPublicId(user.publicId)}
                className="relative ring-2 ring-white dark:ring-neutral-900"
                isTiny
                name={user.name}
                size={AVATAR_SIZE}
              />
            </div>
          </Link>
        ))}
      </div>

      {(remainingCount > 0 || privateCount > 0) && (
        <div className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
          {remainingCount > 0 && (
            <span className="text-neutral-500 dark:text-neutral-400">+{remainingCount}</span>
          )}

          {privateCount > 0 && (
            <>
              {(visibleUsers.length > 0 || remainingCount > 0) && (
                <span className="text-neutral-300 dark:text-neutral-600">•</span>
              )}
              <span className="text-neutral-500 dark:text-neutral-400">
                {privateCount === 1
                  ? t("onePrivateRsvp")
                  : t("multiplePrivateRsvps", { count: privateCount })}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
