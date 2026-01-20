import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Button } from "../../components/Button";
import { AlbumImage } from "../../components/AlbumImage";
import { AlbumGallery } from "./AlbumGallery";
import { ArrowLeftIcon } from "../../components/icons";
import photoAlbums from "../../data/photo-albums.json";
import { buildAlbumSlug, formatEpisodeTitle, getEpisodeById } from "../../lib/episodes";

type Album = {
  id: string;
  folder: string;
  cover: { src: string; width: number; height: number };
  images: { src: string; width: number; height: number }[];
  count: number;
  episodeId: string;
};

const { baseUrl, albums } = photoAlbums as { baseUrl: string; albums: Album[] };

function toAlbumSlug(album: Album) {
  return buildAlbumSlug(album.id, album.episodeId);
}

type PageProps = {
  params: Promise<{ album: string }>;
};

export function generateStaticParams() {
  return albums.map((album) => ({ album: toAlbumSlug(album) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations("meta");
  const { album: albumId } = await params;
  const album = albums.find((item) => albumId === item.id || albumId.startsWith(`${item.id}-`));
  if (!album) {
    return {
      title: t("photosTitle"),
      description: t("photosDescription"),
    };
  }
  const episode = getEpisodeById(album.episodeId);
  const title = episode ? formatEpisodeTitle(episode) : album.id;
  return {
    title: `${title} | ${t("photosTitle")}`,
    description: t("photosDescription"),
    openGraph: {
      title: `${title} | ${t("photosTitle")}`,
      description: t("photosDescription"),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${t("photosTitle")}`,
      description: t("photosDescription"),
    },
  };
}

export default async function AlbumPage({ params }: PageProps) {
  const t = await getTranslations("photos");
  const { album: albumId } = await params;
  const album = albums.find((item) => albumId === item.id || albumId.startsWith(`${item.id}-`));

  if (!album) {
    notFound();
  }
  const episode = getEpisodeById(album.episodeId);
  const title = episode ? formatEpisodeTitle(episode) : album.id;

  return (
    <>
      <Header />
      <main className="gradient-bg min-h-screen pt-28 pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="hidden items-center lg:flex">
            <Button href="/photos" variant="ghost" size="sm" className="group items-center gap-2">
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
              />
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">{title}</h1>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                    {t("albumPhotos", { count: album.count })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <AlbumGallery
            images={album.images}
            baseUrl={baseUrl}
            title={title}
            downloadLabel={t("download")}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
