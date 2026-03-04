import type { AnimationEvent, ReactNode } from "react";

import { type RecordingAccessPolicy } from "@/lib/recordings/early-access";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import {
  CARD_MEDIA_PARALLAX_BASE_CLASS,
  CARD_MEDIA_PARALLAX_HOVER_CLASS,
  CARD_TILT_CLASS,
  CARD_TILT_STYLE,
  createCardTiltHandlers,
} from "./card-tilt";
import { RecordingAccessPill } from "./RecordingAccessPill";
import { RecordingCardShell } from "./RecordingCardShell";
import { RecordingImage } from "./RecordingImage";
import { RecordingSpeakerList } from "./RecordingSpeakerList";

interface RecordingCompactCardProps {
  shortId: string;
  slug: string;
  title: string;
  thumbnail: string;
  speaker: string[];
  access?: RecordingAccessPolicy;
  footer?: ReactNode;
  prefetch?: boolean;
  imageSizes?: string;
  className?: string;
  staggerIndex?: number;
  showInlineAccessPill?: boolean;
  size?: "md" | "sm";
}

export function RecordingCompactCard({
  shortId,
  slug,
  title,
  thumbnail,
  speaker,
  access,
  footer,
  prefetch = false,
  imageSizes = "(max-width: 1024px) 50vw, 360px",
  className,
  staggerIndex,
  showInlineAccessPill = true,
  size = "md",
}: RecordingCompactCardProps) {
  const staggerClass = typeof staggerIndex === "number" ? `stagger-${(staggerIndex % 8) + 1}` : "";
  const isSmall = size === "sm";
  const tiltHandlers = createCardTiltHandlers();
  const handleAnimationEnd = (event: AnimationEvent<HTMLElement>) => {
    const card = event.currentTarget;
    card.classList.remove("recording-card-enter");
    card.classList.remove("opacity-0");
    if (staggerClass) {
      card.classList.remove(staggerClass);
    }
  };

  return (
    <RecordingCardShell
      href={PAGE_ROUTES.WATCH(slug, shortId)}
      prefetch={prefetch}
      ariaLabel={title}
      style={CARD_TILT_STYLE}
      {...tiltHandlers}
      onAnimationEnd={handleAnimationEnd}
      className={
        className ??
        `group recording-card-enter ${
          staggerClass ? `${staggerClass} opacity-0` : ""
        } ${CARD_TILT_CLASS} relative flex flex-col overflow-hidden ${
          isSmall ? "rounded-[14px]" : "rounded-[16px]"
        } bg-[linear-gradient(180deg,rgba(249,250,251,0.98)_0%,rgba(229,231,235,0.98)_100%)] text-white shadow-[0_16px_30px_-20px_rgba(17,24,39,0.35)] ring-1 ring-black/10 transition-[box-shadow,ring-color,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_24px_40px_-20px_rgba(17,24,39,0.45)] hover:ring-black/20 hover:saturate-110 dark:bg-[linear-gradient(180deg,rgba(20,20,22,0.98)_0%,rgba(12,12,13,1)_100%)] dark:shadow-[0_18px_38px_-18px_rgba(0,0,0,0.9)] dark:ring-white/12 dark:hover:shadow-[0_30px_52px_-20px_rgba(0,0,0,0.95)] dark:hover:ring-white/20`
      }
      imageClassName="relative aspect-video w-full overflow-hidden"
      image={
        <>
          <RecordingImage
            src={thumbnail}
            alt={title}
            imgClassName={`duration-200 ease-out ${CARD_MEDIA_PARALLAX_BASE_CLASS} ${CARD_MEDIA_PARALLAX_HOVER_CLASS}`}
            sizes={imageSizes}
            loading="lazy"
            fetchPriority="low"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/12 via-transparent to-transparent dark:from-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/52 via-black/20 via-62% to-transparent transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:from-black/40 dark:from-black/70 dark:via-black/34 dark:group-hover:from-black/56" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/18 to-transparent dark:from-white/6" />
        </>
      }
      bodyClassName="pointer-events-none absolute inset-0 z-10 flex items-end"
      body={
        <div className="pointer-events-none flex h-full w-full items-end bg-gradient-to-t from-black/72 via-black/34 to-transparent text-white dark:from-black/86 dark:via-black/52">
          <div
            className={
              isSmall
                ? "w-full space-y-1.5 px-3.5 pt-12 pb-3.5"
                : "w-full space-y-2 px-4 pt-14 pb-4"
            }
          >
            <div className="flex flex-col justify-start">
              <h3
                className={`line-clamp-2 ${
                  isSmall ? "text-[13px]" : "text-sm"
                } leading-[1.28] font-semibold tracking-[-0.01em] text-white`}
              >
                {title}
              </h3>
              {showInlineAccessPill ? (
                <RecordingAccessPill access={access} className="mt-1.5 w-fit" />
              ) : null}
              <RecordingSpeakerList
                speakers={speaker.slice(0, 2)}
                className="mt-1.5 flex flex-col gap-1"
                itemClassName="flex items-center gap-2"
                dotClassName="bg-brand-400 h-1 w-1 shrink-0 rounded-full shadow-[0_0_4px_var(--color-brand-glow-light)]"
                textClassName={`truncate ${isSmall ? "text-[10px]" : "text-[11px]"} font-medium text-white/80`}
              />
            </div>
            {footer ? (
              <div
                className={`flex items-center justify-between ${
                  isSmall ? "mt-1.5 pt-0.5" : "mt-2 pt-1"
                }`}
              >
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      }
    />
  );
}
