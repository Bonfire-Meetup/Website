import type { CatalogRecording } from "./RecordingsCatalogTypes";
import Image from "next/image";

import { PAGE_ROUTES } from "@/lib/routes/pages";

import { Pill } from "../ui/Pill";
import { TagPill } from "../ui/TagPill";

import { FeaturedCarouselWrapper } from "./FeaturedCarouselWrapper";

interface FeaturedRecordingServerProps {
  candidates: CatalogRecording[];
  locale: string;
  previousLabel: string;
  nextLabel: string;
}

function FeaturedContent({
  recording,
  locale,
  hasFeaturedHero,
}: {
  recording: CatalogRecording;
  locale: string;
  hasFeaturedHero: boolean;
}) {
  return (
    <div
      className={`flex max-w-2xl flex-col gap-2 rounded-3xl px-4 py-4 sm:px-5 sm:py-4 ${
        hasFeaturedHero
          ? "bg-black/60 text-white ring-1 ring-white/10 sm:bg-white/90 sm:text-neutral-900 sm:ring-black/5 dark:sm:bg-black/60 dark:sm:text-white dark:sm:ring-white/10"
          : "bg-white/85 text-neutral-900 ring-1 ring-black/5 dark:bg-black/60 dark:text-white dark:ring-white/10"
      }`}
    >
      <div
        className={`flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.28em] uppercase ${
          hasFeaturedHero
            ? "text-white/80 sm:text-neutral-600 dark:sm:text-white/70"
            : "text-neutral-600 dark:text-white/70"
        }`}
      >
        <Pill
          size="xs"
          className={`${
            hasFeaturedHero
              ? "bg-white/15 text-white/90 sm:bg-black/5 sm:text-neutral-700 dark:sm:bg-white/10 dark:sm:text-white/80"
              : "bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-white/80"
          }`}
        >
          {recording.location}
        </Pill>
        <span>
          {new Date(recording.date).toLocaleDateString(locale, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
      <h2
        className={`line-clamp-2 text-xl leading-tight font-semibold break-words sm:text-3xl lg:text-4xl ${
          hasFeaturedHero
            ? "text-white sm:text-neutral-900 dark:sm:text-white"
            : "text-neutral-900 dark:text-white"
        }`}
      >
        {recording.title}
      </h2>
      <div className="flex flex-col gap-1.5">
        {recording.speaker.map((name: string) => (
          <div key={name} className="flex items-center gap-2">
            <span className="speaker-dot" />
            <span
              className={`text-xs font-medium sm:text-sm ${
                hasFeaturedHero
                  ? "text-white/90 sm:text-neutral-900/80 dark:sm:text-white/80"
                  : "text-neutral-900/80 dark:text-white/80"
              }`}
            >
              {name}
            </span>
          </div>
        ))}
      </div>
      <p
        className={`text-xs sm:text-base ${
          hasFeaturedHero
            ? "text-white/70 sm:text-neutral-600 dark:sm:text-white/70"
            : "text-neutral-600 dark:text-white/70"
        }`}
      >
        {recording.description}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {recording.tags.map((tag: string) => (
          <TagPill
            key={tag}
            href={`${PAGE_ROUTES.LIBRARY_BROWSE}?tag=${encodeURIComponent(tag)}`}
            size="xs"
            className={`font-semibold transition hover:text-neutral-900 dark:hover:text-white ${
              hasFeaturedHero
                ? "bg-white/10 text-white/75 sm:bg-black/5 sm:text-neutral-600 dark:sm:bg-white/10 dark:sm:text-white/70"
                : "bg-black/5 text-neutral-600 dark:bg-white/10 dark:text-white/70"
            }`}
          >
            {tag}
          </TagPill>
        ))}
      </div>
    </div>
  );
}

export function FeaturedRecordingServer({
  candidates,
  locale,
  previousLabel,
  nextLabel,
}: FeaturedRecordingServerProps) {
  if (candidates.length === 0) {
    return null;
  }

  const hasFeaturedHero = Boolean(candidates[0]?.featureHeroThumbnail);

  const imageElements = (
    <>
      {candidates.map((item, index) => {
        const imageSrc = item.featureHeroThumbnail || item.thumbnail;

        return (
          <Image
            key={`featured-image-${item.shortId}`}
            src={imageSrc}
            alt={index === 0 ? item.title : ""}
            aria-hidden={index !== 0}
            fill
            data-index={index}
            className={`featured-carousel-image absolute inset-0 object-cover transition duration-700 group-hover:scale-105 ${
              index === 0 ? "opacity-100" : "opacity-0"
            }`}
            sizes="(max-width: 1024px) 100vw, 70vw"
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
          />
        );
      })}
    </>
  );

  const candidateContents = candidates.map((recording) => (
    <FeaturedContent
      key={recording.shortId}
      recording={recording}
      locale={locale}
      hasFeaturedHero={hasFeaturedHero}
    />
  ));

  return (
    <FeaturedCarouselWrapper
      candidates={candidates}
      candidateContents={candidateContents}
      imageElements={imageElements}
      hasFeaturedHero={hasFeaturedHero}
      previousLabel={previousLabel}
      nextLabel={nextLabel}
    />
  );
}
