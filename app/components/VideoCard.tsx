import Image from "next/image";
import Link from "next/link";
import { type LocationValue } from "../lib/constants";

interface VideoCardProps {
  shortId: string;
  slug: string;
  title: string;
  speaker: string[];
  date: string;
  thumbnail: string;
  url: string;
  description: string;
  location: LocationValue;
  locationLabel?: string;
  ariaLocationLabel?: string;
  locale?: string;
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
      />
    </svg>
  );
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
          <span
            className={`location-badge ${location.toLowerCase()}`}
            aria-label={ariaLocationLabel || locationLabel || location}
          >
            <MapPinIcon className="h-3.5 w-3.5" />
            {location}
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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
