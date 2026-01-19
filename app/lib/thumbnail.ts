export function getProxiedThumbnailUrl(url: string) {
  return `/api/thumbnail?url=${encodeURIComponent(url)}`;
}
