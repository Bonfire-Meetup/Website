"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { type CSSProperties, useEffect, useRef, useState } from "react";

import { ArrowRightIcon, BoltIcon, FireIcon, PlayIcon } from "@/components/shared/Icons";
import { LOCATIONS } from "@/lib/config/constants";
import { ENGAGEMENT_BRANDING } from "@/lib/config/engagement-branding";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { usePrefersReducedMotion } from "@/lib/utils/prefers-reduced-motion";

import { CARD_TILT_CLASS, CARD_TILT_STYLE, createCardTiltHandlers } from "../recordings/card-tilt";
import { RecordingImage } from "../recordings/RecordingImage";
import { NeonText } from "../theme/NeonText";
import { Button } from "../ui/Button";

import type { HeroRecording } from "./Hero";
import { HeroBackground } from "./HeroBackground";

interface HeroTalkSelectProps {
  images: { src: string; alt: string }[];
  trendingRecordings?: HeroRecording[];
}

type InputMode = "keyboard" | "gamepad";

const EMPTY_RECORDINGS: HeroRecording[] = [];
const MAX_TALKS = 5;
const AUTO_ADVANCE_MS = 7000;
const GAMEPAD_REPEAT_MS = 260;
const GAMEPAD_STICK_THRESHOLD = 0.6;
const SHELF_STYLE = {
  "--shelf-h": "clamp(15rem, min(30vw, 44vh), 23rem)",
} as CSSProperties;
const TILE_EASING = "ease-[cubic-bezier(0.2,0.85,0.2,1)]";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.closest("[role='dialog'], [role='menu'], [role='listbox']") !== null
  );
}

function isSwipeable(list: HTMLElement): boolean {
  return list.scrollWidth > list.clientWidth + 1;
}

function getCenteredIndex(list: HTMLElement): number {
  const center = list.scrollLeft + list.clientWidth / 2;
  let nearest = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  Array.from(list.children).forEach((child, index) => {
    if (!(child instanceof HTMLElement)) {
      return;
    }

    const distance = Math.abs(child.offsetLeft + child.offsetWidth / 2 - center);

    if (distance < nearestDistance) {
      nearest = index;
      nearestDistance = distance;
    }
  });

  return nearest;
}

