export interface PhotoAlbumImage {
  src: string;
  width: number;
  height: number;
}

export interface PhotoAlbumPhotographer {
  name: string;
  url?: string;
}

export interface PhotoAlbum {
  id: string;
  folder: string;
  cover: PhotoAlbumImage;
  images: PhotoAlbumImage[];
  count: number;
  episodeId: string;
  photographers?: PhotoAlbumPhotographer[];
}
