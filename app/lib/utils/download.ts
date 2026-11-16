import { WEBSITE_URLS } from "@/lib/config/constants";

const DOWNLOAD_PREFIX = "/download";

/**
 * Browsers ignore the `download` attribute on cross-origin links, so CDN files are fetched
 * through the same-origin `/download` rewrite in next.config.ts.
 */
export function downloadHref(url: string): string {
  return url.startsWith(`${WEBSITE_URLS.CDN}/`)
    ? `${DOWNLOAD_PREFIX}${url.slice(WEBSITE_URLS.CDN.length)}`
    : url;
}

export function downloadFileName(url: string, fallback: string): string {
  return url.split(/[?#]/u)[0].split("/").pop() || fallback;
}
