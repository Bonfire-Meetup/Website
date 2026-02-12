"use client";

import type { CatalogRecording } from "./RecordingsCatalogTypes";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PAGE_ROUTES } from "@/lib/routes/pages";

import { Pill } from "../ui/Pill";
import { SpeakerList } from "../ui/SpeakerList";

import { RecordingImage } from "./RecordingImage";
import { RecordingMeta } from "./RecordingMeta";
import { WatchLaterButton } from "./WatchLaterButton";

export function GridView({
  recordings,
  locale,
  filterKey,
}: {
  recordings: CatalogRecording[];
  locale: string;
  filterKey: string;
}) {
  const router = useRouter();

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {recordings.map((recording, index) => (
        <div
          key={`${recording.shortId}-${filterKey}`}
          className="group relative flex cursor-pointer flex-col overflow-hidden rounded-[28px] bg-white/90 text-neutral-900 shadow-lg ring-1 shadow-black/5 ring-black/5 transition-all hover:shadow-xl dark:bg-neutral-950 dark:text-white dark:shadow-black/10 dark:ring-white/10"
        >
          <Link
            href={PAGE_ROUTES.WATCH(recording.slug, recording.shortId)}
            prefetch={false}
            className="absolute inset-0 z-0"
            aria-label={recording.title}
          >
            <span className="sr-only">{recording.title}</span>
          </Link>

          <div className="relative shrink-0">
            <RecordingImage
              src={recording.thumbnail}
              alt={recording.title}
              imgClassName="group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading={index < 8 ? "eager" : "lazy"}
              fetchPriority={index < 8 ? "high" : "low"}
            />
            <div className="pointer-events-auto absolute top-2 left-2 z-5">
              <WatchLaterButton
                shortId={recording.shortId}
                variant="icon"
                size="sm"
                showLabel={false}
              />
            </div>
          </div>
          <div className="pointer-events-none relative z-10 flex flex-1 flex-col space-y-3 bg-white/85 px-5 pt-5 pb-6 text-neutral-900 dark:bg-black/75 dark:text-white">
            <RecordingMeta
              location={recording.location}
              date={recording.date}
              locale={locale}
              trackingClass="tracking-[0.25em]"
            />
            <h3 className="line-clamp-2 text-base leading-snug font-semibold text-neutral-900 dark:text-white">
              {recording.title}
            </h3>
            <SpeakerList speakers={recording.speaker} />
            <div className="pointer-events-auto flex flex-wrap gap-2">
              {recording.tags.map((tag: string) => (
                <Pill
                  key={tag}
                  onClick={() => {
                    router.push(`${PAGE_ROUTES.LIBRARY_BROWSE}?tag=${encodeURIComponent(tag)}`);
                  }}
                  size="xxs"
                  className="cursor-pointer bg-black/5 font-semibold tracking-[0.2em] text-neutral-600 uppercase transition hover:text-neutral-900 dark:bg-white/10 dark:text-white/70 dark:hover:text-white"
                  aria-label={`Filter by ${tag}`}
                >
                  {tag}
                </Pill>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
