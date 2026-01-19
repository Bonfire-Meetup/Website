import { getTranslations } from "next-intl/server";
import type { CSSProperties } from "react";
import { HeroBackground } from "./HeroBackground";
import { NeonText } from "./NeonText";

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function Ember({ style }: { style: CSSProperties }) {
  return (
    <div
      className="animate-rise absolute rounded-full bg-gradient-to-t from-brand-500 to-rose-500 blur-md"
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

export async function Hero({ images }: { images: Array<{ src: string; alt: string }> }) {
  const t = await getTranslations("hero");
  const uniqueImages = Array.from(new Map(images.map((image) => [image.src, image])).values());
  const heroImages = shuffleImages(uniqueImages).slice(0, 3);

  // Generate deterministic embers
  const embers = Array.from({ length: 15 }).map(() => ({
    width: Math.random() * 6 + 2 + "px",
    height: Math.random() * 6 + 2 + "px",
    left: Math.random() * 100 + "%",
    animationDuration: Math.random() * 10 + 10 + "s",
    animationDelay: Math.random() * -20 + "s",
    opacity: Math.random() * 0.5 + 0.2,
  }));

  return (
    <section className="relative flex min-h-[110vh] flex-col items-center justify-center overflow-hidden bg-[#fafafa] dark:bg-[#050505] px-4 pt-20 transition-colors duration-500">
      {/* Background Image Slider */}
      <HeroBackground images={heroImages} />

      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(139,92,246,0.1),transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_40%,rgba(139,92,246,0.15),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(244,63,94,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(244,63,94,0.1),transparent_50%)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fafafa] to-transparent dark:from-[#050505] z-20" />

      {/* Embers Layer */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {embers.map((style, i) => (
          <Ember key={i} style={style} />
        ))}
      </div>

      {/* Massive Background Typography */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 select-none">
        <span className="text-outline block text-[18vw] font-black leading-none opacity-[0.04] dark:opacity-[0.03] sm:text-[22vw]">
          BONFIRE
        </span>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <p className="mb-8 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.5em] text-brand-600 dark:text-brand-300">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-brand-400" />
            {t("eyebrow")}
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-brand-400" />
          </p>
          <h1 className="mb-10 flex flex-col items-center">
            <span className="text-outline mx-auto text-6xl font-black uppercase tracking-tighter opacity-70 sm:text-8xl md:text-9xl">
              {t("title.part1")}
            </span>
            <span className="text-gradient -mt-4 text-7xl font-black uppercase tracking-tighter sm:-mt-8 sm:text-9xl md:text-[10rem]">
              {t("title.highlight")}
            </span>
            <NeonText className="text-outline-bold -mt-2 text-6xl font-black uppercase tracking-tighter sm:-mt-6 sm:text-8xl md:text-9xl">
              {t("title.part2")}
            </NeonText>
          </h1>

          <p className="mb-12 max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-xl md:text-2xl">
            {t("subtitle")}
          </p>

          <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
            <a href="#events" className="glass-button group relative px-10 py-5 text-lg">
              <span className="relative z-10">{t("cta.events")}</span>
              <div className="absolute inset-0 -z-10 bg-brand-500 blur-xl opacity-40 transition-opacity group-hover:opacity-60" />
            </a>
            <a href="/recordings" className="glass-button-secondary px-10 py-5 text-lg">
              {t("cta.recordings")}
            </a>
          </div>

          <div className="mt-20 grid grid-cols-3 gap-8 border-t border-neutral-200 dark:border-white/5 pt-12 sm:gap-20">
            <div className="text-center">
              <p className="text-gradient block text-4xl font-black sm:text-5xl">2</p>
              <p className="text-xs uppercase tracking-widest text-neutral-500">
                {t("stats.locations")}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gradient block text-4xl font-black sm:text-5xl">30+</p>
              <p className="text-xs uppercase tracking-widest text-neutral-500">
                {t("stats.talks")}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gradient block text-4xl font-black sm:text-5xl">500+</p>
              <p className="text-xs uppercase tracking-widest text-neutral-500">
                {t("stats.attendees")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <a
        href="#events"
        className="absolute bottom-10 z-20 flex flex-col items-center gap-3 text-neutral-500 transition-colors hover:text-brand-400"
        aria-label="Scroll to events"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">{t("scroll")}</span>
        <ChevronDownIcon className="h-6 w-6 animate-bounce opacity-70" />
      </a>
    </section>
  );
}
