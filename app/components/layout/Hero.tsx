"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { type CSSProperties, useEffect, useState } from "react";

import { ArrowRightIcon, BoltIcon, FireIcon, PlayIcon } from "@/components/shared/Icons";
import { type LocationValue } from "@/lib/config/constants";
import { ENGAGEMENT_BRANDING } from "@/lib/config/engagement-branding";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { prefersReducedMotion } from "@/lib/utils/prefers-reduced-motion";

import { CARD_TILT_CLASS, CARD_TILT_STYLE, createCardTiltHandlers } from "../recordings/card-tilt";
import { RecordingImage } from "../recordings/RecordingImage";
import { NeonText } from "../theme/NeonText";
import { Button } from "../ui/Button";

import { HeroBackground } from "./HeroBackground";

function Ember({
  style,
  className = "",
  visible,
}: {
  style: CSSProperties;
  className?: string;
  visible: boolean;
}) {
  return (
    <div
      className={`animate-rise absolute rounded-full bg-gradient-to-t from-fuchsia-700 via-orange-500 to-red-600 blur-sm transition-opacity duration-1000 md:blur-md ${className} ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ ...style, opacity: visible ? (style.opacity as number) : 0 }}
    />
  );
}

export interface HeroRecording {
  shortId: string;
  slug: string;
  title: string;
  speaker: string[];
  thumbnail: string;
  location: LocationValue;
  likeCount?: number;
  boostCount?: number;
}

interface TrendingText {
  badge: string;
  queue: string;
  seeAll: string;
  tapHint: string;
  watchNow: string;
}

function EngagementChips({ recording }: { recording: HeroRecording }) {
  const hasBoost = typeof recording.boostCount === "number" && recording.boostCount > 0;
  const hasLike = typeof recording.likeCount === "number" && recording.likeCount > 0;

  if (!hasBoost && !hasLike) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5">
      {hasBoost && (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-lg ${ENGAGEMENT_BRANDING.boost.classes.activeGradient}`}
        >
          <BoltIcon className="h-3.5 w-3.5" />
          {recording.boostCount}
        </span>
      )}
      {hasLike && (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-lg ${ENGAGEMENT_BRANDING.like.classes.activeGradient}`}
        >
          <FireIcon className="h-3.5 w-3.5" />
          {recording.likeCount}
        </span>
      )}
    </div>
  );
}

function ActiveVideoCard({ recording, text }: { recording: HeroRecording; text: TrendingText }) {
  const tiltHandlers = createCardTiltHandlers();
  const handleMouseEnter = tiltHandlers.onMouseEnter;
  const handleMouseMove = tiltHandlers.onMouseMove;
  const handleMouseLeave = tiltHandlers.onMouseLeave;

  return (
    <Link
      href={PAGE_ROUTES.WATCH(recording.slug, recording.shortId)}
      prefetch={false}
      className={`group relative block w-full min-w-0 overflow-hidden rounded-[20px] border border-black/10 bg-[linear-gradient(180deg,rgba(249,250,251,0.95)_0%,rgba(229,231,235,0.9)_100%)] shadow-[0_20px_42px_-24px_rgba(17,24,39,0.45)] transition-[border-color,box-shadow,transform] duration-500 hover:border-black/22 hover:shadow-[0_28px_56px_-26px_rgba(17,24,39,0.58)] dark:border-white/12 dark:bg-[linear-gradient(180deg,rgba(20,20,22,0.98)_0%,rgba(12,12,13,1)_100%)] dark:shadow-[0_22px_44px_-18px_rgba(0,0,0,0.92)] dark:hover:border-white/20 dark:hover:shadow-[0_30px_56px_-18px_rgba(0,0,0,0.96)] ${CARD_TILT_CLASS}`}
      style={CARD_TILT_STYLE}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="video-overlay relative overflow-hidden">
        <RecordingImage
          src={recording.thumbnail}
          alt={recording.title}
          className="aspect-[16/9]"
          imgClassName="object-[80%_30%] [transform:translate3d(var(--card-media-x,0px),var(--card-media-y,0px),0)_scale(1.03)] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:[transform:translate3d(var(--card-media-x,0px),var(--card-media-y,0px),0)_scale(1.08)]"
          sizes="(max-width: 768px) 94vw, (max-width: 1280px) 58vw, 760px"
          loading="eager"
          fetchPriority="high"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/62 via-black/24 to-transparent transition-opacity duration-300 group-hover:from-black/48 dark:from-black/68 dark:via-black/28 dark:group-hover:from-black/54" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_14%,rgba(244,114,182,0.34),transparent_36%)] opacity-85 transition-opacity duration-500 group-hover:opacity-100 dark:opacity-75" />
        <div className="absolute top-2 left-2 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/14 bg-black/24 px-2 py-1 text-[10px] leading-none font-semibold tracking-[0.13em] text-white/82 uppercase backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[linear-gradient(135deg,var(--color-brand-500),var(--color-fire-start))]" />
          {text.badge}
        </div>
        <div className="absolute top-2 right-2 z-20 hidden sm:block">
          <EngagementChips recording={recording} />
        </div>
        <div className="absolute right-0 bottom-0 left-0 z-20 bg-gradient-to-t from-black/86 via-black/52 to-transparent p-3 sm:p-4 dark:from-black/96 dark:via-black/68">
          <p className="mb-1 truncate text-[10px] leading-none font-medium tracking-[0.16em] text-white/70 uppercase">
            {recording.speaker[0]}
          </p>
          <h3 className="mb-2 line-clamp-2 min-h-[2.15rem] text-sm leading-snug font-semibold text-white sm:text-base">
            {recording.title}
          </h3>
          <span className="from-brand-500/95 inline-flex h-7 items-center gap-1.5 rounded-full border border-white/35 bg-gradient-to-r via-fuchsia-500/90 to-orange-500/90 px-2.5 text-[10px] font-semibold tracking-[0.12em] text-white uppercase shadow-[0_8px_20px_-12px_rgba(244,63,94,0.8)] transition-[transform,box-shadow,filter] duration-300 group-hover:scale-[1.02] group-hover:shadow-[0_10px_24px_-10px_rgba(244,63,94,0.9)]">
            <PlayIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            {text.watchNow}
          </span>
        </div>
      </div>
    </Link>
  );
}

function QueueVideoCard({
  recording,
  isActive,
  rank,
  onActivate,
}: {
  recording: HeroRecording;
  isActive: boolean;
  rank: number;
  onActivate: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={onActivate}
      className={`group relative min-w-[9.75rem] basis-[9.75rem] overflow-hidden rounded-[14px] border bg-white/56 p-1 text-left transition-[border-color,background-color,box-shadow,transform,opacity] duration-400 sm:min-w-[10.5rem] sm:basis-[10.5rem] dark:bg-black/18 ${
        isActive
          ? "border-brand-500/55 dark:border-brand-400/60 opacity-100 shadow-[0_0_0_1px_rgba(217,70,239,0.48),0_10px_20px_-14px_rgba(17,24,39,0.38)] dark:shadow-[0_0_0_1px_rgba(232,121,249,0.52),0_14px_24px_-16px_rgba(0,0,0,0.72)]"
          : "border-black/8 opacity-76 shadow-[0_8px_16px_-14px_rgba(17,24,39,0.25)] hover:-translate-y-0.5 hover:border-black/16 hover:opacity-92 dark:border-white/10 dark:shadow-[0_10px_18px_-14px_rgba(0,0,0,0.64)] dark:hover:border-white/16"
      }`}
    >
      <div className="relative overflow-hidden rounded-lg">
        <RecordingImage
          src={recording.thumbnail}
          alt={recording.title}
          className="aspect-[16/9]"
          imgClassName="scale-[1.04] object-[80%_30%] group-hover:scale-[1.08]"
          sizes="(max-width: 768px) 38vw, (max-width: 1024px) 24vw, 180px"
          loading="eager"
          fetchPriority="high"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/46 via-black/16 to-transparent transition-opacity duration-300 group-hover:from-black/34 dark:from-black/56 dark:via-black/20 dark:group-hover:from-black/42" />
        <span
          className={`absolute top-1.5 left-1.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[10px] leading-none font-bold tracking-[0.08em] ${
            isActive
              ? "bg-gradient-to-r from-fuchsia-500/95 to-orange-500/95 text-white shadow-[0_6px_16px_-10px_rgba(244,63,94,0.9)]"
              : "bg-black/52 text-white/92 backdrop-blur-sm dark:bg-black/62"
          }`}
        >
          {String(rank).padStart(2, "0")}
        </span>
      </div>
      <div className="px-0.5 pt-2 pb-1">
        <p className="mb-1 truncate text-[8px] leading-none font-medium tracking-[0.12em] text-neutral-500 uppercase dark:text-white/56">
          {recording.speaker[0]}
        </p>
        <h3 className="line-clamp-2 min-h-[1.75rem] text-[10px] leading-[1.2] font-semibold text-neutral-800 sm:text-[11px] dark:text-white/90">
          {recording.title}
        </h3>
      </div>
    </button>
  );
}

function TrendingDock({
  cardsVisible,
  isScrolled,
  trendingCards,
  text,
}: {
  cardsVisible: boolean;
  isScrolled: boolean;
  trendingCards: HeroRecording[];
  text: TrendingText;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);

  useEffect(() => {
    setActiveIndex((prev) => Math.min(prev, Math.max(trendingCards.length - 1, 0)));
  }, [trendingCards.length]);

  useEffect(() => {
    if (trendingCards.length <= 1 || isAutoPlayPaused) {
      return;
    }

    if (prefersReducedMotion()) {
      return;
    }

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % trendingCards.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [isAutoPlayPaused, trendingCards.length]);

  const activeRecording = trendingCards[activeIndex] ?? trendingCards[0];

  return (
    <div
      className={`relative mx-auto w-full max-w-[60rem] transition-all duration-700 ease-[cubic-bezier(0.2,0.85,0.2,1)] ${
        cardsVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
      onMouseEnter={() => setIsAutoPlayPaused(true)}
      onMouseLeave={() => setIsAutoPlayPaused(false)}
    >
      <div
        className={`relative overflow-hidden rounded-[28px] p-2 transition-[opacity,filter,box-shadow] duration-500 sm:p-3 ${
          isScrolled
            ? "md:blur-0 md:opacity-100"
            : "md:focus-within:blur-0 md:hover:blur-0 md:opacity-78 md:blur-[0.3px] md:focus-within:opacity-100 md:hover:opacity-100"
        }`}
      >
        <div className="pointer-events-none absolute -top-10 right-6 h-28 w-28 rounded-full bg-fuchsia-500/30 blur-3xl dark:bg-fuchsia-500/24" />
        <div className="pointer-events-none absolute -bottom-6 left-6 h-24 w-36 rounded-full bg-orange-500/24 blur-3xl dark:bg-orange-500/16" />
        <div className="pointer-events-none absolute inset-0 rounded-[28px] border border-white/42 dark:border-white/10" />

        <div className="relative min-w-0 space-y-3">
          <div className="min-w-0 space-y-2.5">
            {activeRecording && (
              <div className="mx-auto w-full max-w-[52rem]">
                <ActiveVideoCard recording={activeRecording} text={text} />
              </div>
            )}

            <div className="mx-auto w-full max-w-[38rem] rounded-xl border border-black/8 bg-white/38 px-2.5 py-2 shadow-[0_10px_24px_-20px_rgba(17,24,39,0.4)] backdrop-blur-sm dark:border-white/8 dark:bg-black/16 dark:shadow-[0_14px_24px_-20px_rgba(0,0,0,0.72)]">
              <p className="px-0.5 text-center text-[9px] font-semibold tracking-[0.14em] text-neutral-500 uppercase dark:text-white/50">
                {text.queue}
              </p>
              <p className="mt-1 px-0.5 text-center text-[9px] font-medium tracking-[0.12em] text-neutral-500/85 uppercase sm:hidden dark:text-white/36">
                {text.tapHint}
              </p>

              <div className="no-scrollbar mt-2 flex w-full max-w-full min-w-0 justify-center gap-2 overflow-x-auto pb-0.5">
                {trendingCards.map((recording, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <QueueVideoCard
                      key={recording.shortId}
                      recording={recording}
                      isActive={isActive}
                      rank={index + 1}
                      onActivate={() => setActiveIndex(index)}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="#recordings"
              className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.1em] text-neutral-600 uppercase underline decoration-[1.5px] underline-offset-4 transition-colors hover:text-neutral-800 dark:text-white/62 dark:hover:text-white/82"
            >
              {text.seeAll}
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface HeroImage {
  src: string;
  alt: string;
  fallbackSrc?: string;
  fallbackType?: "image/jpeg" | "image/png";
}

interface HeroProps {
  images: HeroImage[];
  trendingRecordings?: HeroRecording[];
}

function generateEmbers() {
  return Array.from({ length: 6 }).map(() => ({
    animationDelay: `${Math.random() * -20}s`,
    animationDuration: `${Math.random() * 10 + 10}s`,
    height: `${Math.random() * 6 + 2}px`,
    left: `${Math.random() * 100}%`,
    opacity: Math.random() * 0.25 + 0.15,
    width: `${Math.random() * 6 + 2}px`,
  }));
}

export function Hero({ images, trendingRecordings = [] }: HeroProps) {
  const t = useTranslations("hero");
  const tCommon = useTranslations("common");

  const heroImages = images.slice(0, 3);
  const [embers, setEmbers] = useState<CSSProperties[]>([]);
  const [embersVisible, setEmbersVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [isTrendingRevealed, setIsTrendingRevealed] = useState(false);

  const trendingCards = trendingRecordings.slice(0, 3);
  const hasTrending = trendingCards.length > 0;
  const trendingText: TrendingText = {
    badge: t("trending.badge"),
    queue: t("trending.queue"),
    seeAll: t("trending.seeAll"),
    tapHint: t("trending.tapHint"),
    watchNow: t("trending.watchNow"),
  };

  useEffect(() => {
    setEmbers(generateEmbers());
    const t1 = setTimeout(() => setEmbersVisible(true), 50);
    const t2 = setTimeout(() => setCardsVisible(true), 380);

    const onScroll = () => {
      setIsTrendingRevealed(window.scrollY > 36);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-neutral-50 px-4 pt-28 pb-12 transition-colors duration-500 sm:min-h-svh sm:pt-32 sm:pb-14 dark:bg-neutral-950">
      <HeroBackground images={heroImages} />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,var(--color-fire-start-glow),transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_40%,var(--color-fire-start-glow-dark),transparent_60%)]" />
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 h-32 bg-gradient-to-t from-neutral-50 to-transparent dark:from-neutral-950" />

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {embers.map((style, i) => (
          <Ember
            key={`ember-${String(style.left)}-${String(style.animationDelay)}-${String(style.animationDuration)}`}
            style={style}
            className={i >= 2 ? "hidden md:block" : ""}
            visible={embersVisible}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 select-none">
        <span className="text-outline block text-[18vw] leading-none font-black opacity-[0.04] sm:text-[22vw] dark:opacity-[0.03]">
          BONFIRE
        </span>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl min-w-0">
        <div className="grid grid-cols-1">
          <div className="relative z-10 flex flex-col items-center pt-4 text-center sm:pt-8">
            <p className="mb-4 text-[11px] font-semibold tracking-[0.26em] text-neutral-500 uppercase dark:text-neutral-400">
              {t("eyebrow")}
            </p>

            <h1 className="mb-8 flex flex-col items-center sm:mb-12">
              <span className="text-outline mx-auto text-5xl font-black tracking-tighter uppercase opacity-65 sm:text-8xl md:text-9xl">
                {t("title.part1")}
              </span>
              <span className="text-gradient -mt-2 text-6xl font-black tracking-tighter uppercase sm:-mt-6 sm:text-9xl md:text-[10rem]">
                {t("title.highlight")}
              </span>
              <NeonText className="text-outline-bold -mt-1 text-5xl font-black tracking-tighter uppercase sm:-mt-5 sm:text-8xl md:text-9xl">
                {t("title.part2")}
              </NeonText>
            </h1>

            <p className="mb-9 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:mb-11 sm:text-lg md:text-xl dark:text-neutral-400">
              {t("subtitle", { prague: tCommon("prague"), zlin: tCommon("zlin") })}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                href="#events"
                variant="glass"
                external
                className="group relative rounded-2xl border border-fuchsia-300/45 bg-gradient-to-r from-fuchsia-600 via-rose-500 to-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_16px_34px_-16px_rgba(236,72,153,0.75)] transition-[transform,box-shadow,filter] duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_42px_-16px_rgba(236,72,153,0.88)] hover:brightness-105 sm:px-9 sm:py-4.5 sm:text-base dark:border-fuchsia-300/35"
              >
                <span className="relative z-10">{t("cta.events")}</span>
                <div className="pointer-events-none absolute -inset-3 -z-10 rounded-[1.35rem] bg-gradient-to-r from-fuchsia-500/35 to-orange-500/35 opacity-85 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
              </Button>
            </div>
          </div>

          {hasTrending && (
            <div className="relative mt-10 w-full md:mt-14">
              <TrendingDock
                cardsVisible={cardsVisible}
                isScrolled={isTrendingRevealed}
                trendingCards={trendingCards}
                text={trendingText}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
