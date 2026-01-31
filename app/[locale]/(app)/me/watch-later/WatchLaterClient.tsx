"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { VideoCard } from "@/components/recordings/VideoCard";
import { BookmarkIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/errors";
import { useWatchlist } from "@/lib/api/user-profile";
import { getHasValidToken } from "@/lib/auth/client";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setWatchlist } from "@/lib/redux/slices/profileSlice";
import { LOGIN_REASON, PAGE_ROUTES } from "@/lib/routes/pages";

export function WatchLaterClient() {
  const t = useTranslations("watchLaterPage");
  const tRecordings = useTranslations("recordings");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const watchlistFromRedux = useAppSelector((state) => state.profile.watchlist);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = getHasValidToken();
    setHasToken(token);
    if (!token) {
      router.push(PAGE_ROUTES.LOGIN);
    }
  }, [router]);

  const { data: watchlistData, isLoading, error } = useWatchlist(hasToken);

  useEffect(() => {
    if (watchlistData?.items) {
      const videoIds = watchlistData.items.map((item) => item.videoId);
      dispatch(setWatchlist(videoIds));
    }
  }, [watchlistData, dispatch]);

  useEffect(() => {
    if (error instanceof ApiError && error.status === 401) {
      router.replace(PAGE_ROUTES.LOGIN_WITH_REASON(LOGIN_REASON.SESSION_EXPIRED));
    }
  }, [error, router]);

  if (!hasToken) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <BookmarkIcon className="mb-4 h-12 w-12 text-neutral-400 dark:text-neutral-600" />
        <p className="text-lg text-neutral-600 dark:text-neutral-400">{t("loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-red-600 dark:text-red-400">{t("error")}</p>
      </div>
    );
  }

  const allRecordings = getAllRecordings();
  const watchlistRecordings = watchlistFromRedux
    .map((videoId) => allRecordings.find((rec) => rec.shortId === videoId))
    .filter((rec) => rec !== undefined);

  const isEmpty = watchlistRecordings.length === 0;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
          {t("title")}
        </h1>
        {!isEmpty && (
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            {watchlistRecordings.length === 1
              ? t("savedOne")
              : t("saved", { count: watchlistRecordings.length })}
          </p>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200/70 bg-white/60 px-6 py-20 shadow-sm dark:border-white/10 dark:bg-white/5">
          <BookmarkIcon className="mb-4 h-16 w-16 text-neutral-300 dark:text-neutral-700" />
          <p className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
            {t("empty")}
          </p>
          <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">{t("emptyAction")}</p>
          <Button
            onClick={() => router.push(PAGE_ROUTES.LIBRARY)}
            className="bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600"
          >
            {tRecordings("backToLibrary")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {watchlistRecordings.map((recording) => (
            <VideoCard
              key={recording.shortId}
              shortId={recording.shortId}
              slug={recording.slug}
              title={recording.title}
              speaker={recording.speaker}
              date={recording.date}
              thumbnail={recording.thumbnail}
              location={recording.location}
            />
          ))}
        </div>
      )}
    </div>
  );
}