function TalkTile({
  recording,
  index,
  isActive,
  showProgress,
  isPaused,
  watchLabel,
  onSelect,
  onProgressEnd,
}: {
  recording: HeroRecording;
  index: number;
  isActive: boolean;
  showProgress: boolean;
  isPaused: boolean;
  watchLabel: string;
  onSelect: () => void;
  onProgressEnd: () => void;
}) {
  const speaker = recording.speaker[0] ?? "";
  const tiltHandlers = createCardTiltHandlers();

  return (
    <li
      className={`group/tile relative aspect-video w-[86%] shrink-0 snap-center motion-safe:animate-[heroTileEnter_640ms_cubic-bezier(0.2,0.85,0.2,1)_both] sm:w-[64%] lg:aspect-auto lg:h-full lg:w-auto lg:min-w-0 lg:transition-[flex-basis,flex-grow] lg:duration-500 ${TILE_EASING} ${
        isActive ? "z-10 lg:flex-[0_1_calc(var(--shelf-h)*16/9)]" : "lg:flex-[1_1_0%]"
      }`}
      style={{ animationDelay: `${120 + index * 70}ms` }}
    >
      <div
        className={`absolute inset-0 overflow-hidden rounded-2xl border ${CARD_TILT_CLASS} ${
          isActive
            ? "border-orange-300/70 shadow-[0_28px_52px_-26px_rgba(17,24,39,0.7)] dark:border-orange-300/45 dark:shadow-[0_30px_56px_-24px_rgba(0,0,0,0.96)]"
            : "border-black/12 shadow-[0_18px_34px_-24px_rgba(17,24,39,0.6)] hover:border-orange-300/55 dark:border-white/12 dark:shadow-[0_18px_34px_-20px_rgba(0,0,0,0.9)]"
        }`}
        style={CARD_TILT_STYLE}
        {...tiltHandlers}
      >
        <RecordingImage
          src={recording.thumbnail}
          alt=""
          className="h-full"
          aspectClassName=""
          imgClassName={`object-[95%_32%] ${
            isActive
              ? ""
              : "lg:brightness-[0.62] lg:saturate-[0.7] lg:group-hover/tile:brightness-90 lg:group-hover/tile:saturate-100"
          }`}
          sizes={isActive ? "(max-width: 1024px) 86vw, 760px" : "(max-width: 1024px) 86vw, 420px"}
          loading="eager"
          fetchPriority={index === 0 ? "high" : "low"}
        />

        <div
          className={`pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-black/85 via-black/20 via-50% to-transparent transition-opacity duration-500 lg:block ${
            isActive ? "opacity-0" : "opacity-100"
          }`}
        />

        <div
          className={`pointer-events-none absolute inset-0 hidden items-end justify-center px-2 pb-4 transition-opacity duration-300 lg:flex ${
            isActive ? "opacity-0" : "opacity-100 delay-150"
          }`}
        >
          <span className="text-2xs tracking-label-sm line-clamp-2 text-center leading-tight font-semibold break-words text-white uppercase">
            {speaker}
          </span>
        </div>

        {isActive && showProgress && (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-black/40">
            <span
              className="block h-full animate-[heroProgress_linear_forwards] bg-gradient-to-r from-orange-400 to-rose-500"
              style={{
                animationDuration: `${AUTO_ADVANCE_MS}ms`,
                animationPlayState: isPaused ? "paused" : "running",
              }}
              onAnimationEnd={onProgressEnd}
            />
          </span>
        )}

        {isActive ? (
          <Link
            href={PAGE_ROUTES.WATCH(recording.slug, recording.shortId)}
            prefetch={false}
            aria-label={`${watchLabel}: ${recording.title}`}
            className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
          />
        ) : (
          <button
            type="button"
            aria-label={speaker ? `${speaker}: ${recording.title}` : recording.title}
            onClick={onSelect}
            className="absolute inset-0 z-10 cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
          />
        )}
      </div>
    </li>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface group relative overflow-hidden px-3.5 py-3 transition-colors hover:border-black/18 dark:hover:border-white/16">
      <span className="text-2xs block font-semibold tracking-wider text-neutral-500 uppercase dark:text-white/54">
        {label}
      </span>
      <span className="mt-1 block text-xl leading-none font-black tracking-tight text-neutral-900 dark:text-white">
        {value}
      </span>
      <div className="pointer-events-none absolute -right-4 -bottom-5 h-12 w-12 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-orange-500/20 blur-lg transition-opacity group-hover:opacity-100 dark:opacity-70" />
    </div>
  );
}

function EngagementCounts({ recording }: { recording: HeroRecording }) {
  const likes = recording.likeCount ?? 0;
  const boosts = recording.boostCount ?? 0;

  if (likes <= 0 && boosts <= 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {boosts > 0 && (
        <span
          className={`inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-bold text-white tabular-nums ${ENGAGEMENT_BRANDING.boost.classes.activeGradient} ${ENGAGEMENT_BRANDING.boost.classes.activeShadow}`}
        >
          <BoltIcon className="h-4 w-4" />
          {boosts}
        </span>
      )}
      {likes > 0 && (
        <span
          className={`inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-bold text-white tabular-nums ${ENGAGEMENT_BRANDING.like.classes.activeGradient} ${ENGAGEMENT_BRANDING.like.classes.activeShadow}`}
        >
          <FireIcon className="h-4 w-4" />
          {likes}
        </span>
      )}
    </div>
  );
}

