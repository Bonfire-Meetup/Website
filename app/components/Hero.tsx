import Image from "next/image";
import { getTranslations } from "next-intl/server";

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
  const collageImages = shuffleImages(uniqueImages).slice(0, 4);

  return (
    <section className="gradient-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-70 dark:hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(244, 196, 91, 0.12) 0%, rgba(224, 77, 58, 0.06) 38%, rgba(10, 10, 10, 0) 60%), linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.15) 30%, rgba(255, 255, 255, 0) 65%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 hidden opacity-80 dark:block"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(224, 77, 58, 0.08) 42%, rgba(10, 10, 10, 0) 70%), linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 35%, rgba(255, 255, 255, 0) 70%)`,
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="text-center lg:text-left">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-brand-500/80">
            {t("eyebrow")}
          </p>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl md:text-6xl dark:text-white">
            {t("title.part1")} <span className="text-gradient">{t("title.highlight")}</span>{" "}
            {t("title.part2")}
          </h1>

          <p className="mb-10 max-w-xl text-lg leading-relaxed text-neutral-600 sm:text-xl dark:text-neutral-300">
            {t("subtitle")}
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
            <a href="#events" className="glass-button">
              {t("cta.events")}
            </a>
            <a
              href="/recordings"
              className="glass-button-secondary flex items-center justify-center gap-2"
            >
              {t("cta.recordings")}
            </a>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-6 lg:justify-start">
            <div className="stat-card min-w-[120px] text-center lg:text-left">
              <p className="text-gradient text-4xl font-bold sm:text-5xl">2</p>
              <p className="mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {t("stats.locations")}
              </p>
            </div>
            <div className="stat-card min-w-[120px] text-center lg:text-left">
              <p className="text-gradient text-4xl font-bold sm:text-5xl">30+</p>
              <p className="mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {t("stats.talks")}
              </p>
            </div>
            <div className="stat-card min-w-[120px] text-center lg:text-left">
              <p className="text-gradient text-4xl font-bold sm:text-5xl">500+</p>
              <p className="mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {t("stats.attendees")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:gap-5">
          {collageImages[0] && (
            <div className="glass-card relative col-span-2 aspect-[4/3] overflow-hidden sm:col-span-1 sm:aspect-[5/4] lg:col-span-4 lg:row-span-2 lg:aspect-auto lg:min-h-[420px]">
              <Image
                src={collageImages[0].src}
                alt={collageImages[0].alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent" />
            </div>
          )}
          {collageImages[1] && (
            <div className="glass-card relative col-span-1 aspect-[4/3] overflow-hidden sm:col-span-1 lg:col-span-2 lg:aspect-[4/5]">
              <Image
                src={collageImages[1].src}
                alt={collageImages[1].alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 50vw, 20vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
          )}
          {collageImages[2] && (
            <div className="glass-card relative col-span-1 aspect-[4/3] overflow-hidden sm:col-span-1 lg:col-span-2 lg:aspect-[4/5]">
              <Image
                src={collageImages[2].src}
                alt={collageImages[2].alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 50vw, 20vw"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent" />
            </div>
          )}
          {collageImages[3] && (
            <div className="glass-card relative col-span-2 aspect-[16/9] overflow-hidden sm:col-span-2 lg:col-span-6">
              <Image
                src={collageImages[3].src}
                alt={collageImages[3].alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent" />
            </div>
          )}
        </div>
      </div>

      <a
        href="#events"
        className="absolute bottom-10 flex flex-col items-center gap-2 text-neutral-400 transition-all duration-300 hover:text-brand-500"
        aria-label="Scroll to events"
      >
        <span className="text-xs font-medium uppercase tracking-widest">{t("scroll")}</span>
        <ChevronDownIcon className="h-5 w-5 animate-bounce" />
      </a>
    </section>
  );
}
