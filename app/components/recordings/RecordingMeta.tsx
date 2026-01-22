import { LOCATIONS, type LocationValue } from "@/lib/config/constants";

import { Pill } from "../ui/Pill";

import { formatDate } from "./RecordingsCatalogTypes";

const metaBaseClass =
  "flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase text-neutral-600 dark:text-white/70";

function getLocationPillClass(location: LocationValue) {
  return location === LOCATIONS.PRAGUE
    ? "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
    : "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300";
}

export function RecordingMeta({
  location,
  date,
  locale,
  trackingClass,
}: {
  location: LocationValue;
  date: string;
  locale: string;
  trackingClass: string;
}) {
  return (
    <div className={`${metaBaseClass} ${trackingClass}`}>
      <Pill size="xxs" className={getLocationPillClass(location)}>
        {location}
      </Pill>
      <span className="text-neutral-400 dark:text-white/50">•</span>
      <span>{formatDate(date, locale)}</span>
    </div>
  );
}
