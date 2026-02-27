"use client";

import { useTranslations } from "next-intl";

import { AlbumImage } from "@/components/shared/AlbumImage";
import { ArrowLeftIcon, ExternalLinkIcon } from "@/components/shared/Icons";
import { AccentBar } from "@/components/ui/AccentBar";
import { Button } from "@/components/ui/Button";
import photoAlbums from "@/data/photo-albums.json";
import { WEBSITE_URLS } from "@/lib/config/constants";
import type { PhotoAlbum } from "@/lib/photos/types";
import { buildAlbumSlug, formatEpisodeTitle, getEpisodeById } from "@/lib/recordings/episodes";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { AlbumGallery } from "./AlbumGallery";
import { AlbumShareButton } from "./AlbumShareButton";

const { baseUrl, albums } = photoAlbums as { baseUrl: string; albums: PhotoAlbum[] };

function toAlbumSlug(album: PhotoAlbum) {
  return buildAlbumSlug(album.id, album.episodeId);
}

interface AlbumPageContentProps {
  albumId: string;
}

export function AlbumPageContent({ albumId }: AlbumPageContentProps) {
  const t = useTranslations("photos");
  const tCommon = useTranslations("common");

  const album = albums.find((item) => albumId === item.id || albumId.startsWith(`${item.id}-`));

  if (!album) {
    return null;
  }

  const episode = getEpisodeById(album.episodeId);
  const title = episode ? formatEpisodeTitle(episode) : album.id;
  const photographers =
    album.photographers
      ?.map((photographer) => ({
        name: photographer.name.trim(),
        url: photographer.url?.trim(),
      }))
      .filter((photographer) => photographer.name.length > 0) ?? [];
  const shareUrl = `${WEBSITE_URLS.BASE}${PAGE_ROUTES.PHOTOS_ALBUM(toAlbumSlug(album))}`;
  const shareText = `${title} - ${tCommon("brandName")}`;

  return (
    <main className="gradient-bg min-h-screen pt-28 pb-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-8rem] right-[-10rem] h-[24rem] w-[24rem] rounded-full bg-orange-500/14 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-[-8rem] h-[24rem] w-[24rem] rounded-full bg-rose-500/10 blur-3xl" />
      </div>
      <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Button
            href={PAGE_ROUTES.PHOTOS}
            variant="ghost"
            size="sm"
            className="group items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 shadow-sm ring-1 ring-white/50 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:ring-white/10 dark:hover:bg-white/20"
          >
            <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>{t("backToAlbums")}</span>
          </Button>
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white/80 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.45)] ring-1 ring-white/50 dark:border-white/10 dark:bg-neutral-950/85 dark:shadow-[0_28px_60px_-28px_rgba(0,0,0,0.82)] dark:ring-white/10">
          <div className="relative aspect-[16/9] overflow-hidden">
            <AlbumImage
              src={`${baseUrl}/${album.cover.src}`}
              alt={title}
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 1152px) 100vw, 1152px"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/12 to-transparent" />
            <div className="absolute right-4 bottom-4 rounded-full border border-white/30 bg-black/55 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-white uppercase backdrop-blur-sm">
              {t("albumPhotos", { count: album.count })}
            </div>
          </div>
          <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.7)_0%,rgba(255,245,235,0.74)_100%)] p-6 sm:p-8 dark:bg-[linear-gradient(180deg,rgba(30,30,32,0.76)_0%,rgba(15,15,17,0.9)_100%)]">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">{title}</h1>
              <div className="shrink-0">
                <AlbumShareButton shareUrl={shareUrl} shareText={shareText} />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400">
              <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                {t("albumPhotos", { count: album.count })}
              </span>
              {photographers.length > 0 ? (
                <>
                  <span className="text-neutral-300 dark:text-neutral-600">•</span>
                  <span className="text-neutral-500 dark:text-neutral-400">
                    {t("photographersBy")}
                  </span>
                  <span className="flex flex-wrap items-center gap-2">
                    {photographers.map((photographer, index) => (
                      <span
                        key={`${photographer.name}-${photographer.url ?? "no-url"}`}
                        className="inline-flex items-center gap-2"
                      >
                        {photographer.url ? (
                          <a
                            href={photographer.url}
                            className="font-semibold text-neutral-800 underline decoration-transparent underline-offset-4 transition hover:decoration-current dark:text-neutral-100"
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            <span className="inline-flex items-center gap-1">
                              {photographer.name}
                              <ExternalLinkIcon
                                className="h-3.5 w-3.5 text-neutral-400"
                                aria-hidden="true"
                              />
                            </span>
                          </a>
                        ) : (
                          <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                            {photographer.name}
                          </span>
                        )}
                        {index < photographers.length - 1 ? (
                          <span className="text-neutral-300 dark:text-neutral-600">/</span>
                        ) : null}
                      </span>
                    ))}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <AccentBar />
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {t("galleryTitle")}
            </h2>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{t("galleryHint")}</p>
        </section>

        <AlbumGallery
          images={album.images}
          baseUrl={baseUrl}
          title={title}
          downloadLabel={t("download")}
          closeLabel={tCommon("close")}
          previousLabel={tCommon("previous")}
          nextLabel={tCommon("next")}
        />
      </div>
    </main>
  );
}
