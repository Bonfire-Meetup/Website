import shortLinks from "@/data/short-links.json";

import { PAGE_ROUTES } from "./pages";

export function getShortPath(destination: string): string | undefined {
  const entry = Object.entries(shortLinks).find(([, dest]) => dest === destination);
  return entry ? PAGE_ROUTES.SHORT_LINK(entry[0]) : undefined;
}
