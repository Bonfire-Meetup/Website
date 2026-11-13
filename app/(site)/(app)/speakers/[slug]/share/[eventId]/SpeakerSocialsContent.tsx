"use client";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

import { ArrowLeftIcon, DownloadIcon } from "@/components/shared/Icons";
import { Lightbox } from "@/components/shared/Lightbox";
import { AccentBar } from "@/components/ui/AccentBar";
import { PROFILE_EYEBROW, PROFILE_SURFACE, PROFILE_TONE } from "@/components/ui/surface";
import { Link } from "@/i18n/navigation";
import type { SpeakerTalk } from "@/lib/events/speaker-profiles";
import {
  SOCIAL_FORMATS,
  SOCIAL_PLATFORMS,
  type SocialPlatform,
} from "@/lib/events/speaker-socials";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { formatLongDateUTC } from "@/lib/utils/locale";

interface SpeakerSocialsContentProps {
  speaker: { name: string; slug: string };
  talk: SpeakerTalk;
}

/** No brand logos in the icon set, so each network gets a marker in its own colour. */
const PLATFORM_MARKER: Record<SocialPlatform, string> = {
  facebook: "bg-[#1877f2]",
  instagram: "bg-[linear-gradient(45deg,#f58529,#dd2a7b_55%,#8134af)]",
  linkedin: "bg-[#0a66c2]",
};

export function SpeakerSocialsContent({ speaker, talk }: SpeakerSocialsContentProps) {
  const t = useTranslations("speakerPage");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const images = talk.socials.map((image, index) => {
    const format = SOCIAL_FORMATS[image.format];
    return {
      ...image,
      ...format,
      index,
      isWide: format.width > format.height,
      label: t(`formats.${format.labelKey}`),
    };
  });
  // A network with both a wide and a tall image needs the full row; the others pair up.
  const platforms = SOCIAL_PLATFORMS.map((platform) => {
    const group = images.filter((image) => image.platform === platform);
    return {
      images: group,
      isFullRow: group.some((image) => image.isWide) && group.some((image) => !image.isWide),
      platform,
    };
  }).filter((group) => group.images.length > 0);
  const hasDate = /^\d{4}-\d{2}-\d{2}$/u.test(talk.date);

  return (
    <main className="gradient-bg min-h-screen px-4 pt-28 pb-24 sm:px-6 sm:pt-32 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href={PAGE_ROUTES.SPEAKER(speaker.slug)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {speaker.name}
        </Link>

        <header className="mt-6 max-w-3xl">
          <p className={`${PROFILE_EYEBROW} text-orange-600 dark:text-orange-400`}>
            {t("socials.title")}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-balance text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
            {talk.topic}
          </h1>
          <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">
            <Link href={PAGE_ROUTES.EVENT(talk.eventId)} className="text-link font-semibold">
              {talk.eventTitle}
            </Link>
            {hasDate && <> · {formatLongDateUTC(talk.date, locale)}</>}
          </p>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            {t("socials.intro")}
          </p>
        </header>

        <div className="section-divider my-10" />

        <div className="grid grid-flow-dense gap-8 lg:grid-cols-2">
          {platforms.map((group) => (
            <section
              key={group.platform}
              aria-labelledby={`socials-${group.platform}`}
              className={`${PROFILE_SURFACE} ${PROFILE_TONE.speaker} p-6 sm:p-8 ${group.isFullRow ? "lg:col-span-2" : ""}`}
            >
              <div className="mb-6 flex items-center gap-3">
                <AccentBar />
                <span
                  aria-hidden="true"
                  className={`h-3 w-3 rounded-full ${PLATFORM_MARKER[group.platform]}`}
                />
                <h2
                  id={`socials-${group.platform}`}
                  className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white"
                >
                  {t(`socials.platforms.${group.platform}`)}
                </h2>
                <span className="rounded-full bg-neutral-900/5 px-2.5 py-0.5 text-xs font-medium text-neutral-500 dark:bg-white/10 dark:text-neutral-400">
                  {group.images.length}
                </span>
              </div>

              <ul className="flex flex-col gap-8 sm:flex-row sm:items-end">
                {group.images.map((image) => (
                  <li
                    key={image.format}
                    className={
                      image.isWide ? "w-full min-w-0 sm:flex-1" : "w-full sm:w-auto sm:shrink-0"
                    }
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(image.index)}
                      className="group block w-full cursor-zoom-in"
                      aria-label={t("viewImage", { label: image.label })}
                    >
                      <Image
                        src={image.url}
                        alt={`${image.label}: ${talk.topic}`}
                        width={image.width}
                        height={image.height}
                        sizes={
                          image.isWide
                            ? "(max-width: 640px) 100vw, 800px"
                            : "(max-width: 640px) 100vw, 300px"
                        }
                        className={`h-auto w-full rounded-2xl border border-black/10 shadow-md transition group-hover:shadow-xl dark:border-white/10 ${
                          image.isWide ? "" : "sm:h-[340px] sm:w-auto"
                        }`}
                      />
                    </button>
                    <div
                      className={`mt-3 flex gap-3 ${
                        image.isWide
                          ? "items-center justify-between"
                          : "items-center justify-between sm:flex-col sm:items-start"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                          {image.label}
                        </p>
                        <p className="text-2xs font-mono text-neutral-400 dark:text-neutral-500">
                          {image.width}×{image.height}
                        </p>
                      </div>
                      <a
                        href={image.url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline gap-1.5 rounded-full px-3 py-1.5 text-xs"
                      >
                        <DownloadIcon className="h-3.5 w-3.5" />
                        {t("download")}
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      {openIndex !== null && (
        <Lightbox
          images={images.map((image) => ({ alt: `${image.label}: ${talk.topic}`, src: image.url }))}
          initialIndex={openIndex}
          onClose={() => setOpenIndex(null)}
          onIndexChange={setOpenIndex}
          downloadLabel={t("download")}
          closeLabel={tCommon("close")}
          previousLabel={tCommon("previous")}
          nextLabel={tCommon("next")}
        />
      )}
    </main>
  );
}
