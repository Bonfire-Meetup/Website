"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { type CSSProperties, useEffect, useState } from "react";

import { BoltIcon, FireIcon } from "@/components/shared/Icons";
import { type LocationValue } from "@/lib/config/constants";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { RecordingImage } from "../recordings/RecordingImage";
import { NeonText } from "../theme/NeonText";
import { Button } from "../ui/Button";
import { ScrollChevron } from "../ui/ScrollChevron";

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

function HeroMiniCard({
  recording,
  featured = false,
}: {
  recording: HeroRecording;
  featured?: boolean;
}) {
  return (
    <Link
      href={PAGE_ROUTES.WATCH(recording.slug, recording.shortId)}
      prefetch={false}
      className="group relative block h-full overflow-hidden rounded-xl opacity-95 saturate-100 transition-[transform,opacity,filter] duration-500 sm:opacity-80 sm:saturate-[0.8] sm:hover:-translate-y-0.5 sm:hover:opacity-100 sm:hover:saturate-100"
    >
      <div className="video-overlay relative h-full overflow-hidden">
        <RecordingImage
          src={recording.thumbnail}
          alt={recording.title}
          className="aspect-auto h-full"
          imgClassName={
            featured
              ? "scale-[1.06] object-[100%_center] group-hover:scale-[1.12]"
              : "scale-[1.12] object-[100%_center] group-hover:scale-[1.18]"
          }
          sizes={
            featured
              ? "(max-width: 640px) 70vw, (max-width: 1024px) 320px, 500px"
              : "(max-width: 640px) 46vw, (max-width: 1024px) 180px, 220px"
          }
          loading="eager"
          fetchPriority="high"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/8 to-transparent" />
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5">
          {typeof recording.boostCount === "number" && recording.boostCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md border border-white/8 bg-black/16 px-1.5 py-1 text-[10px] leading-none font-semibold text-emerald-300 backdrop-blur-sm transition-colors group-hover:border-white/14 group-hover:bg-black/24">
              <BoltIcon className="h-2.5 w-2.5" />
              {recording.boostCount}
            </span>
          )}
          {typeof recording.likeCount === "number" && recording.likeCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md border border-white/8 bg-black/16 px-1.5 py-1 text-[10px] leading-none font-semibold text-rose-200 backdrop-blur-sm transition-colors group-hover:border-white/14 group-hover:bg-black/24">
              <FireIcon className="h-2.5 w-2.5" />
              {recording.likeCount}
            </span>
          )}
        </div>
        <div className="absolute right-0 bottom-0 left-0 z-10 p-3 sm:p-3.5">
          <p className="mb-1 h-[0.7rem] truncate text-[10px] leading-none font-medium tracking-[0.16em] text-white/62 uppercase">
            {recording.speaker[0]}
          </p>
          <h3 className="line-clamp-2 min-h-[2.1rem] text-xs leading-snug font-semibold text-white transition-colors group-hover:text-orange-200 sm:min-h-[2.6rem] sm:text-sm">
            {recording.title}
          </h3>
        </div>
      </div>
      <div className="group-hover:border-brand-500/70 group-hover:ring-brand-500/65 dark:group-hover:border-brand-400/80 dark:group-hover:ring-brand-400/75 pointer-events-none absolute inset-0 rounded-xl border border-transparent shadow-none ring-0 ring-transparent transition-[border-color,box-shadow,opacity] duration-500 ring-inset group-hover:shadow-[0_0_0_1px_rgba(217,70,239,0.9),0_0_28px_rgba(217,70,239,0.42)] group-hover:ring-2 dark:group-hover:shadow-[0_0_0_1px_rgba(232,121,249,0.9),0_0_34px_rgba(232,121,249,0.45)]" />
    </Link>
  );
}

