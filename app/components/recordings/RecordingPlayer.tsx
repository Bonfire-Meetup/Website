"use client";

import type { Recording } from "@/lib/recordings/recordings";
import { useLocale, useTranslations } from "next-intl";
import { Suspense, useEffect, useRef } from "react";

import { useGlobalPlayer } from "@/components/shared/GlobalPlayerProvider";
import { ArrowLeftIcon, CinemaIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/Button";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { formatDate } from "@/lib/utils/locale";

import { BoostedBy } from "./BoostedBy";
import { LikeBoostButtons } from "./LikeBoostButtons";
import { RelatedVideosSection } from "./RelatedVideosSection";
import { ShareMenu } from "./ShareMenu";
import { VideoMetadata } from "./VideoMetadata";

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

  useEffect(() => {
    window.scrollTo({ behavior: "instant" as ScrollBehavior, left: 0, top: 0 });
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
      title: recording.title,
      watchUrl: PAGE_ROUTES.WATCH(recording.slug, recording.shortId),
      youtubeId: recording.youtubeId,
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
              <div className="hidden items-center justify-between border-b border-neutral-200/30 px-4 py-3 lg:flex dark:border-neutral-700/30">
                <div className="hidden lg:block">
                  <Button
                    href={PAGE_ROUTES.LIBRARY}
                    variant="ghost"
                    size="sm"
                    className="group items-center gap-2"
                  >
                    <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    <span>{t("backToLibrary")}</span>
                  </Button>
                </div>
              </div>

              <div ref={inlinePlayerRef} className="relative aspect-video w-full bg-black" />

              <div className="border-b border-neutral-200/40 dark:border-neutral-700/40">
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
                  <LikeBoostButtons shortId={recording.shortId} />

                  <div className="flex items-center gap-3">
                    <ShareMenu shareUrl={shareUrl} shareText={shareText} />
                    <button
                      type="button"
                      onClick={() => setCinemaMode(!cinemaMode)}
                      className="hidden cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-900 sm:inline-flex dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <CinemaIcon className="h-3.5 w-3.5" />
                      {cinemaMode ? t("exitCinema") : t("cinema")}
                    </button>
                  </div>
                </div>
                <div className="px-5 pb-4 sm:px-6">
                  <BoostedBy shortId={recording.shortId} />
                </div>
              </div>

              <VideoMetadata recording={recording} formattedDate={formattedDate} />
            </div>
          </div>

          <Suspense
            fallback={
              <section className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                <div className="flex items-center gap-4 lg:gap-3">
                  <div className="h-px flex-1 bg-neutral-200/50 lg:hidden dark:bg-white/10" />
                  <div className="h-6 w-32 animate-pulse rounded bg-neutral-200/70 dark:bg-white/10" />
                  <div className="h-px flex-1 bg-neutral-200/50 lg:hidden dark:bg-white/10" />
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={`related-video-skeleton-${i}`}
                      className="relative flex animate-pulse flex-col overflow-hidden rounded-[24px] bg-white/90 dark:bg-neutral-950"
                    >
                      <div className="relative aspect-video w-full bg-neutral-900" />
                      <div className="flex flex-1 flex-col p-4">
                        <div className="h-4 w-full rounded bg-neutral-200/80 dark:bg-white/15" />
                        <div className="mt-2 h-4 w-3/4 rounded bg-neutral-200/70 dark:bg-white/10" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            }
          >
            <RelatedVideosSection relatedRecordings={relatedRecordings} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
