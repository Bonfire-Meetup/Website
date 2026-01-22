import { getTranslations } from "next-intl/server";
import type { CSSProperties } from "react";

import { PAGE_ROUTES } from "@/lib/routes/pages";

import { NeonText } from "../theme/NeonText";
import { Button } from "../ui/Button";
import { ScrollChevron } from "../ui/ScrollChevron";

import { HeroBackground } from "./HeroBackground";

function Ember({ style, className = "" }: { style: CSSProperties; className?: string }) {
  return (
    <div
      className={`animate-rise from-brand-500 absolute rounded-full bg-gradient-to-t to-rose-500 blur-sm md:blur-md ${className}`}
      style={style}
    />
  );
}

function shuffleImages<T>(items: T[]) {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function Hero({
  images,
}: {
  images: {
    src: string;
    alt: string;
    fallbackSrc?: string;
    fallbackType?: "image/jpeg" | "image/png";
  }[];
}) {
  const t = await getTranslations("hero");
  const tCommon = await getTranslations("common");
  const uniqueImages = Array.from(new Map(images.map((image) => [image.src, image])).values());
  const heroImages = shuffleImages(uniqueImages).slice(0, 3);

  const embers = Array.from({ length: 15 }).map(() => ({
    animationDelay: `${Math.random() * -20}s`,
    animationDuration: `${Math.random() * 10 + 10}s`,
    height: `${Math.random() * 6 + 2}px`,
    left: `${Math.random() * 100}%`,
    opacity: Math.random() * 0.5 + 0.2,
    width: `${Math.random() * 6 + 2}px`,
  }));

  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[#fafafa] px-4 pt-20 pb-20 transition-colors duration-500 sm:min-h-[110vh] sm:pt-20 sm:pb-0 dark:bg-[#050505]">
      <HeroBackground images={heroImages} />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(139,92,246,0.1),transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_40%,rgba(139,92,246,0.15),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(244,63,94,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(244,63,94,0.1),transparent_50%)]" />
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 h-32 bg-gradient-to-t from-[#fafafa] to-transparent dark:from-[#050505]" />

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {embers.map((style, i) => (
          <Ember key={`ember-${i}`} style={style} className={i >= 6 ? "hidden md:block" : ""} />
        ))}
      </div>

      <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 select-none">
        <span className="text-outline block text-[18vw] leading-none font-black opacity-[0.04] sm:text-[22vw] dark:opacity-[0.03]">
          BONFIRE
        </span>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="relative z-10 flex flex-col items-center text-center">
          <p className="text-brand-600 dark:text-brand-300 mb-4 hidden items-center gap-2 text-xs font-bold tracking-[0.4em] uppercase sm:mb-8 sm:flex sm:gap-3 sm:text-sm sm:tracking-[0.5em]">
            <span className="to-brand-400 h-px w-6 bg-gradient-to-r from-transparent sm:w-8" />
            {t("eyebrow")}
            <span className="to-brand-400 h-px w-6 bg-gradient-to-l from-transparent sm:w-8" />
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
              <div className="bg-brand-500 absolute inset-0 -z-10 opacity-40 blur-xl transition-opacity group-hover:opacity-60" />
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
