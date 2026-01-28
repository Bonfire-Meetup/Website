import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { BoltIcon } from "@/components/shared/icons";
import { Link } from "@/i18n/navigation";
import { ENGAGEMENT_BRANDING } from "@/lib/config/engagement-branding";
import { getUserBoosts } from "@/lib/data/boosts";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { PAGE_ROUTES } from "@/lib/routes/pages";

interface BoostedVideosProps {
  userId: string;
}

export async function BoostedVideos({ userId }: BoostedVideosProps) {
  const t = await getTranslations("account.userProfile");

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
        const recording = recordingMap.get(boost.video_id);

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

  if (boostItems.length === 0) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-neutral-200/60 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/95">
      <div className="via-brand-500 absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-rose-500" />

      <div className="relative px-6 py-6 sm:px-8 sm:py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${ENGAGEMENT_BRANDING.boost.classes.activeGradient} shadow-lg`}
            >
              <BoltIcon className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-neutral-900 sm:text-2xl dark:text-white">
                {t("boosted.title")}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {boostItems.length} {boostItems.length === 1 ? "video" : "videos"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
          {boostItems.map((boost) => {
            const formattedDate = new Intl.DateTimeFormat("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(new Date(boost.date));

            return (
              <Link
                key={boost.shortId}
                href={PAGE_ROUTES.WATCH(boost.slug, boost.shortId)}
                prefetch={false}
                className="group relative overflow-hidden rounded-2xl border border-neutral-200/70 bg-white transition-all hover:border-neutral-300 hover:shadow-xl dark:border-white/10 dark:bg-neutral-800/60 dark:hover:border-white/20"
              >
                <div className="relative aspect-video overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                  <Image
                    src={boost.thumbnail}
                    alt={boost.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  <div className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
                    <BoltIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Boosted</span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="group-hover:text-brand-600 dark:group-hover:text-brand-400 mb-2.5 line-clamp-2 text-base leading-snug font-bold text-neutral-900 transition-colors dark:text-white">
                    {boost.title}
                  </h3>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {boost.speaker.slice(0, 2).map((name, idx) => (
                        <span
                          key={`${boost.shortId}-speaker-${name}`}
                          className="inline-flex items-center gap-1.5"
                        >
                          {idx > 0 && (
                            <span className="text-neutral-300 dark:text-neutral-600">•</span>
                          )}
                          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            {name}
                          </span>
                        </span>
                      ))}
                      {boost.speaker.length > 2 && (
                        <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                          +{boost.speaker.length - 2}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      <svg
                        className="h-3.5 w-3.5"
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
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
