"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { RecordingDetailedCard } from "@/components/recordings/RecordingDetailedCard";
import { WatchLaterLoadingSkeleton } from "@/components/recordings/RecordingLoadingSkeletons";
import { WatchLaterButton } from "@/components/recordings/WatchLaterButton";
import {
  ArrowRightIcon,
  BookmarkIcon,
  CalendarIcon,
  ClockIcon,
  PlayIcon,
} from "@/components/shared/Icons";
import { BackLink } from "@/components/ui/BackLink";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/errors";
import { useWatchlist } from "@/lib/api/user-profile";
import { getHasValidToken } from "@/lib/auth/client";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setWatchlist } from "@/lib/redux/slices/profileSlice";
import { LOGIN_REASON, PAGE_ROUTES } from "@/lib/routes/pages";
import { formatDateTimeUTC, formatLongDateUTC } from "@/lib/utils/locale";

const HERO_PANEL_CLASS =
  "rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,248,240,0.72)_0%,rgba(255,244,232,0.56)_100%)] shadow-[0_28px_60px_-36px_rgba(15,23,42,0.34)] ring-1 ring-white/35 backdrop-blur-xl backdrop-saturate-150 dark:border-white/20 dark:bg-[linear-gradient(180deg,rgba(16,16,18,0.78)_0%,rgba(10,10,12,0.62)_100%)] dark:shadow-[0_20px_48px_-32px_rgba(0,0,0,0.7)] dark:ring-white/10";

const HERO_WATCHLATER_BUTTON_CLASS =
  "rounded-xl border border-white/75 bg-white/52 px-3 py-2 text-sm text-neutral-950 shadow-[0_18px_34px_-24px_rgba(15,23,42,0.28)] hover:bg-white/68 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/16";

const QUEUE_FILTER_BUTTON_CLASS = "rounded-full border px-3 py-1.5 text-sm font-medium transition";

type WatchlistFilter = "recent" | "oldest" | "title";

