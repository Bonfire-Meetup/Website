"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { type CSSProperties, useEffect, useState } from "react";

import { ArrowRightIcon, BoltIcon, FireIcon, PlayIcon } from "@/components/shared/Icons";
import { WEBSITE_URLS, type LocationValue } from "@/lib/config/constants";
import { ENGAGEMENT_BRANDING } from "@/lib/config/engagement-branding";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { prefersReducedMotion } from "@/lib/utils/prefers-reduced-motion";

import { CARD_TILT_CLASS, CARD_TILT_STYLE, createCardTiltHandlers } from "../recordings/card-tilt";
import { RecordingImage } from "../recordings/RecordingImage";
import { ShareMenu } from "../recordings/ShareMenu";
import { WatchLaterButton } from "../recordings/WatchLaterButton";
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

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white/70 px-3 py-2.5 text-left backdrop-blur-sm transition-colors hover:border-black/18 dark:border-white/10 dark:bg-black/28 dark:hover:border-white/16">
      <span className="block text-[11px] font-semibold tracking-[0.08em] text-neutral-500 uppercase dark:text-white/54">
        {label}
      </span>
      <span className="mt-1 block text-xl leading-none font-black tracking-tight text-neutral-900 dark:text-white">
        {value}
      </span>
      <div className="pointer-events-none absolute -right-4 -bottom-5 h-12 w-12 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-orange-500/20 blur-lg transition-opacity group-hover:opacity-100 dark:opacity-70" />
    </div>
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
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold text-white shadow-lg ${ENGAGEMENT_BRANDING.boost.classes.activeGradient}`}
        >
          <BoltIcon className="h-3.5 w-3.5" />
          {recording.boostCount}
        </span>
      )}
      {hasLike && (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold text-white shadow-lg ${ENGAGEMENT_BRANDING.like.classes.activeGradient}`}
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
  const watchPath = PAGE_ROUTES.WATCH(recording.slug, recording.shortId);
  const primarySpeaker = recording.speaker[0] ?? "";
  const actionIconButtonClass =
    "h-8 w-8 justify-center rounded-full border border-white/14 bg-black/40 p-0 text-white hover:bg-black/55 dark:border-white/16 dark:bg-white/20 dark:hover:bg-white/30";

  return (
    <div
      className={`group relative block w-full overflow-hidden rounded-[24px] border border-black/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0.54)_100%)] shadow-[0_28px_52px_-30px_rgba(17,24,39,0.6)] transition-[border-color,box-shadow,transform] duration-500 hover:border-black/22 hover:shadow-[0_38px_64px_-30px_rgba(17,24,39,0.72)] dark:border-white/12 dark:bg-[linear-gradient(180deg,rgba(18,18,20,0.9)_0%,rgba(10,10,11,0.9)_100%)] dark:shadow-[0_30px_56px_-24px_rgba(0,0,0,0.96)] dark:hover:border-white/18 ${CARD_TILT_CLASS}`}
      style={CARD_TILT_STYLE}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={watchPath} prefetch={false} className="group block">
        <div className="video-overlay relative overflow-hidden">
          <RecordingImage
            src={recording.thumbnail}
            alt={recording.title}
            className="aspect-[16/9]"
            imgClassName="object-[80%_30%] [transform:translate3d(var(--card-media-x,0px),var(--card-media-y,0px),0)_scale(1.02)] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:[transform:translate3d(var(--card-media-x,0px),var(--card-media-y,0px),0)_scale(1.06)]"
            sizes="(max-width: 768px) 96vw, (max-width: 1280px) 56vw, 760px"
            loading="eager"
            fetchPriority="high"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/72 via-black/26 to-transparent transition-opacity duration-300 group-hover:from-black/60 dark:from-black/80" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_16%,rgba(244,114,182,0.34),transparent_36%)] opacity-90 transition-opacity duration-500 group-hover:opacity-100 dark:opacity-80" />

          <div className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/24 bg-black/35 px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-white uppercase backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fuchsia-400 to-orange-400" />
            {text.badge}
          </div>

          <div className="absolute top-3 right-3 z-20">
            <EngagementChips recording={recording} />
          </div>

          <div className="absolute right-0 bottom-0 left-0 z-20 p-3 sm:p-4">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-white/25 bg-black/36 px-2 py-1 text-[9px] font-semibold tracking-[0.1em] text-white/92 uppercase backdrop-blur-sm">
                {recording.location}
              </span>
            </div>
            <p className="mb-1 truncate text-[10px] font-medium tracking-[0.16em] text-white/72 uppercase">
              {primarySpeaker}
            </p>
            <h3 className="line-clamp-2 min-h-[2.15rem] text-sm leading-snug font-semibold text-white sm:text-base">
              {recording.title}
            </h3>
          </div>
        </div>
      </Link>
      <div className="flex items-center justify-between gap-2 border-t border-black/10 bg-white/66 px-3 py-2.5 sm:px-4 dark:border-white/10 dark:bg-black/28">
        <Link
          href={watchPath}
          prefetch={false}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/35 bg-gradient-to-r from-fuchsia-500/95 to-orange-500/95 px-3 text-[10px] font-semibold tracking-[0.12em] text-white uppercase shadow-[0_10px_24px_-14px_rgba(244,63,94,0.9)] transition-transform duration-300 hover:translate-x-0.5"
        >
          <PlayIcon className="h-3.5 w-3.5" />
          {text.watchNow}
        </Link>
        <div className="flex items-center gap-1">
          <WatchLaterButton
            shortId={recording.shortId}
            variant="icon"
            showLabel={false}
            size="sm"
            iconButtonClassName={actionIconButtonClass}
          />
          <ShareMenu
            shareUrl={`${WEBSITE_URLS.BASE}${watchPath}`}
            shareText={primarySpeaker ? `${recording.title} - ${primarySpeaker}` : recording.title}
            showLabel={false}
            buttonClassName={actionIconButtonClass}
            iconClassName="h-3.5 w-3.5"
          />
        </div>
      </div>
    </div>
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
      className={`group flex min-w-[13.5rem] basis-[13.5rem] items-center gap-2 overflow-hidden rounded-xl border p-2 text-left transition-[border-color,box-shadow,transform,background-color] duration-300 sm:min-w-[14.5rem] sm:basis-[14.5rem] lg:min-w-0 lg:flex-1 lg:basis-0 ${
        isActive
          ? "border-fuchsia-400/60 bg-white/88 shadow-[0_12px_26px_-18px_rgba(217,70,239,0.65)] dark:border-fuchsia-300/60 dark:bg-black/44 dark:shadow-[0_16px_26px_-18px_rgba(217,70,239,0.58)]"
          : "border-black/10 bg-white/60 hover:border-black/20 hover:bg-white/80 dark:border-white/10 dark:bg-black/24 dark:hover:border-white/18 dark:hover:bg-black/34"
      }`}
    >
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-black/8 dark:border-white/10">
        <RecordingImage
          src={recording.thumbnail}
          alt={recording.title}
          className="h-full w-full"
          imgClassName="h-full w-full scale-105 object-cover object-[78%_30%] transition-transform duration-500 group-hover:scale-110"
          sizes="160px"
          loading="eager"
          fetchPriority="high"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/46 via-black/12 to-transparent dark:from-black/62" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="mb-0.5 truncate text-[9px] font-semibold tracking-[0.12em] text-neutral-500 uppercase dark:text-white/50">
          {String(rank).padStart(2, "0")} · {recording.speaker[0]}
        </p>
        <h3 className="line-clamp-2 text-[11px] leading-[1.25] font-semibold text-neutral-900 dark:text-white/90">
          {recording.title}
        </h3>
      </div>
    </button>
  );
}

