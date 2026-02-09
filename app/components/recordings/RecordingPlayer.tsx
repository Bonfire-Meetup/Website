"use client";

import type { Recording } from "@/lib/recordings/recordings";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useGlobalPlayer } from "@/components/shared/GlobalPlayerProvider";
import { ArrowLeftIcon, CinemaIcon } from "@/components/shared/Icons";
import { type BoostedByData } from "@/lib/api/video-engagement";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { formatDate } from "@/lib/utils/locale";

import { BoostedBy } from "./BoostedBy";
import { LikeBoostButtons } from "./LikeBoostButtons";
import { RelatedVideosSection } from "./RelatedVideosSection";
import { ShareMenu } from "./ShareMenu";
import { VideoMetadata } from "./VideoMetadata";
import { WatchLaterButton } from "./WatchLaterButton";

export type RelatedRecording = Pick<
  Recording,
  "shortId" | "slug" | "title" | "thumbnail" | "speaker" | "episode" | "episodeNumber" | "location"
>;

export function RecordingPlayer({
  recording,
  relatedRecordings,
}: {
  recording: Recording;
  relatedRecordings: RelatedRecording[];
}) {
  const t = useTranslations("recordings");
  const locale = useLocale();

  const inlinePlayerRef = useRef<HTMLDivElement | null>(null);
  const { setVideo, setInlineContainer, cinemaMode, setCinemaMode } = useGlobalPlayer();

  const formattedDate = formatDate(recording.date, locale);
  const [boostedBy, setBoostedBy] = useState<BoostedByData | null | undefined>(undefined);

  const [shareUrl, setShareUrl] = useState("");
  const shareText = `${recording.title} - ${recording.speaker.join(", ")}`;

  useEffect(() => {
    window.scrollTo({ behavior: "auto", left: 0, top: 0 });
  }, [recording.youtubeId]);

  useEffect(() => {
    setShareUrl(window.location.href);
  }, [recording.slug, recording.shortId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCinemaMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setCinemaMode]);

  useEffect(() => {
    setVideo({
      title: recording.title,
      watchUrl: PAGE_ROUTES.WATCH(recording.slug, recording.shortId),
      youtubeId: recording.youtubeId,
    });
  }, [recording.title, recording.slug, recording.shortId, recording.youtubeId, setVideo]);

  useEffect(() => {
    const el = inlinePlayerRef.current;
    setInlineContainer(el);

    return () => setInlineContainer(null);
  }, [setInlineContainer]);

  return (
    <div className="gradient-bg min-h-screen">
      <div className="relative mx-auto px-4 py-6 sm:px-6 lg:px-8" style={{ maxWidth: "85rem" }}>
        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
          <div className="min-w-0 space-y-8">
            <div className="glass-card no-hover-pop overflow-hidden">
              <div className="hidden items-center justify-between border-b border-neutral-200/30 px-4 py-3 lg:flex dark:border-neutral-700/30">
                <div className="hidden lg:block">
                  <Link
                    href={PAGE_ROUTES.LIBRARY}
                    className="group hover:bg-brand-100/60 hover:text-brand-700 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-neutral-600 transition dark:text-neutral-400"
                    prefetch={false}
                  >
                    <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    <span>{t("backToLibrary")}</span>
                  </Link>
                </div>
              </div>

              <div ref={inlinePlayerRef} className="relative aspect-video w-full bg-black" />

              <div className="border-b border-neutral-200/40 dark:border-neutral-700/40">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-4 sm:gap-3 sm:px-6">
                  <LikeBoostButtons onBoostedByLoad={setBoostedBy} shortId={recording.shortId} />

                  <div className="flex items-center gap-2 sm:gap-3">
                    <WatchLaterButton shortId={recording.shortId} variant="icon" size="sm" />
                    <ShareMenu shareUrl={shareUrl} shareText={shareText} />
                    <button
                      type="button"
                      onClick={() => setCinemaMode(!cinemaMode)}
                      className="hidden cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs leading-none font-medium text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-900 sm:inline-flex sm:leading-tight dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <CinemaIcon className="h-3.5 w-3.5" />
                      <span className="sm:translate-y-[1px]">
                        {cinemaMode ? t("exitCinema") : t("cinema")}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="px-5 pb-4 sm:px-6">
                  <BoostedBy boostedBy={boostedBy} shortId={recording.shortId} />
                  <p className="mt-3 text-[10px] leading-tight text-neutral-500/90 dark:text-neutral-500">
                    {t("youtubeNotice")}
                  </p>
                </div>
              </div>

              <VideoMetadata recording={recording} formattedDate={formattedDate} />
            </div>
          </div>

          <RelatedVideosSection relatedRecordings={relatedRecordings} />
        </div>
      </div>
    </div>
  );
}
