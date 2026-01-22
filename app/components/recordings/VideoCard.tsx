import Link from "next/link";
import { memo } from "react";
import { type LocationValue } from "@/lib/config/constants";
import { BoltIcon, FireIcon, MapPinIcon } from "@/components/shared/icons";
import { LocationPill } from "@/components/locations/LocationPill";
import { RecordingImage } from "./RecordingImage";
import { formatDate } from "@/lib/utils/locale";
import { PAGE_ROUTES } from "@/lib/routes/pages";

type VideoCardProps = {
  shortId: string;
  slug: string;
  title: string;
  speaker: string[];
  date: string;
  thumbnail: string;
  location: LocationValue;
  locationLabel?: string;
  ariaLocationLabel?: string;
  locale?: string;
  likeCount?: number;
  boostCount?: number;
};

export const VideoCard = memo(function VideoCard({
  shortId,
  slug,
  title,
  speaker,
  date,
  thumbnail,
  location,
  locationLabel,
  ariaLocationLabel,
  locale = "en-US",
  likeCount,
  boostCount,
}: VideoCardProps) {
  const formattedDate = formatDate(date, locale);

  return (
    <Link
      href={PAGE_ROUTES.WATCH(slug, shortId)}
      className="glass-card group flex flex-col h-full cursor-pointer"
    >
      <div className="video-overlay relative shrink-0 overflow-hidden rounded-t-3xl">
        <RecordingImage
          src={thumbnail}
          alt={title}
          imgClassName="group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          fetchPriority="low"
        />

        <div className="absolute bottom-4 left-4 z-10">
          <LocationPill
            location={location}
            ariaLabel={ariaLocationLabel || locationLabel || location}
            icon={<MapPinIcon className="h-3.5 w-3.5" />}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-3 line-clamp-2 text-base font-semibold leading-snug text-neutral-900 transition-colors duration-300 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
          {title}
        </h3>

        <div className="mt-auto space-y-4">
          <div className="flex flex-col gap-2">
            {speaker.map((name) => (
              <div key={name} className="flex items-center gap-2.5">
                <span className="speaker-dot" />
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {name}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-white/5">
            <span className="text-xs text-neutral-400 dark:text-neutral-500">{formattedDate}</span>
            <div className="flex items-center gap-3">
              {typeof boostCount === "number" && boostCount > 0 && (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-500">
                  <BoltIcon className="h-3.5 w-3.5" />
                  {boostCount}
                </span>
              )}
              {typeof likeCount === "number" && likeCount > 0 && (
                <span className="flex items-center gap-1 text-xs font-medium text-rose-400">
                  <FireIcon className="h-3.5 w-3.5" />
                  {likeCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});
