import { type LocationValue } from "@/lib/config/constants";

import { RecordingHeaderMetaRow } from "./RecordingHeaderMetaRow";
import { formatDate } from "./RecordingsCatalogTypes";

const metaBaseClass =
  "flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase text-neutral-600 dark:text-white/70";

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
    <RecordingHeaderMetaRow
      location={location}
      formattedDate={formatDate(date, locale)}
      className={`${metaBaseClass} ${trackingClass}`}
      leftGroupClassName="flex flex-wrap items-center gap-2"
      metaGroupClassName="flex flex-wrap items-center gap-2"
      locationSize="xxs"
      locationClassName="tracking-normal"
      separator={<span className="text-neutral-400 dark:text-white/50">•</span>}
    />
  );
}
