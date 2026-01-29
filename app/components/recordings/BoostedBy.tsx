"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { BoltIcon } from "@/components/shared/icons";
import { UserAvatar } from "@/components/user/UserAvatar";
import { Link } from "@/i18n/navigation";
import { type BoostedByData, useVideoBoosts } from "@/lib/api/video-engagement";
import { PAGE_ROUTES } from "@/lib/routes/pages";

interface BoostedByProps {
  boostedBy?: BoostedByData | null;
  shortId: string;
}

export function BoostedBy({ boostedBy: boostedByProp, shortId }: BoostedByProps) {
  const t = useTranslations("recordings");

  const shouldFetch = Boolean(shortId) && boostedByProp === undefined;
  const boostsQuery = useVideoBoosts(shortId, shouldFetch);

  const boostedBy: BoostedByData | null =
    boostedByProp === undefined ? (boostsQuery.data?.boostedBy ?? null) : boostedByProp;

  const loading = boostedByProp === undefined && boostsQuery.isLoading;

  const { publicUsers, privateCount, totalCount } = useMemo(() => {
    const pu = boostedBy?.publicUsers ?? [];
    const pc = boostedBy?.privateCount ?? 0;
    return { privateCount: pc, publicUsers: pu, totalCount: pu.length + pc };
  }, [boostedBy]);

  if (loading) {
    return (
      <div
        className="flex h-10 items-center gap-2 rounded-lg border border-neutral-200/30 bg-neutral-50/30 px-3 py-2 dark:border-neutral-700/20 dark:bg-neutral-800/20"
        aria-hidden="true"
      >
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="h-3 w-3 animate-pulse rounded bg-neutral-200 dark:bg-white/10" />
          <div className="h-3 w-20 animate-pulse rounded bg-neutral-200 dark:bg-white/10" />
        </div>
        <div className="flex flex-1 items-center gap-1.5">
          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-6 w-6 animate-pulse rounded-full bg-neutral-200 dark:bg-white/10"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!boostedBy || totalCount === 0) {
    return null;
  }

  const publicUsersTop = publicUsers.slice(0, 5);
  const usersWithLink = publicUsersTop
    .filter((user) => user.publicId)
    .map((user) => ({ publicId: user.publicId, user }));

  const remainingPublicCount = Math.max(0, publicUsers.length - publicUsersTop.length);

  return (
    <div className="flex items-center gap-2 rounded-lg border border-neutral-200/30 bg-neutral-50/30 px-3 py-2 dark:border-neutral-700/20 dark:bg-neutral-800/20">
      <div className="flex shrink-0 items-center gap-1.5">
        <BoltIcon
          className="h-3 w-3 text-emerald-600/70 dark:text-emerald-400/70"
          aria-hidden="true"
        />
        <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
          {t("boostedBy")}
        </span>
      </div>

      <div className="flex flex-1 items-center gap-1.5">
        <div className="flex items-center gap-1.5">
          {usersWithLink.map(({ user, publicId }) => (
            <Link
              key={publicId}
              href={PAGE_ROUTES.USER(publicId)}
              prefetch={false}
              className="group relative transition-all hover:z-10 hover:scale-105"
              title={user.name || undefined}
            >
              <div className="relative">
                <div className="absolute -inset-0.5 rounded-full bg-emerald-200/30 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-emerald-500/20" />
                <UserAvatar
                  avatarSeed={publicId}
                  size={24}
                  name={user.name}
                  className="relative ring-1 ring-white/50 dark:ring-neutral-900/50"
                />
              </div>
            </Link>
          ))}
        </div>

        {(remainingPublicCount > 0 || privateCount > 0) && (
          <div className="flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500">
            {remainingPublicCount > 0 && (
              <span className="text-neutral-400 dark:text-neutral-500">
                +{remainingPublicCount}
              </span>
            )}

            {privateCount > 0 && (
              <>
                {(publicUsersTop.length > 0 || remainingPublicCount > 0) && (
                  <span className="text-neutral-300 dark:text-neutral-600">•</span>
                )}
                <span className="text-neutral-400 dark:text-neutral-500">
                  {privateCount === 1
                    ? t("onePrivateBooster")
                    : t("multiplePrivateBoosters", { count: privateCount })}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