export function HeroTalkSelect({
  images,
  trendingRecordings = EMPTY_RECORDINGS,
}: HeroTalkSelectProps) {
  const t = useTranslations("hero");
  const tCommon = useTranslations("common");
  const tHeader = useTranslations("header");
  const reducedMotion = usePrefersReducedMotion();

  const talks = trendingRecordings.slice(0, MAX_TALKS);
  const talkCount = talks.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("keyboard");

  const stageRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const scrollTargetRef = useRef<number | null>(null);
  const watchLinkRef = useRef<HTMLAnchorElement | null>(null);
  const isStageVisibleRef = useRef(false);

  const safeIndex = talkCount > 0 ? Math.min(activeIndex, talkCount - 1) : 0;
  const activeTalk = talks[safeIndex];

  const select = (index: number) => {
    setIsAutoAdvancing(false);
    setActiveIndex(index);
  };

  const syncIndexFromScroll = () => {
    const list = listRef.current;

    if (!list || !isSwipeable(list)) {
      return;
    }

    const centered = getCenteredIndex(list);

    if (scrollTargetRef.current !== null) {
      if (centered === scrollTargetRef.current) {
        scrollTargetRef.current = null;
      }

      return;
    }

    setActiveIndex(centered);
  };

  const takeOverScroll = () => {
    scrollTargetRef.current = null;
    setIsAutoAdvancing(false);
  };

  useEffect(() => {
    const list = listRef.current;

    if (!list || !isSwipeable(list) || getCenteredIndex(list) === safeIndex) {
      return;
    }

    const tile = list.children[safeIndex];

    if (!(tile instanceof HTMLElement)) {
      return;
    }

    scrollTargetRef.current = safeIndex;
    list.scrollTo({
      behavior: reducedMotion ? "auto" : "smooth",
      left: tile.offsetLeft - (list.clientWidth - tile.offsetWidth) / 2,
    });
  }, [safeIndex, reducedMotion]);

  useEffect(() => {
    const node = stageRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isStageVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.5 },
    );
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (talkCount <= 1) {
      return;
    }

    const step = (direction: 1 | -1) => {
      setIsAutoAdvancing(false);
      setActiveIndex((prev) => (Math.min(prev, talkCount - 1) + direction + talkCount) % talkCount);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        !isStageVisibleRef.current ||
        isTypingTarget(event.target)
      ) {
        return;
      }

      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        setInputMode("keyboard");
        step(event.key === "ArrowRight" ? 1 : -1);
      } else if (event.key === "Enter" && event.target === document.body) {
        watchLinkRef.current?.click();
      }
    };

    let frame = 0;
    let lastMoveAt = 0;
    let wasConfirmPressed = false;

    const poll = (time: number) => {
      const pad = navigator.getGamepads().find((candidate) => candidate?.connected);

      if (!pad) {
        frame = 0;
        setInputMode("keyboard");

        return;
      }

      if (isStageVisibleRef.current && document.visibilityState === "visible") {
        const stickX = pad.axes[0] ?? 0;
        const goRight = pad.buttons[15]?.pressed || stickX > GAMEPAD_STICK_THRESHOLD;
        const goLeft = pad.buttons[14]?.pressed || stickX < -GAMEPAD_STICK_THRESHOLD;

        if (!goRight && !goLeft) {
          lastMoveAt = 0;
        } else if (time - lastMoveAt > GAMEPAD_REPEAT_MS) {
          lastMoveAt = time;
          setInputMode("gamepad");
          step(goRight ? 1 : -1);
        }

        const isConfirmPressed = pad.buttons[0]?.pressed ?? false;

        if (isConfirmPressed && !wasConfirmPressed) {
          watchLinkRef.current?.click();
        }

        wasConfirmPressed = isConfirmPressed;
      }

      frame = requestAnimationFrame(poll);
    };

    const handleGamepadConnected = () => {
      setInputMode("gamepad");

      if (frame === 0) {
        frame = requestAnimationFrame(poll);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("gamepadconnected", handleGamepadConnected);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("gamepadconnected", handleGamepadConnected);
      cancelAnimationFrame(frame);
    };
  }, [talkCount]);

  const stats = [
    { label: t("stats.locations"), value: t("stats.locationsValue") },
    { label: t("stats.talks"), value: t("stats.talksValue") },
    { label: t("stats.attendees"), value: t("stats.attendeesValue") },
  ];
  const watchPath = activeTalk ? PAGE_ROUTES.WATCH(activeTalk.slug, activeTalk.shortId) : "";
  const activeSpeakers = activeTalk?.speaker.join(", ") ?? "";

  return (
    <section className="relative overflow-clip bg-neutral-50 px-4 pt-24 pb-14 transition-colors duration-500 sm:px-6 sm:pt-32 sm:pb-16 lg:px-8 lg:pt-[clamp(8.5rem,16vh,16rem)] lg:pb-[clamp(5rem,9vh,8rem)] dark:bg-neutral-950">
      <style>{`
        .hero-neon.neon-active {
          -webkit-text-stroke: 2px rgba(139, 92, 246, 0.8);
          text-shadow: 0 0 30px rgba(139, 92, 246, 0.4);
        }
        @keyframes heroTileEnter {
          from { opacity: 0; translate: 0 28px; }
          to { opacity: 1; translate: 0 0; }
        }
        @keyframes heroCaptionIn {
          from { opacity: 0; translate: 0 8px; }
          to { opacity: 1; translate: 0 0; }
        }
      `}</style>
      <HeroBackground images={images.slice(0, 3)} />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_55%_35%,var(--color-fire-start-glow),transparent_58%)] dark:bg-[radial-gradient(circle_at_55%_35%,var(--color-fire-start-glow-dark),transparent_58%)]" />
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 h-24 bg-gradient-to-t from-neutral-50 to-transparent dark:from-neutral-950" />

      <div className="relative z-30 mx-auto w-full max-w-7xl">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="min-w-0">
            <p className="text-2xs tracking-label-lg mb-5 font-semibold text-neutral-500 uppercase dark:text-neutral-400">
              {t("eyebrow")}
            </p>

            <h1 className="flex flex-col items-start text-[clamp(2.8rem,13vw,6rem)] leading-[1.02] font-black tracking-tighter uppercase lg:text-[clamp(3.5rem,min(6.6vw,9.6vh),6.5rem)] lg:leading-[0.91]">
              <span className="text-outline-bold hero-neon neon-active">{t("title.part1")}</span>
              <span className="text-gradient sm:whitespace-nowrap">{t("title.highlight")}</span>
              <NeonText className="text-outline-bold hero-neon">{t("title.part2")}</NeonText>
            </h1>
          </div>

          <div className="lg:w-[27rem] lg:shrink-0 lg:pb-1.5">
            <p className="max-w-lg text-sm leading-relaxed text-neutral-700 sm:text-base lg:text-lg dark:text-neutral-300">
              {t("subtitle", { prague: tCommon("prague"), zlin: tCommon("zlin") })}
            </p>

            <div className="mt-6 hidden grid-cols-3 gap-3 sm:grid">
              {stats.map((stat) => (
                <HeroStat key={stat.label} label={stat.label} value={stat.value} />
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                href="#events"
                variant="hero-primary"
                size="lg"
                external
                className="px-6 py-3 sm:px-8 sm:py-3.5 sm:text-base"
              >
                {t("cta.events")}
              </Button>
              <Button
                href={PAGE_ROUTES.LIBRARY}
                variant="hero-secondary"
                size="lg"
                className="gap-1.5 px-5 py-3 sm:px-6 sm:py-3.5 sm:text-base"
              >
                {tHeader("library")}
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {activeTalk && (
          <div
            ref={stageRef}
            className="shadow-floating relative mt-10 overflow-hidden rounded-[30px] border border-black/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.66)_0%,rgba(255,255,255,0.36)_100%)] p-3 backdrop-blur-xl sm:p-4 lg:mt-[clamp(2.75rem,6vh,6.5rem)] dark:border-white/10 dark:bg-[linear-gradient(160deg,rgba(20,20,22,0.82)_0%,rgba(10,10,11,0.62)_100%)]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
          >
            <div className="pointer-events-none absolute -top-16 right-0 h-36 w-36 rounded-full bg-orange-500/24 blur-3xl dark:bg-orange-500/18" />
            <div className="pointer-events-none absolute -bottom-14 left-2 h-36 w-40 rounded-full bg-orange-500/24 blur-3xl dark:bg-orange-500/16" />

            <p className="text-2xs tracking-label relative mb-3 flex items-center gap-1.5 px-1 font-semibold text-neutral-600 uppercase dark:text-white/65">
              <FireIcon className="h-3.5 w-3.5 text-orange-500" />
              {t("select.label")}
            </p>

            <div className="relative">
              <ul
                ref={listRef}
                aria-label={t("select.label")}
                className="no-scrollbar relative -mx-3 flex snap-x snap-mandatory gap-2.5 overflow-x-auto overflow-y-hidden overscroll-x-contain px-3 pb-3 sm:-mx-4 sm:px-4 lg:mx-0 lg:h-(--shelf-h) lg:snap-none lg:overflow-visible lg:px-0 lg:pb-0"
                style={SHELF_STYLE}
                onScroll={syncIndexFromScroll}
                onTouchStart={takeOverScroll}
                onWheel={(event) => {
                  if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
                    takeOverScroll();
                  }
                }}
              >
                {talks.map((recording, index) => (
                  <TalkTile
                    key={recording.shortId}
                    recording={recording}
                    index={index}
                    isActive={index === safeIndex}
                    showProgress={isAutoAdvancing && !reducedMotion && talkCount > 1}
                    isPaused={isPaused}
                    watchLabel={t("trending.watchNow")}
                    onSelect={() => select(index)}
                    onProgressEnd={() => setActiveIndex((safeIndex + 1) % talkCount)}
                  />
                ))}
              </ul>

              {talkCount > 1 && (
                <div aria-hidden="true" className="flex justify-center gap-1.5 lg:hidden">
                  {talks.map((recording, index) => (
                    <span
                      key={recording.shortId}
                      className={`h-1.5 rounded-full transition-[width] duration-300 ${
                        index === safeIndex
                          ? "w-5 bg-gradient-to-r from-orange-400 to-rose-500"
                          : "w-1.5 bg-black/20 dark:bg-white/25"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="surface relative mt-3 flex flex-col gap-4 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-5">
              <div
                key={activeTalk.shortId}
                aria-live={isAutoAdvancing ? "off" : "polite"}
                className="min-w-0 motion-safe:animate-[heroCaptionIn_320ms_ease-out_both]"
              >
                <p className="text-2xs tracking-label-sm font-semibold text-neutral-500 uppercase dark:text-white/55">
                  {activeSpeakers}
                  <span className="mx-2 text-neutral-400 dark:text-white/25">/</span>
                  {activeTalk.location === LOCATIONS.PRAGUE ? tCommon("prague") : tCommon("zlin")}
                </p>
                <h2 className="mt-1.5 line-clamp-2 text-lg leading-snug font-semibold text-neutral-950 lg:text-xl dark:text-white">
                  {activeTalk.title}
                </h2>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
                {inputMode === "gamepad" && (
                  <span className="text-2xs tracking-label-sm hidden items-center gap-1.5 font-semibold text-emerald-600 uppercase lg:inline-flex dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {t("select.controller")}
                  </span>
                )}
                <EngagementCounts recording={activeTalk} />
                <Link
                  ref={watchLinkRef}
                  href={watchPath}
                  prefetch={false}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 text-sm font-semibold whitespace-nowrap text-white shadow-[0_12px_24px_-14px_rgba(17,24,39,0.7)] transition-[background-color,transform] duration-300 hover:bg-neutral-800 active:scale-[0.99] sm:ml-2 sm:flex-none dark:bg-white dark:text-neutral-950 dark:shadow-none dark:hover:bg-neutral-200"
                >
                  <PlayIcon className="h-4 w-4" />
                  {t("trending.watchNow")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