function TrendingDock({
  cardsVisible,
  trendingCards,
  text,
}: {
  cardsVisible: boolean;
  trendingCards: HeroRecording[];
  text: TrendingText;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);

  useEffect(() => {
    setActiveIndex((prev) => Math.min(prev, Math.max(trendingCards.length - 1, 0)));
  }, [trendingCards.length]);

  useEffect(() => {
    if (trendingCards.length <= 1 || isAutoPlayPaused || prefersReducedMotion()) {
      return;
    }

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % trendingCards.length);
    }, 5200);

    return () => clearInterval(timer);
  }, [isAutoPlayPaused, trendingCards.length]);

  const activeRecording = trendingCards[activeIndex] ?? trendingCards[0];

  return (
    <div
      className={`relative mx-auto w-full min-w-0 transition-all duration-700 ease-[cubic-bezier(0.2,0.85,0.2,1)] ${
        cardsVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
      onMouseEnter={() => setIsAutoPlayPaused(true)}
      onMouseLeave={() => setIsAutoPlayPaused(false)}
    >
      <div className="relative min-w-0 overflow-hidden rounded-[30px] border border-black/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.66)_0%,rgba(255,255,255,0.36)_100%)] p-3 shadow-[0_24px_60px_-34px_rgba(17,24,39,0.55)] backdrop-blur-xl sm:p-4 dark:border-white/10 dark:bg-[linear-gradient(160deg,rgba(20,20,22,0.82)_0%,rgba(10,10,11,0.62)_100%)] dark:shadow-[0_28px_56px_-26px_rgba(0,0,0,0.95)]">
        <div className="pointer-events-none absolute -top-16 right-0 h-36 w-36 rounded-full bg-fuchsia-500/26 blur-3xl dark:bg-fuchsia-500/18" />
        <div className="pointer-events-none absolute -bottom-14 left-2 h-36 w-40 rounded-full bg-orange-500/24 blur-3xl dark:bg-orange-500/16" />

        <div className="relative space-y-3">
          {activeRecording && <ActiveVideoCard recording={activeRecording} text={text} />}

          <div className="rounded-2xl border border-black/10 bg-white/56 p-2.5 backdrop-blur-sm dark:border-white/10 dark:bg-black/28">
            <p className="text-center text-[9px] font-semibold tracking-[0.14em] text-neutral-500 uppercase dark:text-white/54">
              {text.queue}
            </p>
            <p className="mt-1 text-center text-[9px] font-medium tracking-[0.12em] text-neutral-500/90 uppercase sm:hidden dark:text-white/36">
              {text.tapHint}
            </p>

            <div className="no-scrollbar mt-2 flex w-full min-w-0 gap-2 overflow-x-auto pb-1 lg:overflow-visible">
              {trendingCards.map((recording, index) => (
                <QueueVideoCard
                  key={recording.shortId}
                  recording={recording}
                  isActive={index === activeIndex}
                  rank={index + 1}
                  onActivate={() => setActiveIndex(index)}
                />
              ))}
            </div>
          </div>

          <div className="text-center">
            <Link
              href="#recordings"
              className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.1em] text-neutral-600 uppercase underline decoration-[1.5px] underline-offset-4 transition-colors hover:text-neutral-900 dark:text-white/62 dark:hover:text-white/86"
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
  const tHeader = useTranslations("header");

  const heroImages = images.slice(0, 3);
  const [embers, setEmbers] = useState<CSSProperties[]>([]);
  const [embersVisible, setEmbersVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);

  const trendingCards = trendingRecordings.slice(0, 3);
  const hasTrending = trendingCards.length > 0;
  const trendingText: TrendingText = {
    badge: t("trending.badge"),
    queue: t("trending.queue"),
    seeAll: t("trending.seeAll"),
    tapHint: t("trending.tapHint"),
    watchNow: t("trending.watchNow"),
  };

  const heroStats = [
    { label: t("stats.locations"), value: t("stats.locationsValue") },
    { label: t("stats.talks"), value: t("stats.talksValue") },
    { label: t("stats.attendees"), value: t("stats.attendeesValue") },
  ];

  useEffect(() => {
    setEmbers(generateEmbers());
    const embersTimer = setTimeout(() => setEmbersVisible(true), 40);
    const cardsTimer = setTimeout(() => setCardsVisible(true), 280);

    return () => {
      clearTimeout(embersTimer);
      clearTimeout(cardsTimer);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-neutral-50 px-4 pt-[4.9rem] pb-[4.8rem] transition-colors duration-500 sm:px-6 sm:pt-[11rem] sm:pb-[5.4rem] lg:px-8 lg:pt-[11.8rem] lg:pb-[6.1rem] dark:bg-neutral-950">
      <HeroBackground images={heroImages} />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_55%_35%,var(--color-fire-start-glow),transparent_58%)] dark:bg-[radial-gradient(circle_at_55%_35%,var(--color-fire-start-glow-dark),transparent_58%)]" />
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 h-32 bg-gradient-to-t from-neutral-50 to-transparent dark:from-neutral-950" />

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {embers.map((style, index) => (
          <Ember
            key={`ember-${String(style.left)}-${String(style.animationDelay)}-${String(style.animationDuration)}`}
            style={style}
            className={index >= 2 ? "hidden md:block" : ""}
            visible={embersVisible}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute top-[37%] left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 select-none">
        <span className="text-outline block text-[24vw] leading-none font-black opacity-[0.045] sm:text-[20vw] dark:opacity-[0.03]">
          BONFIRE
        </span>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div
          className={`grid items-center gap-[2.9rem] lg:gap-[3.4rem] ${hasTrending ? "lg:grid-cols-[0.95fr_1.05fr]" : ""}`}
        >
          <div
            className={`relative min-w-0 transition-all duration-700 ${
              cardsVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            <div className="mx-auto w-full max-w-2xl min-w-0 lg:mx-0">
              <p className="mb-5 text-center text-[11px] font-semibold tracking-[0.26em] text-neutral-500 uppercase lg:text-left dark:text-neutral-400">
                {t("eyebrow")}
              </p>

              <h1 className="mb-7 flex flex-col items-center text-center leading-[0.91] lg:items-start lg:text-left">
                <span className="text-outline-bold neon-active text-[clamp(2.8rem,13vw,6.5rem)] font-black tracking-tighter uppercase">
                  {t("title.part1")}
                </span>
                <span className="text-gradient mt-0 max-w-full text-[clamp(2.7rem,12vw,6.4rem)] font-black tracking-tighter uppercase sm:-mt-1 sm:whitespace-nowrap">
                  {t("title.highlight")}
                </span>
                <NeonText className="text-outline-bold mt-0 text-[clamp(2.8rem,13vw,6.5rem)] font-black tracking-tighter uppercase sm:-mt-1">
                  {t("title.part2")}
                </NeonText>
              </h1>

              <p className="mb-8 max-w-xl text-center text-sm leading-relaxed text-neutral-600 sm:text-base md:text-lg lg:text-left dark:text-neutral-400">
                {t("subtitle", { prague: tCommon("prague"), zlin: tCommon("zlin") })}
              </p>

              <div className="mb-8 grid grid-cols-3 gap-2.5 sm:gap-3.5">
                {heroStats.map((item) => (
                  <HeroStat key={item.label} label={item.label} value={item.value} />
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <Button
                  href="#events"
                  variant="glass"
                  external
                  className="group relative rounded-2xl border border-fuchsia-300/45 bg-gradient-to-r from-fuchsia-600 via-rose-500 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-[0_16px_34px_-16px_rgba(236,72,153,0.75)] transition-[transform,box-shadow,filter] duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_42px_-16px_rgba(236,72,153,0.88)] hover:brightness-105 sm:px-8 sm:py-3.5 sm:text-base dark:border-fuchsia-300/35"
                >
                  <span className="relative z-10">{t("cta.events")}</span>
                  <div className="pointer-events-none absolute -inset-3 -z-10 rounded-[1.35rem] bg-gradient-to-r from-fuchsia-500/35 to-orange-500/35 opacity-85 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                </Button>

                <Link
                  href={PAGE_ROUTES.LIBRARY}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-black/12 bg-white/72 px-5 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:border-black/22 hover:text-neutral-950 sm:px-6 sm:text-base dark:border-white/12 dark:bg-black/30 dark:text-white/78 dark:hover:border-white/22 dark:hover:text-white"
                >
                  {tHeader("library")}
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {hasTrending && (
            <div className="min-w-0">
              <TrendingDock
                cardsVisible={cardsVisible}
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
