export type PhotoAlbumImage = {
  src: string;
  width: number;
  height: number;
};

export type PhotoAlbumPhotographer = {
  name: string;
  url?: string;
};

export type PhotoAlbum = {
  id: string;
  folder: string;
  cover: PhotoAlbumImage;
  images: PhotoAlbumImage[];
  count: number;
  episodeId: string;
  photographers?: PhotoAlbumPhotographer[];
};
