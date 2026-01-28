"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

import { AlbumImage } from "@/components/shared/AlbumImage";
import { AccentBar } from "@/components/ui/AccentBar";
import { PAGE_ROUTES } from "@/lib/routes/pages";

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

export function PhotosPageContent({
  albums,
  slideshowImages,
  totalPhotos,
}: PhotosPageContentProps) {
  const t = useTranslations("photos");
  const locale = useLocale();
  const heroCovers = albums.length > 4 ? albums.slice(-4) : albums;

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
              {heroCovers.map((album) => (
                <div
                  key={album.id}
                  className="group aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100 shadow-2xl ring-1 ring-black/10 transition-transform hover:scale-[1.02] sm:rounded-3xl dark:bg-neutral-900 dark:ring-white/10"
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
                </div>
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
                className="glass-card group no-hover-pop overflow-hidden"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <AlbumImage
                    src={album.coverSrc}
                    alt={album.title}
                    imgClassName="transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
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
    </main>
  );
}
