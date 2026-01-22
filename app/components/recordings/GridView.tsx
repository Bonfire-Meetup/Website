"use client";

import { useRouter } from "next/navigation";
import { Pill } from "../ui/Pill";
import { RecordingMeta } from "./RecordingMeta";
import { SpeakerList } from "../ui/SpeakerList";
import { RecordingImage } from "./RecordingImage";
import type { CatalogRecording } from "./RecordingsCatalogTypes";
import { PAGE_ROUTES } from "@/lib/routes/pages";

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
        <article
          key={`${recording.shortId}-${filterKey}`}
          role="link"
          tabIndex={0}
          onClick={() => router.push(PAGE_ROUTES.WATCH(recording.slug, recording.shortId))}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              router.push(PAGE_ROUTES.WATCH(recording.slug, recording.shortId));
            }
          }}
          aria-label={recording.title}
          className="group relative flex flex-col cursor-pointer overflow-hidden rounded-[28px] bg-white/90 text-neutral-900 shadow-lg shadow-black/5 ring-1 ring-black/5 dark:bg-neutral-950 dark:text-white dark:shadow-black/10 dark:ring-white/10"
        >
          <div className="relative shrink-0">
            <RecordingImage
              src={recording.thumbnail}
              alt={recording.title}
              imgClassName="group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading={index < 8 ? "eager" : "lazy"}
              fetchPriority={index < 8 ? "high" : "low"}
            />
          </div>
          <div className="flex flex-1 flex-col space-y-3 bg-white/85 px-5 pb-6 pt-5 text-neutral-900 dark:bg-black/75 dark:text-white">
            <RecordingMeta
              location={recording.location}
              date={recording.date}
              locale={locale}
              trackingClass="tracking-[0.25em]"
            />
            <h3 className="line-clamp-2 text-base font-semibold leading-snug text-neutral-900 dark:text-white">
              {recording.title}
            </h3>
            <SpeakerList speakers={recording.speaker} />
            <div className="flex flex-wrap gap-2">
              {recording.tags.map((tag: string) => (
                <Pill
                  key={tag}
                  href={`${PAGE_ROUTES.LIBRARY}?tag=${encodeURIComponent(tag)}`}
                  onClick={(event) => event.stopPropagation()}
                  size="xxs"
                  className="bg-black/5 font-semibold uppercase tracking-[0.2em] text-neutral-600 transition hover:text-neutral-900 dark:bg-white/10 dark:text-white/70 dark:hover:text-white"
                >
                  {tag}
                </Pill>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
