import { type LocationValue } from "@/lib/config/constants";
import { formatDate } from "@/lib/utils/locale";

import { RecordingHeaderMetaRow } from "./RecordingHeaderMetaRow";

const metaBaseClass =
  "flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase text-white/85 dark:text-white/75";

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
      separator={<span className="text-white/55 dark:text-white/45">•</span>}
    />
  );
}
