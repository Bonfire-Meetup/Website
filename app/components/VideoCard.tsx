"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface VideoCardProps {
  id: string;
  slug: string;
  title: string;
  speaker: string;
  date: string;
  thumbnail: string;
  url: string;
  description: string;
  location: "Prague" | "Zlin";
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
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

export function VideoCard({ slug, title, speaker, date, thumbnail, location }: VideoCardProps) {
  const t = useTranslations("recordings");
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href={`/recordings/${location.toLowerCase()}/${slug}`} className="glass-card group block">
      <div className="video-overlay relative aspect-video overflow-hidden rounded-t-3xl">
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover transition-all duration-700 ease-out group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        <div className="play-button">
          <PlayIcon className="h-7 w-7 text-brand-600" />
        </div>

        <div className="absolute bottom-4 left-4 z-10">
          <span
            className={`location-badge ${location.toLowerCase()}`}
            aria-label={t("locationLabel", { location })}
          >
            <MapPinIcon className="h-3.5 w-3.5" />
            {location}
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="p-6">
        <h3 className="mb-3 line-clamp-2 text-base font-semibold leading-snug text-neutral-900 transition-colors duration-300 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
          {title}
        </h3>

        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-neutral-700 dark:text-neutral-300">{speaker}</span>
          <span className="text-neutral-400 dark:text-neutral-500">{formattedDate}</span>
        </div>
      </div>
    </Link>
  );
}
