import type { ReactNode } from "react";

import { Skeleton } from "@/components/shared/Skeletons";

import { HERO_SECTION_CLASS, type HeroSectionPreset } from "./hero-presets";

interface StaticPageHeroSkeletonProps {
  containerClassName?: string;
  sectionPreset?: HeroSectionPreset;
  subtitle?: ReactNode;
  subtitleClassName?: string;
  titleClassName?: string;
}

export function StaticPageHeroSkeleton({
  containerClassName = "mx-auto max-w-3xl text-center",
  sectionPreset = "default",
  subtitle,
  subtitleClassName = "mx-auto h-5 w-full max-w-2xl",
  titleClassName = "mx-auto mb-3 h-12 w-64 sm:h-14 sm:w-80",
}: StaticPageHeroSkeletonProps) {
  return (
    <section className={HERO_SECTION_CLASS[sectionPreset]}>
      <div className={`relative z-10 ${containerClassName}`}>
        <div className="mb-4 flex items-center justify-center gap-3">
          <Skeleton className="h-px w-10 rounded-full" />
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="h-px w-10 rounded-full" />
        </div>
        <Skeleton className={titleClassName} />
        {subtitle ?? <Skeleton className={subtitleClassName} />}
      </div>
    </section>
  );
}
