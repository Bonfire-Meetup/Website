"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import type { Recording } from "../lib/recordings";
import { getProxiedThumbnailUrl } from "../lib/thumbnail";
import { AccentBar } from "./AccentBar";
import { Pill } from "./Pill";
import { Button } from "./Button";
import { useGlobalPlayer } from "./GlobalPlayerProvider";
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
  CinemaIcon,
  FacebookIcon,
  FireIcon,
  LinkIcon,
  LinkedInIcon,
  MapPinIcon,
  PlayIcon,
  ShareIcon,
  UserIcon,
  XIcon,
} from "./icons";
import { LocationPill } from "./LocationPill";

interface RecordingPlayerLabels {
  backToLibrary: string;
  exitCinema: string;
  cinema: string;
  spark: string;
  sparks: string;
  lightItUp: string;
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
}

type RelatedRecording = Pick<
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
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [likeCount, setLikeCount] = useState<number | null>(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [likePulse, setLikePulse] = useState(false);
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

  const formattedDate = new Date(recording.date).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${recording.title} - ${recording.speaker.join(", ")}`;
  const nextUp = relatedRecordings[0];
  const remainingRelated = relatedRecordings.slice(1);

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

  useEffect(() => {
    let isActive = true;
    const loadLikes = async () => {
      try {
        const response = await fetch(`/api/video/${recording.shortId}/likes`);
        if (!response.ok) return;
        const data = (await response.json()) as { count: number; hasLiked: boolean };
        if (isActive) {
          setLikeCount(data.count ?? 0);
          setHasLiked(Boolean(data.hasLiked));
        }
      } catch {}
    };
    loadLikes();
    return () => {
      isActive = false;
    };
  }, [recording.shortId]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recording.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setShowShareMenu(true);
        }
      }
    } else {
      setShowShareMenu(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setShowCopyToast(true);
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 1500);
      setTimeout(() => setShowCopyToast(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setShowCopyToast(true);
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 1500);
      setTimeout(() => setShowCopyToast(false), 2000);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    setLikePulse(true);
    setTimeout(() => setLikePulse(false), 550);

    const prevLiked = hasLiked;
    const prevCount = likeCount;
    const adding = !hasLiked;

    setHasLiked(adding);
    setLikeCount((c) => (c ?? 0) + (adding ? 1 : -1));

    try {
      const res = await fetch(`/api/video/${recording.shortId}/likes`, {
        method: adding ? "POST" : "DELETE",
      });
      if (!res.ok) {
        setHasLiked(prevLiked);
        setLikeCount(prevCount);
        return;
      }
      const { count } = (await res.json()) as { count: number };
      setLikeCount(count);
    } catch {
      setHasLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setIsLiking(false);
    }
  };

  const shareLinks = {
    x: `https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  };

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
                <button
                  type="button"
                  onClick={handleLike}
                  aria-pressed={hasLiked}
                  disabled={isLiking}
                  className={`inline-flex items-center justify-center gap-3 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg transition-all cursor-pointer min-w-[8.5rem] ${
                    hasLiked
                      ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-orange-500/30"
                      : "bg-white text-rose-400 ring-1 ring-rose-200/70 hover:-translate-y-0.5 hover:shadow-rose-500/20 dark:bg-white/5 dark:text-rose-300 dark:ring-white/10"
                  } ${likePulse ? "like-pop" : ""} ${isLiking ? "opacity-80" : ""}`}
                >
                  <FireIcon
                    className={`h-5 w-5 shrink-0 ${hasLiked ? "fill-white stroke-white" : ""}`}
                  />
                  {likeCount ? (
                    <span className="tabular-nums text-base">{likeCount}</span>
                  ) : (
                    <span className="text-[11px]">{labels.lightItUp}</span>
                  )}
                </button>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={handleShare}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-500 transition-all cursor-pointer hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <ShareIcon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{labels.share}</span>
                    </button>
                    {showShareMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowShareMenu(false)}
                        />
                        <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
                          <button
                            type="button"
                            onClick={handleCopyLink}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-white/5"
                          >
                            {copied ? (
                              <CheckIcon className="h-4 w-4 text-green-500" />
                            ) : (
                              <LinkIcon className="h-4 w-4" />
                            )}
                            {copied ? labels.copied : labels.copyLink}
                          </button>
                          <div className="my-1 h-px bg-neutral-200 dark:bg-white/10" />
                          <a
                            href={shareLinks.x}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setShowShareMenu(false)}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-white/5"
                          >
                            <XIcon className="h-4 w-4" />X
                          </a>
                          <a
                            href={shareLinks.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setShowShareMenu(false)}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-white/5"
                          >
                            <FacebookIcon className="h-4 w-4" />
                            Facebook
                          </a>
                          <a
                            href={shareLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setShowShareMenu(false)}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-white/5"
                          >
                            <LinkedInIcon className="h-4 w-4" />
                            LinkedIn
                          </a>
                        </div>
                      </>
                    )}
                  </div>
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

              <div>
                <div className="px-5 py-5 sm:px-6 sm:py-6">
                  <div className="mb-4 flex gap-3">
                    <div className="flex h-7 items-center sm:h-8 lg:h-9">
                      <AccentBar />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl lg:text-[1.75rem] dark:text-white">
                      {recording.title}
                    </h1>
                  </div>

                  <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                    <div className="flex flex-wrap items-center gap-2">
                      {recording.speaker.map((name) => (
                        <Pill
                          key={name}
                          size="sm"
                          className="gap-2 bg-white font-semibold text-neutral-700 shadow-sm ring-1 ring-black/5 dark:bg-white/10 dark:text-neutral-200 dark:ring-white/10"
                        >
                          <UserIcon className="h-3.5 w-3.5 text-brand-500 dark:text-brand-400" />
                          {name}
                        </Pill>
                      ))}
                      <Pill
                        size="sm"
                        className="gap-2 bg-white font-semibold text-neutral-600 shadow-sm ring-1 ring-black/5 dark:bg-white/10 dark:text-neutral-300 dark:ring-white/10"
                      >
                        <CalendarIcon className="h-3.5 w-3.5 text-brand-500 dark:text-brand-400" />
                        {formattedDate}
                      </Pill>
                      <Pill
                        href={`/library?location=${recording.location}`}
                        size="sm"
                        className="gap-2 bg-white font-semibold text-neutral-700 shadow-sm ring-1 ring-black/5 transition hover:bg-white/80 dark:bg-white/10 dark:text-neutral-200 dark:ring-white/10 dark:hover:bg-white/20"
                      >
                        <MapPinIcon className="h-3.5 w-3.5 text-brand-500 dark:text-brand-400" />
                        {recording.location}
                      </Pill>
                    </div>
                    {recording.episodeId && (
                      <Pill
                        href={`/library?episode=${encodeURIComponent(recording.episodeId)}`}
                        size="sm"
                        className="bg-neutral-900/5 font-semibold uppercase tracking-[0.15em] text-neutral-600 transition hover:bg-neutral-900/10 hover:text-neutral-800 dark:bg-white/10 dark:text-neutral-200 dark:hover:bg-white/20 dark:hover:text-white"
                      >
                        {recording.episodeNumber
                          ? `${labels.epShort} ${recording.episodeNumber} · ${recording.episode ?? recording.episodeId}`
                          : (recording.episode ?? recording.episodeId)}
                      </Pill>
                    )}
                  </div>

                  <div className="border-t border-neutral-200/40 pt-5 dark:border-neutral-700/40">
                    <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                      {recording.description}
                    </p>

                    {recording.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {recording.tags.map((tag) => (
                          <Pill
                            key={tag}
                            href={`/library?tag=${encodeURIComponent(tag)}`}
                            size="xs"
                            className="bg-brand-50 font-semibold uppercase tracking-[0.18em] text-brand-700 transition-colors hover:bg-brand-100 hover:text-brand-800 dark:bg-brand-500/10 dark:text-brand-200 dark:hover:bg-brand-500/20 dark:hover:text-brand-100"
                          >
                            #{tag}
                          </Pill>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-center gap-4 lg:gap-3">
              <div className="h-px flex-1 bg-neutral-200/50 dark:bg-white/10 lg:hidden" />
              <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white lg:text-left">
                {labels.relatedTitle}
              </h2>
              <div className="h-px flex-1 bg-neutral-200/50 dark:bg-white/10 lg:hidden" />
            </div>

            {nextUp ? (
              <Link
                href={`/watch/${nextUp.slug}-${nextUp.shortId}`}
                className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/80 p-3 shadow-lg shadow-black/5 transition hover:-translate-y-0.5 hover:border-neutral-200 hover:shadow-xl dark:border-white/10 dark:bg-neutral-950 dark:shadow-black/20 dark:hover:border-white/20"
              >
                <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-900">
                  <img
                    src={getProxiedThumbnailUrl(nextUp.thumbnail)}
                    alt={nextUp.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-700 shadow-sm">
                    <PlayIcon className="h-3 w-3" />
                    {labels.nextUp}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                    {labels.nextUp}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm font-semibold text-neutral-900 group-hover:text-brand-500 dark:text-white dark:group-hover:text-brand-400">
                    {nextUp.title}
                  </p>
                </div>
              </Link>
            ) : null}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              {remainingRelated.map((related, index) => (
                <Link
                  key={related.shortId}
                  href={`/watch/${related.slug}-${related.shortId}`}
                  className={`group recording-card-enter opacity-0 stagger-${
                    (index % 8) + 1
                  } relative flex flex-col overflow-hidden rounded-[24px] bg-white/90 text-neutral-900 shadow-xl shadow-black/5 ring-1 ring-black/5 transition-all hover:-translate-y-1 dark:bg-neutral-950 dark:text-white dark:shadow-black/10 dark:ring-white/10`}
                >
                  <div className="relative aspect-video w-full overflow-hidden">
                    <img
                      src={getProxiedThumbnailUrl(related.thumbnail)}
                      alt={related.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex flex-1 flex-col justify-start">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 group-hover:text-brand-500 transition-colors dark:text-white dark:group-hover:text-brand-400">
                        {related.title}
                      </h3>
                      <div className="mt-2 flex flex-col gap-1">
                        {related.speaker.map((name) => (
                          <div key={name} className="flex items-center gap-2">
                            <span className="h-1 w-1 shrink-0 rounded-full bg-brand-500 shadow-[0_0_4px_rgba(59,130,246,0.3)] dark:bg-brand-400" />
                            <span className="truncate text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                              {name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-white/5">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                        {related.episode
                          ? related.episodeNumber
                            ? `${labels.epShort} ${related.episodeNumber}`
                            : related.episode
                          : labels.special}
                      </span>
                      <LocationPill
                        location={related.location}
                        size="xxs"
                        className="!text-[9px]"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
      {showCopyToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-neutral-900/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-black/30 backdrop-blur"
        >
          {labels.copied}
        </div>
      )}
    </div>
  );
}