function TrendingDock({
  cardsVisible,
  trendingCards,
}: {
  cardsVisible: boolean;
  trendingCards: HeroRecording[];
}) {
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  const activeLandscapeIndex = hoveredCardIndex ?? 0;

  return (
    <div className="relative mx-auto mt-14 mb-8 w-full max-w-[52rem] sm:mt-16 sm:mb-14">
      <div className="relative overflow-hidden rounded-2xl border border-white/0 bg-transparent p-2.5 sm:p-3">
        <div className="pointer-events-none absolute inset-2 rounded-[1.1rem] bg-gradient-to-b from-white/10 via-white/4 to-transparent dark:from-white/6 dark:via-white/[0.02]" />
        <div className="no-scrollbar relative -mx-3 overflow-x-auto [mask-image:linear-gradient(to_right,transparent_0%,black_6%,black_94%,transparent_100%)] px-3 [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_6%,black_94%,transparent_100%)] sm:mx-0 sm:px-0">
          <div
            className="flex min-w-max items-start gap-2.5 py-0.5 sm:w-full sm:min-w-0 sm:gap-2.5"
            onMouseLeave={() => setHoveredCardIndex(null)}
          >
            {trendingCards.map((rec, index) =>
              (() => {
                const isLandscape = index === activeLandscapeIndex;

                return (
                  <div
                    key={rec.shortId}
                    className={`h-[248px] shrink-0 transition-[width,transform,opacity] duration-700 ease-[cubic-bezier(0.2,0.85,0.2,1)] will-change-[width,transform,opacity] sm:h-[300px] ${
                      index === 0 ? "w-[66vw]" : "w-[44vw]"
                    } sm:basis-auto ${
                      isLandscape
                        ? "sm:w-[calc((100%_-_1.25rem)*0.46)]"
                        : "sm:w-[calc((100%_-_1.25rem)*0.27)]"
                    } ${
                      isLandscape ? "sm:z-20" : "sm:z-10"
                    } ${cardsVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
                    style={{ transitionDelay: cardsVisible ? "0ms" : `${250 + index * 140}ms` }}
                    onMouseEnter={() => setHoveredCardIndex(index)}
                    onFocus={() => setHoveredCardIndex(index)}
                  >
                    <HeroMiniCard recording={rec} featured={isLandscape} />
                  </div>
                );
              })(),
            )}
          </div>
        </div>
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-12 bg-gradient-to-t from-neutral-50/10 via-neutral-50/0 to-transparent dark:from-neutral-950/10 dark:via-neutral-950/0" />
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
  return Array.from({ length: 8 }).map(() => ({
    animationDelay: `${Math.random() * -20}s`,
    animationDuration: `${Math.random() * 10 + 10}s`,
    height: `${Math.random() * 6 + 2}px`,
    left: `${Math.random() * 100}%`,
    opacity: Math.random() * 0.5 + 0.2,
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

  const trendingCards = trendingRecordings.slice(0, 3);
  const hasTrending = trendingCards.length > 0;

  useEffect(() => {
    setEmbers(generateEmbers());
    const t1 = setTimeout(() => setEmbersVisible(true), 50);
    const t2 = setTimeout(() => setCardsVisible(true), 200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-neutral-50 px-4 pt-20 pb-20 transition-colors duration-500 sm:min-h-svh sm:pt-20 sm:pb-0 dark:bg-neutral-950">
      <HeroBackground images={heroImages} />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,var(--color-fire-start-glow),transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_40%,var(--color-fire-start-glow-dark),transparent_60%)]" />
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 h-32 bg-gradient-to-t from-neutral-50 to-transparent dark:from-neutral-950" />

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {embers.map((style, i) => (
          <Ember
            key={`ember-${i}`}
            style={style}
            className={i >= 4 ? "hidden md:block" : ""}
            visible={embersVisible}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 select-none">
        <span className="text-outline block text-[18vw] leading-none font-black opacity-[0.04] sm:text-[22vw] dark:opacity-[0.03]">
          BONFIRE
        </span>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1">
          <div className="relative z-10 flex flex-col items-center text-center">
            <h1 className="mb-6 flex flex-col items-center sm:mb-10">
              <span className="text-outline mx-auto text-5xl font-black tracking-tighter uppercase opacity-70 sm:text-8xl md:text-9xl">
                {t("title.part1")}
              </span>
              <span className="text-gradient -mt-2 text-6xl font-black tracking-tighter uppercase sm:-mt-8 sm:text-9xl md:text-[10rem]">
                {t("title.highlight")}
              </span>
              <NeonText className="text-outline-bold -mt-1 text-5xl font-black tracking-tighter uppercase sm:-mt-6 sm:text-8xl md:text-9xl">
                {t("title.part2")}
              </NeonText>
            </h1>

            <p className="mb-10 max-w-2xl text-base leading-relaxed text-neutral-600 sm:mb-14 sm:text-xl md:text-2xl dark:text-neutral-400">
              {t("subtitle", { prague: tCommon("prague"), zlin: tCommon("zlin") })}
            </p>

            <div>
              <Button
                href="#events"
                variant="glass"
                external
                className="group relative px-5 py-3 text-sm sm:px-10 sm:py-5 sm:text-lg"
              >
                <span className="relative z-10">{t("cta.events")}</span>
                <div className="absolute inset-0 -z-10 bg-fuchsia-700 opacity-40 blur-xl transition-opacity group-hover:opacity-60" />
              </Button>
            </div>
          </div>

          {hasTrending && (
            <TrendingDock cardsVisible={cardsVisible} trendingCards={trendingCards} />
          )}
        </div>
      </div>

      <ScrollChevron label={t("scroll")} scrollLabel={t("scrollLabel")} />
    </section>
  );
}
