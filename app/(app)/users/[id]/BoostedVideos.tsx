import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";

import { BoltIcon } from "@/components/shared/Icons";
import { Link } from "@/i18n/navigation";
import { getUserBoosts } from "@/lib/data/boosts";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { OwnerOnlyAction } from "./OwnerOnlyAction";

interface BoostedVideosProps {
  userId: string;
  profileUserId: string;
}

export async function BoostedVideos({ userId, profileUserId }: BoostedVideosProps) {
  const t = await getTranslations("account.userProfile");
  const locale = await getLocale();

  let boostItems: {
    date: string;
    shortId: string;
    slug: string;
    speaker: string[];
    thumbnail: string;
    title: string;
  }[] = [];

  try {
    const boosts = await getUserBoosts(userId);
    const recordings = getAllRecordings();
    const recordingMap = new Map(recordings.map((recording) => [recording.shortId, recording]));

    const getWatchSlug = (recording: { slug: string; shortId: string }) =>
      `${recording.slug}-${recording.shortId}`;

    boostItems = boosts
      .map((boost) => {
        const recording = recordingMap.get(boost.videoId);

        if (!recording) {
          return null;
        }

        return {
          date: recording.date,
          shortId: recording.shortId,
          slug: getWatchSlug(recording),
          speaker: recording.speaker,
          thumbnail: recording.thumbnail,
          title: recording.title,
        };
      })
      .filter((item) => item !== null) as {
      date: string;
      shortId: string;
      slug: string;
      speaker: string[];
      thumbnail: string;
      title: string;
    }[];
  } catch {
    boostItems = [];
  }

  return (
    <section
      className="relative"
      role="region"
      aria-labelledby="profile-boosted-videos-heading"
      aria-describedby="profile-boosted-videos-count"
    >
      <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-b from-emerald-500/5 to-transparent" />

      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur-sm dark:border-white/5 dark:bg-neutral-900/50">
        <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        <div className="px-6 pt-6 pb-2 sm:px-8 sm:pt-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-emerald-500/30 blur-lg" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25">
                <BoltIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
            </div>
            <div>
              <h2
                id="profile-boosted-videos-heading"
                className="text-xl font-black tracking-tight text-neutral-900 sm:text-2xl dark:text-white"
              >
                {t("boosted.title")}
              </h2>
              <p id="profile-boosted-videos-count" className="text-sm text-neutral-500">
                {t("boosted.count", { count: boostItems.length })}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {boostItems.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {boostItems.map((boost, index) => {
                const formattedDate = new Intl.DateTimeFormat(locale, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }).format(new Date(boost.date));

                return (
                  <Link
                    key={boost.shortId}
                    href={PAGE_ROUTES.WATCH(boost.slug, boost.shortId)}
                    prefetch={false}
                    className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 transition-all duration-300 hover:border-emerald-500/30 hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 focus-visible:outline-none dark:border-white/5 dark:bg-neutral-800/50 dark:hover:bg-neutral-800/80 dark:focus-visible:ring-offset-neutral-900"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={boost.thumbnail}
                        alt={boost.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />

                      <div className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
                        <BoltIcon className="h-3 w-3" aria-hidden="true" />
                        <span>{t("boosted.badge")}</span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="mb-2 line-clamp-2 text-sm leading-snug font-bold text-neutral-900 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-300">
                        {boost.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        {boost.speaker.slice(0, 2).map((name, idx) => (
                          <span
                            key={`${boost.shortId}-speaker-${name}`}
                            className="text-xs text-neutral-500 dark:text-neutral-400"
                          >
                            {idx > 0 && (
                              <span className="mr-2 text-neutral-400 dark:text-neutral-600">•</span>
                            )}
                            {name}
                          </span>
                        ))}
                        {boost.speaker.length > 2 && (
                          <span className="text-xs text-neutral-400 dark:text-neutral-500">
                            +{boost.speaker.length - 2}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {formattedDate}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div
              className="rounded-xl border border-dashed border-emerald-500/25 bg-emerald-500/5 p-5 text-sm"
              role="status"
              aria-live="polite"
            >
              <p className="font-semibold text-neutral-800 dark:text-neutral-100">
                {t("boosted.empty")}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                {t("boosted.emptyHint")}
              </p>
              <OwnerOnlyAction profileUserId={profileUserId}>
                <div className="mt-3">
                  <Link
                    href={PAGE_ROUTES.LIBRARY_BROWSE}
                    className="inline-flex items-center rounded-lg border border-emerald-500/30 bg-white/80 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 focus-visible:outline-none dark:bg-neutral-900/60 dark:text-emerald-300 dark:hover:bg-emerald-500/10 dark:focus-visible:ring-offset-neutral-900"
                  >
                    {t("boosted.cta")}
                  </Link>
                </div>
              </OwnerOnlyAction>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
