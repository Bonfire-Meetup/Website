"use client";

import { useEffect, useRef } from "react";
import type { Recording } from "../../lib/recordings/recordings";
import { Button } from "../ui/Button";
import { useGlobalPlayer } from "../shared/GlobalPlayerProvider";
import { ArrowLeftIcon, CinemaIcon } from "../shared/icons";
import { LikeBoostButtons } from "./LikeBoostButtons";
import { ShareMenu } from "./ShareMenu";
import { VideoMetadata } from "./VideoMetadata";
import { RelatedVideosSection } from "./RelatedVideosSection";
import { formatDate } from "../../lib/utils/locale";

type RecordingPlayerLabels = {
  backToLibrary: string;
  exitCinema: string;
  cinema: string;
  spark: string;
  sparks: string;
  lightItUp: string;
  boost: string;
  boosts: string;
  boostItUp: string;
  nextUp: string;
  speaker: string;
  date: string;
  about: string;
  relatedTitle: string;
  back: string;
  epShort: string;
  special: string;
  share: string;
  copyLink: string;
  copied: string;
};

export type RelatedRecording = Pick<
  Recording,
  "shortId" | "slug" | "title" | "thumbnail" | "speaker" | "episode" | "episodeNumber" | "location"
>;

export function RecordingPlayer({
  recording,
  relatedRecordings,
  labels,
  locale,
}: {
  recording: Recording;
  relatedRecordings: RelatedRecording[];
  labels: RecordingPlayerLabels;
  locale: string;
}) {
  const inlinePlayerRef = useRef<HTMLDivElement | null>(null);
  const { setVideo, setInlineContainer, cinemaMode, setCinemaMode } = useGlobalPlayer();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [recording.youtubeId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && cinemaMode) {
        setCinemaMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cinemaMode, setCinemaMode]);

  const formattedDate = formatDate(recording.date, locale);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${recording.title} - ${recording.speaker.join(", ")}`;

  useEffect(() => {
    setVideo({
      youtubeId: recording.youtubeId,
      title: recording.title,
      watchUrl: `/watch/${recording.slug}-${recording.shortId}`,
    });
  }, [recording.youtubeId, recording.title, recording.slug, recording.shortId, setVideo]);

  useEffect(() => {
    setInlineContainer(inlinePlayerRef.current);
    return () => setInlineContainer(null);
  }, [setInlineContainer, recording.youtubeId]);

  return (
    <div className="gradient-bg min-h-screen">
      <div className="relative mx-auto px-4 py-6 sm:px-6 lg:px-8" style={{ maxWidth: "85rem" }}>
        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
          <div className="min-w-0 space-y-8">
            <div className="glass-card no-hover-pop overflow-hidden">
              <div className="hidden items-center justify-between border-b border-neutral-200/30 px-4 py-3 dark:border-neutral-700/30 lg:flex">
                <div className="hidden lg:block">
                  <Button
                    href="/library"
                    variant="ghost"
                    size="sm"
                    className="group items-center gap-2"
                  >
                    <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    <span>{labels.backToLibrary}</span>
                  </Button>
                </div>
              </div>

              <div ref={inlinePlayerRef} className="relative w-full aspect-video bg-black" />

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200/40 px-5 py-4 dark:border-neutral-700/40 sm:px-6">
                <LikeBoostButtons
                  shortId={recording.shortId}
                  labels={{
                    lightItUp: labels.lightItUp,
                    boostItUp: labels.boostItUp,
                  }}
                />

                <div className="flex items-center gap-3">
                  <ShareMenu
                    shareUrl={shareUrl}
                    shareText={shareText}
                    labels={{
                      share: labels.share,
                      copyLink: labels.copyLink,
                      copied: labels.copied,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setCinemaMode(!cinemaMode)}
                    className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-500 transition-all cursor-pointer hover:bg-neutral-100 hover:text-neutral-900 sm:inline-flex dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
                  >
                    <CinemaIcon className="h-3.5 w-3.5" />
                    {cinemaMode ? labels.exitCinema : labels.cinema}
                  </button>
                </div>
              </div>

              <VideoMetadata
                recording={recording}
                formattedDate={formattedDate}
                locale={locale}
                labels={{
                  epShort: labels.epShort,
                  special: labels.special,
                }}
              />
            </div>
          </div>

          <RelatedVideosSection
            relatedRecordings={relatedRecordings}
            labels={{
              relatedTitle: labels.relatedTitle,
              nextUp: labels.nextUp,
              epShort: labels.epShort,
              special: labels.special,
            }}
          />
        </div>
      </div>
    </div>
  );
}
