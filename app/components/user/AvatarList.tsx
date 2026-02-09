"use client";

import { useState } from "react";

import { UserAvatar } from "@/components/user/UserAvatar";
import { Link } from "@/i18n/navigation";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { makeAvatarSeedFromPublicId } from "@/lib/utils/hash-rng";

interface User {
  publicId: string;
  name?: string | null;
}

interface AvatarListProps {
  users: User[];
  maxVisible?: number;
  avatarSize?: number;
  remainingCount?: number;
  privateCount?: number;
  onRenderRemainingCount?: (count: number) => React.ReactNode;
  onRenderPrivateCount?: (count: number) => React.ReactNode;
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  className?: string;
  avatarRingClassName?: string;
  mobileSize?: string;
  desktopSize?: string;
}

export function AvatarList({
  users,
  maxVisible = 6,
  avatarSize = 20,
  remainingCount = 0,
  privateCount = 0,
  onRenderRemainingCount,
  onRenderPrivateCount,
  emptyState,
  loadingState,
  className = "",
  avatarRingClassName = "ring-2 ring-white dark:ring-neutral-900",
  mobileSize = "h-8 w-8",
  desktopSize = "sm:h-5 sm:w-5",
}: AvatarListProps) {
  const [activeAvatarPublicId, setActiveAvatarPublicId] = useState<string | null>(null);

  if (loadingState) {
    return loadingState;
  }

  const visibleUsers = users.slice(0, maxVisible);
  const totalCount = users.length + remainingCount + privateCount;

  if (totalCount === 0 && emptyState) {
    return emptyState;
  }

  if (visibleUsers.length === 0) {
    return null;
  }

  const getScaleForIndex = (index: number, hoveredIndex: number | null): number => {
    if (hoveredIndex === null) {
      return 1;
    }
    const distance = Math.abs(index - hoveredIndex);
    if (distance === 0) {
      return 1.3;
    }
    if (distance === 1) {
      return 1.15;
    }
    if (distance === 2) {
      return 1.05;
    }
    return 1;
  };

  const hoveredIndex =
    activeAvatarPublicId !== null
      ? visibleUsers.findIndex((u) => u.publicId === activeAvatarPublicId)
      : null;

  return (
    <>
      <style>{`
        @media (min-width: 640px) {
          .avatar-dock-item {
            transition: transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
          }
        }
      `}</style>
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1 sm:gap-0">
          {visibleUsers.map((user, index) => {
            const isHovered = activeAvatarPublicId === user.publicId;
            const scale = getScaleForIndex(index, hoveredIndex);

            return (
              <Link
                key={user.publicId}
                href={PAGE_ROUTES.USER(user.publicId)}
                prefetch={false}
                className={`avatar-dock-item group focus-visible:ring-brand-400/65 dark:focus-visible:ring-brand-400/70 relative flex ${mobileSize} ${desktopSize} items-center justify-center rounded-full transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-white focus-visible:outline-none active:scale-95 active:opacity-80 motion-safe:hover:scale-110 motion-safe:active:scale-95 sm:hover:shadow-lg sm:hover:shadow-emerald-500/20 sm:active:scale-100 ${
                  index === 0 ? "ml-0" : "ml-0 sm:-ml-2"
                } dark:focus-visible:ring-offset-neutral-900`}
                style={{
                  zIndex: isHovered ? visibleUsers.length + 1 : visibleUsers.length - index,
                  transform: hoveredIndex !== null ? `scale(${scale})` : undefined,
                }}
                onMouseEnter={() => setActiveAvatarPublicId(user.publicId)}
                onMouseLeave={() => setActiveAvatarPublicId(null)}
                onFocus={() => setActiveAvatarPublicId(user.publicId)}
                onBlur={() => setActiveAvatarPublicId(null)}
                onTouchStart={() => setActiveAvatarPublicId(user.publicId)}
                onTouchEnd={() => setTimeout(() => setActiveAvatarPublicId(null), 150)}
                aria-label={user.name ? `View ${user.name}'s profile` : "View user profile"}
                title={user.name || undefined}
              >
                <div className="relative">
                  <div className="absolute -inset-0.5 rounded-full bg-emerald-200/30 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-60 sm:transition-all sm:duration-300 sm:ease-out sm:group-hover:-inset-1 sm:group-hover:opacity-100 dark:bg-emerald-500/20" />
                  <div className="absolute inset-0 rounded-full bg-emerald-500/10 opacity-0 transition-opacity group-active:opacity-100 sm:hidden" />
                  <UserAvatar
                    avatarSeed={makeAvatarSeedFromPublicId(user.publicId)}
                    className={`relative ${avatarRingClassName} transition-all duration-200 sm:transition-all sm:duration-300 sm:ease-out`}
                    isTiny
                    name={user.name}
                    size={avatarSize}
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {(remainingCount > 0 || privateCount > 0) && (
          <div className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
            {remainingCount > 0 && onRenderRemainingCount && (
              <span className="text-neutral-500 dark:text-neutral-400">
                {onRenderRemainingCount(remainingCount)}
              </span>
            )}

            {privateCount > 0 && onRenderPrivateCount && (
              <>
                {(visibleUsers.length > 0 || remainingCount > 0) && (
                  <span className="text-neutral-300 dark:text-neutral-600">•</span>
                )}
                <span className="text-neutral-500 dark:text-neutral-400">
                  {onRenderPrivateCount(privateCount)}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
