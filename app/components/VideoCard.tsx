import Image from "next/image";
import Link from "next/link";
import { type LocationValue } from "../lib/constants";
import { MapPinIcon } from "./icons";
import { LocationPill } from "./LocationPill";

interface VideoCardProps {
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
}

export function VideoCard({
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
}: VideoCardProps) {
  const formattedDate = new Date(date).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/watch/${slug}-${shortId}`}
      className="glass-card group flex flex-col h-full cursor-pointer"
    >
      <div className="video-overlay relative aspect-video shrink-0 overflow-hidden rounded-t-3xl">
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover transition-all duration-700 ease-out group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(59,130,246,0.4)] dark:bg-brand-400" />
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {name}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-white/5">
            <span className="text-xs text-neutral-400 dark:text-neutral-500">{formattedDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