export function WatchLaterClient() {
  const t = useTranslations("watchLaterPage");
  const tRecordings = useTranslations("recordings");
  const locale = useLocale();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const watchlistFromRedux = useAppSelector((state) => state.profile.watchlist);
  const [hasToken, setHasToken] = useState(false);
  const [activeFilter, setActiveFilter] = useState<WatchlistFilter>("recent");

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
    return <WatchLaterLoadingSkeleton label={t("loading")} />;
  }

  if (error) {
    return (
      <section className="relative overflow-hidden rounded-[32px] border border-rose-200 bg-white/75 p-6 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-8 dark:border-rose-500/30 dark:bg-white/5 dark:shadow-[0_30px_80px_-36px_rgba(0,0,0,0.85)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.12),transparent_28%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.2),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.16),transparent_30%)]" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-bold tracking-[0.3em] text-rose-600 uppercase dark:text-rose-300">
              {t("stateLabel")}
            </p>
            <h1 className="text-3xl font-black tracking-tight text-neutral-950 sm:text-4xl dark:text-white">
              {t("errorTitle")}
            </h1>
            <p className="mt-3 text-sm leading-6 text-neutral-600 sm:text-base dark:text-neutral-300">
              {t("error")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <BackLink href={PAGE_ROUTES.ME} className="min-w-[11rem] justify-center">
              {t("backToAccount")}
            </BackLink>
            <BackLink href={PAGE_ROUTES.LIBRARY} className="min-w-[11rem] justify-center">
              {tRecordings("backToLibrary")}
            </BackLink>
          </div>
        </div>
      </section>
    );
  }

  const allRecordings = getAllRecordings();
  const recordingsById = new Map(allRecordings.map((recording) => [recording.shortId, recording]));
  const addedAtByVideoId = new Map(
    (watchlistData?.items ?? []).map((item) => [item.videoId, item.addedAt] as const),
  );
  const watchlistRecordings = watchlistFromRedux
    .map((videoId) => {
      const recording = recordingsById.get(videoId);
      if (!recording) {
        return null;
      }

      return {
        ...recording,
        addedAt: addedAtByVideoId.get(videoId) ?? null,
      };
    })
    .filter((recording) => recording !== null)
    .sort((left, right) => {
      const leftTime = left.addedAt ? new Date(left.addedAt).getTime() : 0;
      const rightTime = right.addedAt ? new Date(right.addedAt).getTime() : 0;
      return rightTime - leftTime;
    });

  const isEmpty = watchlistRecordings.length === 0;
  const featuredRecording = watchlistRecordings[0] ?? null;
  const filteredRecordings = [...watchlistRecordings].sort((left, right) => {
    if (activeFilter === "title") {
      return left.title.localeCompare(right.title, locale, { sensitivity: "base" });
    }

    const leftTime = left.addedAt ? new Date(left.addedAt).getTime() : 0;
    const rightTime = right.addedAt ? new Date(right.addedAt).getTime() : 0;

    if (activeFilter === "oldest") {
      return leftTime - rightTime;
    }

    return rightTime - leftTime;
  });

  if (isEmpty) {
    return (
      <section className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/75 p-6 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-8 lg:p-10 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_30px_80px_-36px_rgba(0,0,0,0.85)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.14),transparent_28%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.18),transparent_28%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_20rem] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-brand-600 dark:text-brand-300 mb-3 text-xs font-bold tracking-[0.32em] uppercase">
              {t("eyebrow")}
            </p>
            <h1 className="max-w-2xl text-4xl leading-none font-black tracking-tight text-neutral-950 sm:text-5xl dark:text-white">
              {t("emptyTitle")}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-300">
              {t("emptyAction")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <BackLink href={PAGE_ROUTES.LIBRARY} className="min-w-[12rem] justify-center">
                {tRecordings("backToLibrary")}
              </BackLink>
              <BackLink href={PAGE_ROUTES.ME} className="min-w-[12rem] justify-center">
                {t("backToAccount")}
              </BackLink>
            </div>
          </div>

          <div className="rounded-[28px] border border-dashed border-neutral-300/80 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-rose-500 to-orange-400 text-white shadow-lg shadow-orange-500/25">
              <BookmarkIcon className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-950 dark:text-white">
              {t("empty")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
              {t("emptyHint")}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-black/15 shadow-[0_28px_65px_-32px_rgba(15,23,42,0.65)] sm:rounded-[32px] dark:border-white/10 dark:shadow-[0_28px_70px_-30px_rgba(0,0,0,0.85)]">
        {featuredRecording ? (
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${featuredRecording.thumbnail})` }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(108deg,rgba(15,23,42,0.42)_0%,rgba(15,23,42,0.14)_42%,rgba(15,23,42,0.48)_100%)] dark:bg-[linear-gradient(110deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.56)_48%,rgba(0,0,0,0.82)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.18),transparent_34%),radial-gradient(circle_at_84%_16%,rgba(249,115,22,0.28),transparent_34%),radial-gradient(circle_at_54%_72%,rgba(244,63,94,0.1),transparent_40%)] dark:bg-[radial-gradient(circle_at_22%_20%,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_85%_16%,rgba(249,115,22,0.16),transparent_36%)]" />
          </div>
        ) : null}

        <div className="relative z-10 flex min-h-[430px] flex-col px-4 py-4 sm:min-h-[520px] sm:px-8 sm:py-8 lg:px-10 lg:py-9">
          <BackLink
            href={PAGE_ROUTES.ME}
            className="mb-4 w-fit border-white/75 bg-white/44 text-neutral-950 shadow-[0_18px_34px_-24px_rgba(15,23,42,0.28)] backdrop-blur-md backdrop-saturate-150 hover:bg-white/58 sm:mb-0 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/16"
          >
            {t("backToAccount")}
          </BackLink>

          <div className="mt-auto grid gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_23rem] xl:items-end">
            <div className={`${HERO_PANEL_CLASS} min-w-0 p-5 sm:p-7`}>
              <p className="text-brand-600 dark:text-brand-300 mb-3 text-xs font-bold tracking-[0.32em] uppercase">
                {t("eyebrow")}
              </p>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <div className="max-w-2xl">
                  <h1 className="text-[2.1rem] leading-none font-black tracking-tight text-neutral-950 sm:text-4xl lg:text-[2.7rem] dark:text-white">
                    {t("title")}
                  </h1>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-700 sm:text-base dark:text-neutral-200">
                    {t("subtitle")}
                  </p>
                </div>
                <div className="ml-auto" />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="rounded-full border border-white/55 bg-white/26 px-4 py-2 text-sm font-semibold text-neutral-950 dark:border-white/20 dark:bg-white/8 dark:text-white">
                  {watchlistRecordings.length === 1
                    ? t("savedOne")
                    : t("saved", { count: watchlistRecordings.length })}
                </div>
              </div>
            </div>

            {featuredRecording ? (
              <div className={`${HERO_PANEL_CLASS} min-w-0 overflow-hidden bg-black/40 p-5 sm:p-6`}>
                <p className="text-[11px] font-bold tracking-[0.28em] text-neutral-600 uppercase dark:text-neutral-300">
                  {t("featuredLabel")}
                </p>
                <h2 className="mt-2 text-[1.7rem] font-black tracking-tight text-neutral-950 sm:text-2xl dark:text-white">
                  {featuredRecording.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-700 dark:text-neutral-200">
                  {featuredRecording.speaker.join(", ")}
                </p>

                <div className="mt-5 space-y-2 text-sm text-neutral-700 dark:text-neutral-200">
                  <div className="flex items-center gap-3">
                    <ClockIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                    <span>
                      {featuredRecording.addedAt
                        ? t("savedAt", {
                            date: formatDateTimeUTC(featuredRecording.addedAt, locale),
                          })
                        : t("savedRecently")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                    <span>{formatLongDateUTC(featuredRecording.date, locale)}</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-row flex-wrap gap-3">
                  <Button
                    href={PAGE_ROUTES.WATCH(featuredRecording.slug, featuredRecording.shortId)}
                    variant="primary"
                    className="min-w-[11rem] flex-1 justify-center sm:flex-none"
                  >
                    <PlayIcon className="h-4 w-4" />
                    {t("watchNow")}
                  </Button>
                  <WatchLaterButton
                    shortId={featuredRecording.shortId}
                    variant="icon"
                    size="sm"
                    showLabel
                    showLabelOnMobile
                    iconButtonClassName={HERO_WATCHLATER_BUTTON_CLASS}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.28em] text-neutral-500 uppercase dark:text-neutral-500">
              {t("queueLabel")}
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-neutral-950 dark:text-white">
              {watchlistRecordings.length === 1
                ? t("savedOne")
                : t("saved", { count: watchlistRecordings.length })}
            </h2>
          </div>
          <Link
            href={PAGE_ROUTES.LIBRARY}
            className="hover:text-brand-600 dark:hover:text-brand-300 inline-flex items-center gap-2 self-start text-sm font-semibold text-neutral-700 transition sm:self-auto dark:text-neutral-300"
          >
            {t("browseMore")}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["recent", "oldest", "title"] as const).map((filter) => {
            const isActive = activeFilter === filter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`${QUEUE_FILTER_BUTTON_CLASS} ${
                  isActive
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                    : "border-black/10 bg-white/70 text-neutral-600 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10"
                }`}
              >
                {t(`filters.${filter}`)}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredRecordings.map((recording) => (
            <div key={recording.shortId}>
              <RecordingDetailedCard
                variant="grid"
                shortId={recording.shortId}
                slug={recording.slug}
                title={recording.title}
                speaker={recording.speaker}
                date={recording.date}
                thumbnail={recording.thumbnail}
                location={recording.location}
                tags={recording.tags}
                access={recording.access}
                locale={locale}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
