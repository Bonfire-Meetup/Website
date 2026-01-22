import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AccentBar } from "@/components/ui/AccentBar";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { AlbumImage } from "@/components/shared/AlbumImage";
import photoAlbums from "@/data/photo-albums.json";
import { episodes, buildAlbumSlug } from "@/lib/recordings/episodes";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import type { EpisodeEntry } from "@/lib/recordings/episodes";
import { getAllRecordings } from "@/lib/recordings/recordings";
import type { PhotoAlbum } from "@/lib/photos/types";

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
        id: episode.id,
        title: episode.title,
        city: episode.city,
        number: episode.number,
        date: episode.date ?? null,
        recordingsCount: episodeRecordings.length,
        photosCount: album?.count ?? 0,
        photosCover: album?.cover,
        videosHref: `${PAGE_ROUTES.LIBRARY}?episode=${episode.id}`,
        photosHref: album ? PAGE_ROUTES.PHOTOS_ALBUM(buildAlbumSlug(album.id, album.episodeId)) : undefined,
      };
    })
    .sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : 0;
      const bTime = b.date ? new Date(b.date).getTime() : 0;
      if (aTime !== bTime) return bTime - aTime;
      if (a.city !== b.city) return a.city.localeCompare(b.city);
      return b.number - a.number;
    });
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  const tCommon = await getTranslations("common");
  const commonValues = {
    brandName: tCommon("brandName"),
    prague: tCommon("prague"),
    zlin: tCommon("zlin"),
    country: tCommon("country"),
  };
  return {
    title: t("timelineTitle", commonValues),
    description: t("timelineDescription"),
    openGraph: {
      title: t("timelineTitle", commonValues),
      description: t("timelineDescription"),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("timelineTitle", commonValues),
      description: t("timelineDescription"),
    },
  };
}

export default async function TimelinePage() {
  const t = await getTranslations("timeline");
  const locale = await getLocale();
  const entries = getEpisodeEntries();

  return (
    <>
      <Header />
      <main className="gradient-bg min-h-screen pb-24 pt-28">
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="section-divider mx-auto mb-16 max-w-4xl" />

            <div className="relative">
              <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-brand-500/40 via-brand-500/15 to-transparent md:left-1/2 md:-translate-x-1/2" />
              <div className="space-y-12">
                {entries.map((entry, index) => {
                  const isRight = index % 2 === 1;
                  return (
                    <article
                      key={entry.id}
                      className="relative pl-10 md:grid md:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] md:items-stretch md:pl-0"
                    >
                      <div className="absolute left-[14px] top-8 h-4 w-4 rounded-full bg-brand-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] md:hidden" />
                      <div className="absolute left-[22px] top-10 h-px w-6 bg-gradient-to-r from-brand-500/70 to-transparent md:hidden" />
                      <div
                        className={
                          isRight
                            ? "md:col-start-2 md:col-end-4 md:row-start-1 md:justify-self-start"
                            : "md:col-start-1 md:col-end-3 md:row-start-1 md:justify-self-end"
                        }
                      >
                        <div className="glass-card group relative w-full max-w-[680px] overflow-hidden rounded-[28px] border border-brand-500/10 bg-white/80 shadow-[0_25px_60px_-35px_rgba(59,130,246,0.6)] backdrop-blur dark:border-brand-400/15 dark:bg-neutral-950/70 lg:max-w-[760px]">
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
                                <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-sm font-semibold uppercase tracking-[0.3em] text-neutral-400 dark:bg-neutral-900 dark:text-neutral-500">
                                  {t("noPhotos")}
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col gap-4 px-6 pb-6 pt-1 lg:py-6">
                              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400">
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
                      <div className="relative hidden md:flex md:col-start-2 md:row-start-1 items-start justify-center">
                        <div className="mt-10 h-4 w-4 rounded-full bg-brand-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
