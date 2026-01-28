"use client";

import { useTranslations } from "next-intl";
import { type CSSProperties, useEffect, useState } from "react";

import { PAGE_ROUTES } from "@/lib/routes/pages";

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

interface HeroImage {
  src: string;
  alt: string;
  fallbackSrc?: string;
  fallbackType?: "image/jpeg" | "image/png";
}

interface HeroProps {
  images: HeroImage[];
}

function generateEmbers() {
  return Array.from({ length: 15 }).map(() => ({
    animationDelay: `${Math.random() * -20}s`,
    animationDuration: `${Math.random() * 10 + 10}s`,
    height: `${Math.random() * 6 + 2}px`,
    left: `${Math.random() * 100}%`,
    opacity: Math.random() * 0.5 + 0.2,
    width: `${Math.random() * 6 + 2}px`,
  }));
}

export function Hero({ images }: HeroProps) {
  const t = useTranslations("hero");
  const tCommon = useTranslations("common");

  const heroImages = images.slice(0, 3);
  const [embers, setEmbers] = useState<CSSProperties[]>([]);
  const [embersVisible, setEmbersVisible] = useState(false);

  useEffect(() => {
    setEmbers(generateEmbers());
    const timer = setTimeout(() => setEmbersVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-neutral-50 px-4 pt-20 pb-20 transition-colors duration-500 sm:min-h-[110vh] sm:pt-20 sm:pb-0 dark:bg-neutral-950">
      <HeroBackground images={heroImages} />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,var(--color-fire-start-glow),transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_40%,var(--color-fire-start-glow-dark),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,var(--color-fire-mid-glow),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,var(--color-fire-mid-glow-dark),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,var(--color-fire-end-glow),transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_80%,var(--color-fire-end-glow-dark),transparent_50%)]" />
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 h-32 bg-gradient-to-t from-neutral-50 to-transparent dark:from-neutral-950" />

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {embers.map((style, i) => (
          <Ember
            key={`ember-${i}`}
            style={style}
            className={i >= 6 ? "hidden md:block" : ""}
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
        <div className="relative z-10 flex flex-col items-center text-center">
          <p className="mb-4 hidden items-center gap-2 text-xs font-bold tracking-[0.4em] text-orange-600 uppercase sm:mb-8 sm:flex sm:gap-3 sm:text-sm sm:tracking-[0.5em] dark:text-orange-400">
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-orange-400 sm:w-8" />
            {t("eyebrow")}
            <span className="h-px w-6 bg-gradient-to-l from-transparent to-orange-400 sm:w-8" />
          </p>
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

          <p className="mb-8 max-w-2xl text-base leading-relaxed text-neutral-600 sm:mb-12 sm:text-xl md:text-2xl dark:text-neutral-400">
            {t("subtitle", { prague: tCommon("prague"), zlin: tCommon("zlin") })}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
            <Button
              href="#events"
              variant="glass"
              external
              className="group relative px-5 py-3 text-sm sm:px-10 sm:py-5 sm:text-lg"
            >
              <span className="relative z-10">{t("cta.events")}</span>
              <div className="absolute inset-0 -z-10 bg-fuchsia-700 opacity-40 blur-xl transition-opacity group-hover:opacity-60" />
            </Button>
            <Button
              href={PAGE_ROUTES.LIBRARY}
              variant="glass-secondary"
              className="px-5 py-3 text-sm sm:px-10 sm:py-5 sm:text-lg"
            >
              {t("cta.recordings")}
            </Button>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-neutral-200 pt-8 sm:mt-20 sm:gap-20 sm:pt-12 dark:border-white/5">
            <div className="text-center">
              <p className="text-gradient block text-3xl font-black sm:text-5xl">
                {t("stats.locationsValue")}
              </p>
              <p className="text-[10px] tracking-widest text-neutral-500 uppercase sm:text-xs">
                {t("stats.locations")}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gradient block text-3xl font-black sm:text-5xl">
                {t("stats.talksValue")}
              </p>
              <p className="text-[10px] tracking-widest text-neutral-500 uppercase sm:text-xs">
                {t("stats.talks")}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gradient block text-3xl font-black sm:text-5xl">
                {t("stats.attendeesValue")}
              </p>
              <p className="text-[10px] tracking-widest text-neutral-500 uppercase sm:text-xs">
                {t("stats.attendees")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ScrollChevron label={t("scroll")} scrollLabel={t("scrollLabel")} />
    </section>
  );
}
