import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { BoltIcon } from "@/components/shared/icons";
import { AccentBar } from "@/components/ui/AccentBar";
import { Link } from "@/i18n/navigation";
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
    <div className="relative overflow-hidden rounded-3xl border border-neutral-200/50 bg-white/80 shadow-xl shadow-black/5 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80 dark:shadow-black/20">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 via-transparent to-purple-50/10 dark:from-emerald-950/10 dark:via-transparent dark:to-purple-950/5" />

      <div className="relative border-b border-neutral-200/50 px-6 py-5 dark:border-white/10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AccentBar size="md" />
            <h2 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
              {t("boosted.title")}
            </h2>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm backdrop-blur-sm dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-200">
            <BoltIcon className="h-4 w-4" aria-hidden="true" />
            {boostItems.length}
          </span>
        </div>
      </div>
      <div className="relative p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
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
                className="group relative overflow-hidden rounded-xl border border-neutral-200/70 bg-white/50 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:bg-white hover:shadow-lg hover:shadow-emerald-500/10 dark:border-white/10 dark:bg-white/5 dark:hover:border-emerald-500/30 dark:hover:bg-white/10 dark:hover:shadow-emerald-500/20"
              >
                <div className="relative aspect-video overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                  <Image
                    src={boost.thumbnail}
                    alt={boost.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
                  <div className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
                    <BoltIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Boosted</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="mb-2 line-clamp-2 text-sm leading-snug font-semibold text-neutral-900 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                    {boost.title}
                  </h3>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {boost.speaker.slice(0, 2).map((name, idx) => (
                        <span
                          key={`${boost.shortId}-speaker-${name}`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400"
                        >
                          {idx > 0 && (
                            <span className="text-neutral-300 dark:text-neutral-600">•</span>
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
                    <div className="text-xs text-neutral-400 dark:text-neutral-500">
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
