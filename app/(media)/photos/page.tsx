import type { PhotoAlbum } from "@/lib/photos/types";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AlbumImage } from "@/components/shared/AlbumImage";
import { AccentBar } from "@/components/ui/AccentBar";
import photoAlbums from "@/data/photo-albums.json";
import { Link } from "@/i18n/navigation";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { buildAlbumSlug, formatEpisodeTitle, getEpisodeById } from "@/lib/recordings/episodes";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { HeroSlideshow } from "./HeroSlideshow";

const { baseUrl, albums } = photoAlbums as { baseUrl: string; albums: PhotoAlbum[] };

function toAlbumSlug(album: PhotoAlbum) {
  return buildAlbumSlug(album.id, album.episodeId);
}

function hashSeed(input: string) {
  let hash = 0;

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }

  return Math.abs(hash);
}

function pickDailyRandomImage(album: PhotoAlbum, seed: string) {
  const coverSrc = album.cover.src;
  const candidates = album.images.filter((img) => img.src !== coverSrc);

  if (candidates.length === 0) {
    return album.cover;
  }

  const index = hashSeed(`${seed}-${album.id}`) % candidates.length;

  return candidates[index];
}

function pickRandomImages<T>(images: T[], limit: number) {
  if (images.length <= limit) {
    return images;
  }

  const pool = [...images];

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, limit);
}

const statPillClass =
  "inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500 ring-1 ring-black/5 dark:bg-white/10 dark:text-neutral-400 dark:ring-white/10";

function StatPill({ value, label }: { value: string | number; label: string }) {
  return (
    <div className={statPillClass}>
      <span className="text-lg font-bold text-neutral-900 tabular-nums dark:text-white">
        {value}
      </span>
      {label}
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = await getTranslations({ locale, namespace: "meta" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const commonValues = {
    brandName: tCommon("brandName"),
    country: tCommon("country"),
    prague: tCommon("prague"),
    zlin: tCommon("zlin"),
  };

  return {
    description: t("photosDescription", commonValues),
    openGraph: {
      description: t("photosDescription", commonValues),
      title: t("photosTitle", commonValues),
      type: "website",
    },
    title: t("photosTitle", commonValues),
    twitter: {
      card: "summary_large_image",
      description: t("photosDescription", commonValues),
      title: t("photosTitle", commonValues),
    },
  };
}

export default async function PhotosPage() {
  const locale = await getRequestLocale();
  const t = await getTranslations({ locale, namespace: "photos" });

  const totalPhotos = albums.reduce((sum, album) => sum + album.count, 0);
  const heroCovers = albums.length > 4 ? albums.slice(-4) : albums;
  const dailySeed = new Date().toISOString().slice(0, 10);

  const landscapeImages = albums.flatMap((album) =>
    album.images
      .filter((img) => img.width > img.height)
      .map((img) => ({
        alt: (() => {
          const episode = getEpisodeById(album.episodeId);

          return episode ? formatEpisodeTitle(episode) : album.id;
        })(),
        src: `${baseUrl}/${img.src}`,
      })),
  );
  const slideshowImages = pickRandomImages(landscapeImages, 10);

  return (
    <main id="top" className="gradient-bg min-h-screen pb-24">
      <section className="relative">
        <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden sm:h-[80vh] sm:min-h-[600px]">
          <HeroSlideshow images={slideshowImages} interval={10000} />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-100 via-neutral-100/40 to-transparent dark:from-neutral-950 dark:via-neutral-950/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-100/80 via-transparent to-transparent dark:from-neutral-950/80" />

          <div className="absolute inset-x-0 bottom-0 px-4 pb-32 sm:px-6 sm:pb-40 lg:px-8 lg:pb-48">
            <div className="mx-auto max-w-7xl">
              <div className="max-w-3xl space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-black/10 px-4 py-1.5 text-sm font-medium text-neutral-900 backdrop-blur-sm dark:bg-white/10 dark:text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500 dark:bg-orange-400" />
                  {t("eyebrow")}
                </div>
                <h1 className="text-5xl font-black tracking-tight text-neutral-900 sm:text-7xl lg:text-8xl dark:text-white">
                  {t("title")}
                </h1>
                <p className="max-w-md text-lg text-neutral-700 dark:text-neutral-300">
                  {t("subtitle")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative -mt-20 px-4 sm:-mt-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:gap-6">
              {heroCovers.map((album) => {
                const episode = getEpisodeById(album.episodeId);
                const title = episode ? formatEpisodeTitle(episode) : album.id;
                const highlight = pickDailyRandomImage(album, dailySeed);

                return (
                  <div
                    key={album.id}
                    className="group aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100 shadow-2xl ring-1 ring-black/10 transition-transform hover:scale-[1.02] sm:rounded-3xl dark:bg-neutral-900 dark:ring-white/10"
                  >
                    <AlbumImage
                      src={`${baseUrl}/${highlight.src}`}
                      alt={title}
                      className="h-full"
                      imgClassName="transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      fetchPriority="low"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider mx-auto mt-20 max-w-4xl" />

      <div className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-3">
              <AccentBar />
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                {t("albumsTitle")}
              </h2>
            </div>
            <p className="text-base text-neutral-600 dark:text-neutral-300">
              {t("albumsSubtitle")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatPill value={albums.length} label={t("stats.albums")} />
            <StatPill value={totalPhotos.toLocaleString(locale)} label={t("stats.photos")} />
          </div>
        </div>
        <section>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => {
              const episode = getEpisodeById(album.episodeId);
              const title = episode ? formatEpisodeTitle(episode) : album.id;

              return (
                <Link
                  key={album.id}
                  href={PAGE_ROUTES.PHOTOS_ALBUM(toAlbumSlug(album))}
                  prefetch={false}
                  className="glass-card group no-hover-pop overflow-hidden"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <AlbumImage
                      src={`${baseUrl}/${album.cover.src}`}
                      alt={title}
                      imgClassName="transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                      {t("albumPhotos", { count: album.count })}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
