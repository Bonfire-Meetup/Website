"use client";

import type { PhotoAlbum } from "@/lib/photos/types";
import { useLocale, useTranslations } from "next-intl";

import { AlbumImage } from "@/components/shared/AlbumImage";
import { AccentBar } from "@/components/ui/AccentBar";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import photoAlbums from "@/data/photo-albums.json";
import { buildAlbumSlug, episodes, type EpisodeEntry } from "@/lib/recordings/episodes";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { PAGE_ROUTES } from "@/lib/routes/pages";

const { baseUrl, albums } = photoAlbums as { baseUrl: string; albums: PhotoAlbum[] };

function getEpisodeEntries(): EpisodeEntry[] {
  const recordings = getAllRecordings();

  return episodes
    .map((episode) => {
      const episodeRecordings = recordings.filter(
        (recording) => recording.episodeId === episode.id,
      );
      const album = albums.find((item) => item.episodeId === episode.id);

      return {
        city: episode.city,
        date: episode.date ?? null,
        id: episode.id,
        number: episode.number,
        photosCount: album?.count ?? 0,
        photosCover: album?.cover,
        photosHref: album
          ? PAGE_ROUTES.PHOTOS_ALBUM(buildAlbumSlug(album.id, album.episodeId))
          : undefined,
        recordingsCount: episodeRecordings.length,
        title: episode.title,
        videosHref: `${PAGE_ROUTES.LIBRARY_BROWSE}?episode=${episode.id}`,
      };
    })
    .sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : 0;
      const bTime = b.date ? new Date(b.date).getTime() : 0;

      if (aTime !== bTime) {
        return bTime - aTime;
      }

      if (a.city !== b.city) {
        return a.city.localeCompare(b.city);
      }

      return b.number - a.number;
    });
}

export function TimelinePageContent() {
  const t = useTranslations("timeline");
  const locale = useLocale();
  const entries = getEpisodeEntries();

  return (
    <main className="gradient-bg min-h-screen pt-28 pb-24">
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="section-divider mx-auto mb-16 max-w-4xl" />

          <div className="relative">
            <div className="absolute top-0 left-4 h-full w-px bg-gradient-to-b from-orange-500/40 via-orange-500/15 to-transparent md:left-1/2 md:-translate-x-1/2" />
            <div className="space-y-12">
              {entries.map((entry, index) => {
                const isRight = index % 2 === 1;

                return (
                  <article
                    key={entry.id}
                    className="relative pl-10 md:grid md:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] md:items-stretch md:pl-0"
                  >
                    <div className="absolute top-8 left-[14px] h-4 w-4 rounded-full bg-orange-500 shadow-[0_0_20px_var(--color-fire-mid-glow-strong)] md:hidden" />
                    <div className="absolute top-10 left-[22px] h-px w-6 bg-gradient-to-r from-orange-500/70 to-transparent md:hidden" />
                    <div
                      className={
                        isRight
                          ? "md:col-start-2 md:col-end-4 md:row-start-1 md:justify-self-start"
                          : "md:col-start-1 md:col-end-3 md:row-start-1 md:justify-self-end"
                      }
                    >
                      <div className="glass-card group relative w-full max-w-[680px] overflow-hidden rounded-[28px] border border-orange-500/10 bg-white/80 shadow-[0_25px_60px_-35px_var(--color-fire-mid-glow-6)] backdrop-blur lg:max-w-[760px] dark:border-orange-400/15 dark:bg-neutral-950/70">
                        <span
                          className={`pointer-events-none absolute -top-6 text-[90px] font-black tracking-tight text-neutral-900/5 sm:text-[130px] dark:text-white/5 ${
                            isRight ? "-right-4" : "-left-4"
                          }`}
                        >
                          {entry.number}
                        </span>
                        <div
                          className={`flex flex-col gap-6 ${
                            isRight ? "lg:flex-row" : "lg:flex-row-reverse"
                          }`}
                        >
                          <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[16/10] lg:w-[220px] xl:w-[260px]">
                            {entry.photosCover ? (
                              <AlbumImage
                                src={`${baseUrl}/${entry.photosCover.src}`}
                                alt={entry.title}
                                className="h-full w-full"
                                imgClassName="transition duration-700 group-hover:scale-105"
                                loading="lazy"
                                fetchPriority="low"
                                sizes="(max-width: 1024px) 100vw, 260px"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-sm font-semibold tracking-[0.3em] text-neutral-400 uppercase dark:bg-neutral-900 dark:text-neutral-500">
                                {t("noPhotos")}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                            {entry.date && (
                              <div
                                className={`absolute top-3 left-3 z-10 flex flex-col items-center rounded-md border border-white/20 bg-black/60 px-2 py-1 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-black/70 ${
                                  isRight ? "lg:right-3 lg:left-auto" : "lg:left-3"
                                }`}
                              >
                                <span className="text-[10px] leading-none font-bold tracking-wider text-white/90 uppercase">
                                  {new Date(entry.date).toLocaleDateString(locale, {
                                    month: "short",
                                  })}
                                </span>
                                <span className="text-lg leading-none font-black text-white">
                                  {new Date(entry.date).getDate()}
                                </span>
                                <span className="text-[9px] leading-none font-medium text-white/70">
                                  {new Date(entry.date).getFullYear()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col gap-4 px-6 pt-1 pb-6 lg:py-6">
                            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold tracking-[0.25em] text-neutral-500 uppercase dark:text-neutral-400">
                              <Pill
                                size="xxs"
                                className={
                                  entry.city === "prague"
                                    ? "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
                                    : "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                                }
                              >
                                {entry.city === "prague" ? t("prague") : t("zlin")}
                              </Pill>
                              <span>•</span>
                              <span>
                                {t("episodeLabel")} {entry.number}
                              </span>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <AccentBar />
                                <h2 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-white">
                                  {entry.title}
                                </h2>
                              </div>
                              <div className="flex flex-wrap gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                                <span>
                                  {entry.recordingsCount.toLocaleString(locale)} {t("videos")}
                                </span>
                                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                                <span>
                                  {entry.photosCount.toLocaleString(locale)} {t("photos")}
                                </span>
                              </div>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-3 sm:flex-nowrap">
                              <Button href={entry.videosHref} variant="primary" size="sm">
                                {t("watchVideos")}
                              </Button>
                              <Button
                                href={entry.photosHref ?? PAGE_ROUTES.PHOTOS}
                                variant="ghost"
                                size="sm"
                              >
                                {entry.photosHref ? t("viewPhotos") : t("browsePhotos")}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="relative hidden items-start justify-center md:col-start-2 md:row-start-1 md:flex">
                      <div className="mt-10 h-4 w-4 rounded-full bg-orange-500 shadow-[0_0_20px_var(--color-fire-mid-glow-strong)]" />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
