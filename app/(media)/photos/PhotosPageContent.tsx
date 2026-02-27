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
        <section>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={PAGE_ROUTES.PHOTOS_ALBUM(album.slug)}
                prefetch={false}
                className="group overflow-hidden rounded-3xl border border-black/10 bg-white/80 shadow-[0_24px_50px_-30px_rgba(15,23,42,0.42)] ring-1 ring-white/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_60px_-28px_rgba(15,23,42,0.48)] dark:border-white/10 dark:bg-neutral-950/80 dark:shadow-[0_28px_54px_-24px_rgba(0,0,0,0.8)] dark:ring-white/10"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <AlbumImage
                    src={album.coverSrc}
                    alt={album.title}
                    imgClassName="transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(255,245,235,0.76)_100%)] p-5 dark:bg-[linear-gradient(180deg,rgba(26,26,28,0.82)_0%,rgba(14,14,15,0.9)_100%)]">
                  <h3 className="text-lg font-semibold text-neutral-900 transition-colors group-hover:text-orange-700 dark:text-white dark:group-hover:text-orange-300">
                    {album.title}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {t("albumPhotos", { count: album.count })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
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
