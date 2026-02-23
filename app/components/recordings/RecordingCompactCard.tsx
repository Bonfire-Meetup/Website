import type { ReactNode } from "react";

import { type RecordingAccessPolicy } from "@/lib/recordings/early-access";
import { PAGE_ROUTES } from "@/lib/routes/pages";

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

  return (
    <RecordingCardShell
      href={PAGE_ROUTES.WATCH(slug, shortId)}
      prefetch={prefetch}
      ariaLabel={title}
      className={
        className ??
        `group recording-card-enter ${
          staggerClass ? `${staggerClass} opacity-0` : ""
        } relative flex flex-col overflow-hidden ${
          isSmall ? "rounded-[20px]" : "rounded-[24px]"
        } bg-white/90 text-neutral-900 shadow-xl ring-1 shadow-black/5 ring-black/5 transition-all hover:-translate-y-1 dark:bg-neutral-950 dark:text-white dark:shadow-black/10 dark:ring-white/10`
      }
      imageClassName="relative aspect-video w-full overflow-hidden"
      image={
        <>
          <RecordingImage
            src={thumbnail}
            alt={title}
            imgClassName="group-hover:scale-110"
            sizes={imageSizes}
            loading="lazy"
            fetchPriority="low"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </>
      }
      body={
        <div className={`flex flex-1 flex-col ${isSmall ? "p-3.5" : "p-4"}`}>
          <div className="flex flex-1 flex-col justify-start">
            <h3
              className={`group-hover:text-brand-500 dark:group-hover:text-brand-400 line-clamp-2 ${
                isSmall ? "text-[13px]" : "text-sm"
              } leading-snug font-semibold text-neutral-900 transition-colors dark:text-white`}
            >
              {title}
            </h3>
            {showInlineAccessPill ? (
              <RecordingAccessPill access={access} className="mt-1.5 w-fit" />
            ) : null}
            <RecordingSpeakerList
              speakers={speaker}
              className="mt-2 flex flex-col gap-1"
              itemClassName="flex items-center gap-2"
              dotClassName="bg-brand-500 dark:bg-brand-400 h-1 w-1 shrink-0 rounded-full shadow-[0_0_4px_var(--color-brand-glow-light)]"
              textClassName={`truncate ${isSmall ? "text-[10px]" : "text-[11px]"} font-medium text-neutral-500 dark:text-neutral-400`}
            />
          </div>
          {footer ? (
            <div
              className={`flex items-center justify-between border-t border-neutral-100 dark:border-white/5 ${
                isSmall ? "mt-3 pt-2.5" : "mt-4 pt-3"
              }`}
            >
              {footer}
            </div>
          ) : null}
        </div>
      }
    />
  );
}
