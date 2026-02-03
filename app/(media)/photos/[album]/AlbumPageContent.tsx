"use client";

import type { PhotoAlbum } from "@/lib/photos/types";
import { useTranslations } from "next-intl";

import { AlbumImage } from "@/components/shared/AlbumImage";
import { ArrowLeftIcon, ExternalLinkIcon } from "@/components/shared/Icons";
import { Button } from "@/components/ui/Button";
import photoAlbums from "@/data/photo-albums.json";
import { WEBSITE_URLS } from "@/lib/config/constants";
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
      <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div className="hidden items-center lg:flex">
          <Button
            href={PAGE_ROUTES.PHOTOS}
            variant="ghost"
            size="sm"
            className="group items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>{t("backToAlbums")}</span>
          </Button>
        </div>
        <div className="glass-card no-hover-pop overflow-hidden">
          <div className="aspect-[16/9] overflow-hidden">
            <AlbumImage
              src={`${baseUrl}/${album.cover.src}`}
              alt={title}
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 1152px) 100vw, 1152px"
            />
          </div>
          <div className="p-6 sm:p-8">
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
                        key={`${photographer.name}-${index}`}
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
