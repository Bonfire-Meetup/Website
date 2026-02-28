"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useState } from "react";

import { AlbumImage } from "@/components/shared/AlbumImage";
import { AccentBar } from "@/components/ui/AccentBar";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { Lightbox } from "./[album]/Lightbox";
import { HeroSlideshow } from "./HeroSlideshow";

interface PhotosPageContentProps {
  albums: {
    id: string;
    slug: string;
    title: string;
    count: number;
    coverSrc: string;
    highlightSrc: string;
  }[];
  slideshowImages: { src: string; alt: string }[];
  totalPhotos: number;
}

const statPillClass =
  "inline-flex items-center gap-3 rounded-full border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(255,244,233,0.9)_100%)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500 ring-1 ring-white/60 shadow-[0_16px_30px_-20px_rgba(15,23,42,0.35)] dark:border-white/12 dark:bg-[linear-gradient(180deg,rgba(36,36,38,0.8)_0%,rgba(20,20,22,0.9)_100%)] dark:text-neutral-400 dark:ring-white/10 dark:shadow-[0_20px_36px_-24px_rgba(0,0,0,0.75)]";

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

export function PhotosPageContent({
  albums,
  slideshowImages,
  totalPhotos,
}: PhotosPageContentProps) {
  const t = useTranslations("photos");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const heroCovers = albums.length > 4 ? albums.slice(-4) : albums;
  const lightboxImages = heroCovers.map((album) => ({
    alt: album.title,
    src: album.highlightSrc,
  }));
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);
  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);
  const handleIndexChange = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);
  const featuredAlbums = albums.slice(0, 2);
  const archiveAlbums = albums.slice(2);

  return (
    <main id="top" className="gradient-bg min-h-screen pb-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-8rem] left-[-10rem] h-[24rem] w-[24rem] rounded-full bg-orange-500/14 blur-3xl" />
        <div className="absolute right-[-8rem] bottom-[-10rem] h-[28rem] w-[28rem] rounded-full bg-rose-500/12 blur-3xl" />
      </div>
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
              {heroCovers.map((album, index) => (
                <button
                  key={album.id}
                  type="button"
                  onClick={() => openLightbox(index)}
                  aria-label={t("openPhoto", { title: album.title })}
                  className="group aspect-[3/4] overflow-hidden rounded-2xl border border-black/8 bg-neutral-100 shadow-[0_24px_50px_-26px_rgba(15,23,42,0.45)] ring-1 ring-white/45 transition-all hover:-translate-y-0.5 hover:shadow-[0_28px_56px_-24px_rgba(15,23,42,0.5)] sm:cursor-zoom-in sm:rounded-3xl dark:border-white/10 dark:bg-neutral-900 dark:shadow-[0_24px_50px_-24px_rgba(0,0,0,0.8)] dark:ring-white/10"
                >
                  <AlbumImage
                    src={album.highlightSrc}
                    alt={album.title}
                    className="h-full"
                    imgClassName="transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    fetchPriority="low"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </button>
              ))}
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
        <section className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {featuredAlbums.map((album) => (
              <Link
                key={album.id}
                href={PAGE_ROUTES.PHOTOS_ALBUM(album.slug)}
                prefetch={false}
                className="group relative overflow-hidden rounded-[1.75rem] border border-black/10 bg-neutral-900 shadow-[0_32px_70px_-36px_rgba(15,23,42,0.65)] ring-1 ring-white/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_36px_80px_-34px_rgba(15,23,42,0.72)] dark:border-white/10 dark:ring-white/10"
              >
                <div className="aspect-[5/4] overflow-hidden">
                  <AlbumImage
                    src={album.coverSrc}
                    alt={album.title}
                    imgClassName="scale-105 transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                <div className="absolute right-4 bottom-4 left-4">
                  <div className="space-y-2">
                    <p className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.22em] text-white/85 uppercase backdrop-blur-md">
                      {t("albumPhotos", { count: album.count })}
                    </p>
                    <h3 className="text-xl leading-tight font-black text-white sm:text-2xl">
                      {album.title}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {archiveAlbums.length > 0 && (
            <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.86)_0%,rgba(255,244,231,0.82)_100%)] p-4 shadow-[0_28px_62px_-38px_rgba(15,23,42,0.52)] ring-1 ring-white/40 dark:border-white/10 dark:bg-[linear-gradient(160deg,rgba(26,26,28,0.82)_0%,rgba(14,14,15,0.9)_100%)] dark:ring-white/10">
              <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-bl-[3rem] bg-orange-500/12 blur-2xl dark:bg-orange-400/10" />
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                    {t("albumsTitle")}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {t("albumsSubtitle")}
                  </p>
                </div>
                <p className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-neutral-600 uppercase dark:border-white/15 dark:bg-white/5 dark:text-neutral-300">
                  {archiveAlbums.length}
                </p>
              </div>
              <div className="grid gap-3 sm:gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                {archiveAlbums.map((album, index) => (
                  <Link
                    key={album.id}
                    href={PAGE_ROUTES.PHOTOS_ALBUM(album.slug)}
                    prefetch={false}
                    className="group grid h-full overflow-hidden rounded-2xl border border-black/10 bg-white/75 shadow-[0_22px_42px_-30px_rgba(15,23,42,0.46)] ring-1 ring-white/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_58px_-30px_rgba(15,23,42,0.54)] sm:grid-cols-[180px_minmax(0,1fr)] dark:border-white/10 dark:bg-neutral-950/70 dark:ring-white/10"
                  >
                    <div className="aspect-[16/10] overflow-hidden sm:aspect-auto sm:h-full">
                      <AlbumImage
                        src={album.coverSrc}
                        alt={album.title}
                        imgClassName="transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 180px"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4 p-4">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase dark:text-neutral-400">
                          #{index + 3}
                        </p>
                        <h3 className="line-clamp-2 text-base font-semibold text-neutral-900 transition-colors group-hover:text-orange-700 dark:text-white dark:group-hover:text-orange-300">
                          {album.title}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {t("albumPhotos", { count: album.count })}
                        </p>
                      </div>
                      <div className="h-8 w-8 shrink-0 rounded-full border border-black/10 bg-white/70 p-2 text-neutral-500 transition-colors group-hover:text-orange-700 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:group-hover:text-orange-300">
                        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
                          <path
                            d="M7 17L17 7M17 7H9M17 7V15"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={closeLightbox}
          onIndexChange={handleIndexChange}
          downloadLabel={t("download")}
          closeLabel={tCommon("close")}
          previousLabel={tCommon("previous")}
          nextLabel={tCommon("next")}
        />
      )}
    </main>
  );
}
