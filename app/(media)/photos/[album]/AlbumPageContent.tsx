"use client";

import { useTranslations } from "next-intl";

import { AlbumImage } from "@/components/shared/AlbumImage";
import { ExternalLinkIcon } from "@/components/shared/Icons";
import { AccentBar } from "@/components/ui/AccentBar";
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
        <section className="space-y-4">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-black/10 shadow-[0_32px_70px_-36px_rgba(15,23,42,0.62)] ring-1 ring-white/30 dark:border-white/10 dark:shadow-[0_30px_66px_-30px_rgba(0,0,0,0.84)] dark:ring-white/10">
            <div className="relative aspect-[16/9] overflow-hidden">
              <AlbumImage
                src={`${baseUrl}/${album.cover.src}`}
                alt={title}
                loading="eager"
                fetchPriority="high"
                sizes="(max-width: 1152px) 100vw, 1152px"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/72 via-black/26 to-black/10" />
              <div className="absolute top-4 left-4 rounded-full border border-white/30 bg-black/50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-white uppercase backdrop-blur-sm">
                {t("albumPhotos", { count: album.count })}
              </div>
              <div className="absolute right-4 bottom-4 left-4 sm:right-6 sm:bottom-6 sm:left-6">
                <h1 className="max-w-3xl text-3xl leading-tight font-black text-white sm:text-4xl lg:text-5xl">
                  {title}
                </h1>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.86)_0%,rgba(255,244,231,0.82)_100%)] p-5 shadow-[0_24px_54px_-36px_rgba(15,23,42,0.52)] ring-1 ring-white/45 sm:p-6 dark:border-white/10 dark:bg-[linear-gradient(160deg,rgba(30,30,32,0.78)_0%,rgba(15,15,17,0.9)_100%)] dark:ring-white/10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                  {t("albumPhotos", { count: album.count })}
                </p>
                {photographers.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                    <span className="text-neutral-500 dark:text-neutral-400">
                      {t("photographersBy")}
                    </span>
                    <span className="text-neutral-300 dark:text-neutral-600">|</span>
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
                  </div>
                ) : null}
              </div>
              <div className="shrink-0">
                <AlbumShareButton shareUrl={shareUrl} shareText={shareText} />
              </div>
            </div>
          </div>
        </section>

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
