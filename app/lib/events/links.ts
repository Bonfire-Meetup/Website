import { WEBSITE_URLS } from "@/lib/config/constants";

export function getGoogleMapsSearchUrl(address: string) {
  return `${WEBSITE_URLS.GOOGLE.MAPS_SEARCH}?api=1&query=${encodeURIComponent(address)}`;
}
