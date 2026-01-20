import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AlbumImage } from "../components/AlbumImage";
import { HeroSlideshow } from "./HeroSlideshow";
import photoAlbums from "../data/photo-albums.json";
import { buildAlbumSlug, formatEpisodeTitle, getEpisodeById } from "../lib/episodes";

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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    title: t("photosTitle"),
    description: t("photosDescription"),
    openGraph: {
      title: t("photosTitle"),
      description: t("photosDescription"),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("photosTitle"),
      description: t("photosDescription"),
    },
  };
}

export default async function PhotosPage() {
  const t = await getTranslations("photos");
  const locale = await getLocale();

  const totalPhotos = albums.reduce((sum, album) => sum + album.count, 0);
  const heroCovers = albums.slice(0, 5);

  const landscapeImages = albums.flatMap((album) =>
    album.images
      .filter((img) => img.width > img.height)
      .map((img) => ({
        src: `${baseUrl}/${img.src}`,
        alt: getEpisodeById(album.episodeId)
          ? formatEpisodeTitle(getEpisodeById(album.episodeId)!)
          : album.id,
      })),
  );

  return (
    <>
      <Header />
      <main id="top" className="gradient-bg min-h-screen pb-24">
        <section className="relative">
          <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden sm:h-[80vh] sm:min-h-[600px]">
            <HeroSlideshow images={landscapeImages} interval={10000} />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-100 via-neutral-100/40 to-transparent dark:from-neutral-950 dark:via-neutral-950/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-100/80 via-transparent to-transparent dark:from-neutral-950/80" />

            <div className="absolute inset-x-0 bottom-0 px-4 pb-32 sm:px-6 sm:pb-40 lg:px-8 lg:pb-48">
              <div className="mx-auto max-w-7xl">
                <div className="max-w-3xl space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-black/10 px-4 py-1.5 text-sm font-medium text-neutral-900 backdrop-blur-sm dark:bg-white/10 dark:text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500 dark:bg-brand-400" />
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
                {heroCovers.slice(1, 5).map((album) => {
                  const episode = getEpisodeById(album.episodeId);
                  const title = episode ? formatEpisodeTitle(episode) : album.id;
                  return (
                    <div
                      key={album.id}
                      className="group aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100 shadow-2xl ring-1 ring-black/10 transition-transform hover:scale-[1.02] sm:rounded-3xl dark:bg-neutral-900 dark:ring-white/10"
                    >
                      <AlbumImage
                        src={`${baseUrl}/${album.cover.src}`}
                        alt={title}
                        className="h-full"
                        imgClassName="transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        fetchPriority="low"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="mt-12 flex flex-wrap items-end justify-between gap-8 border-t border-black/10 pt-8 sm:mt-16 sm:pt-12 dark:border-white/10">
                <div className="flex flex-wrap gap-8 sm:gap-16">
                  <div>
                    <div className="text-5xl font-black tabular-nums tracking-tighter text-neutral-900 sm:text-6xl lg:text-7xl dark:text-white">
                      {totalPhotos.toLocaleString(locale)}
                    </div>
                    <div className="mt-2 text-sm font-medium uppercase tracking-widest text-neutral-500">
                      {t("stats.photos")}
                    </div>
                  </div>
                  <div>
                    <div className="text-5xl font-black tabular-nums tracking-tighter text-neutral-900 sm:text-6xl lg:text-7xl dark:text-white">
                      {albums.length}
                    </div>
                    <div className="mt-2 text-sm font-medium uppercase tracking-widest text-neutral-500">
                      {t("stats.albums")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
          <section>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((album) => {
                const episode = getEpisodeById(album.episodeId);
                const title = episode ? formatEpisodeTitle(episode) : album.id;
                return (
                  <a
                    key={album.id}
                    href={`/photos/${toAlbumSlug(album)}`}
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
                  </a>
                );
              })}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
