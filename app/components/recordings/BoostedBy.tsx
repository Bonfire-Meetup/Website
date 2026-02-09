"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { BoltIcon } from "@/components/shared/Icons";
import { AvatarList } from "@/components/user/AvatarList";
import { type BoostedByData, useVideoBoosts } from "@/lib/api/video-engagement";

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

  const hasBoosts = Boolean(boostedBy && totalCount > 0);
  const usersWithPublicId = publicUsers.filter((user) => user.publicId);
  const remainingPublicCount = Math.max(0, usersWithPublicId.length - 5);

  return (
    <div
      className={`flex h-10 items-center gap-2 rounded-lg border px-3 py-2 transition-all duration-300 ${
        loading
          ? "border-neutral-200/30 bg-neutral-50/30 dark:border-neutral-700/20 dark:bg-neutral-800/20"
          : hasBoosts
            ? "border-neutral-200/30 bg-neutral-50/30 opacity-100 dark:border-neutral-700/20 dark:bg-neutral-800/20"
            : "border-transparent bg-transparent opacity-0"
      }`}
      aria-hidden={loading || !hasBoosts}
    >
      {loading ? (
        <>
          <div className="flex shrink-0 items-center gap-1.5">
            <div className="h-3 w-3 animate-pulse rounded bg-neutral-200 dark:bg-white/10" />
            <div className="h-3 w-20 animate-pulse rounded bg-neutral-200 dark:bg-white/10" />
          </div>
          <div className="flex flex-1 items-center gap-1.5">
            <div className="flex gap-1 sm:gap-0">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-6 w-6 animate-pulse rounded-full bg-neutral-200 dark:bg-white/10 ${
                    i === 1 ? "ml-0" : "ml-0 sm:-ml-2"
                  }`}
                />
              ))}
            </div>
          </div>
        </>
      ) : hasBoosts ? (
        <>
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
            <AvatarList
              users={usersWithPublicId}
              maxVisible={5}
              avatarSize={24}
              remainingCount={remainingPublicCount}
              privateCount={privateCount}
              onRenderRemainingCount={(count) => `+${count}`}
              onRenderPrivateCount={(count) =>
                count === 1 ? t("onePrivateBooster") : t("multiplePrivateBoosters", { count })
              }
              className="flex-1"
              avatarRingClassName="ring-1 ring-white/50 dark:ring-neutral-900/50"
              mobileSize="h-6 w-6"
              desktopSize="sm:h-6 sm:w-6"
            />
          </div>
        </>
      ) : (
        <div className="flex shrink-0 items-center gap-1.5">
          <BoltIcon
            className="h-3 w-3 text-neutral-300/50 dark:text-neutral-600/50"
            aria-hidden="true"
          />
          <span className="text-[11px] font-medium text-neutral-300/50 dark:text-neutral-600/50">
            {t("boostedBy")}
          </span>
        </div>
      )}
    </div>
  );
}
